/**
 * fractalpop core — token model, line assembly, and rendering.
 *
 * Design: tokens are numeric `[type, value]` pairs during lexing (fast Set/array
 * work); the string type names are resolved only at render. Output is an HTML
 * string with no DOM required — so SSR and client produce identical markup.
 */

/** The stable, ordered token-type list. This list is the theming contract:
 * each type maps to one CSS variable `--fp-<type>` and one class `fp__token--<type>`. */
export const TokenTypes = [
  'identifier',
  'keyword',
  'string',
  'class',
  'property',
  'entity',
  'jsxliterals',
  'sign',
  'comment',
  'break',
  'space',
] as const

export type TokenType = (typeof TokenTypes)[number]

// Numeric indices, used everywhere in the hot path.
export const T_IDENTIFIER = 0
export const T_KEYWORD = 1
export const T_STRING = 2
export const T_CLASS = 3
export const T_PROPERTY = 4
export const T_ENTITY = 5
export const T_JSX_LITERALS = 6
export const T_SIGN = 7
export const T_COMMENT = 8
export const T_BREAK = 9
export const T_SPACE = 10

/** A lexer emits these: `[numericType, value]`. */
export type Token = [number, string]

export const FractalPop = {
  TokenTypes,
  TokenMap: new Map<TokenType, number>(TokenTypes.map((type, index) => [type, index])),
} as const

export interface ParsedToken {
  type: TokenType
  value: string
}

export interface ParsedLine {
  index: number
  value: string
  tokens: ParsedToken[]
  annotations: string[]
}

export interface ParsedCode {
  value: string
  lines: ParsedLine[]
}

/** Mutable token handed to `mark`. Hooks may change className/style/properties. */
export interface MarkToken {
  type: TokenType
  value: string
  className: string
  style: Record<string, string | number>
  properties: Record<string, string | number | boolean>
}

/** Mutable line handed to `markLine`. Hooks may change className/style/properties. */
export interface MarkLine {
  index: number
  value: string
  tokens: ParsedToken[]
  annotations: string[]
  className: string
  style: Record<string, string | number>
  properties: Record<string, string | number | boolean>
}

export interface DisplayOptions {
  /** Extra class name appended per token type, e.g. `{ keyword: 'font-bold' }`. */
  cx?: Partial<Record<TokenType, string>>
  /** Mutate a single token before it renders. */
  mark?: (token: MarkToken) => void
  /** Mutate a whole line before it renders (used for line highlighting). */
  markLine?: (line: MarkLine) => void
}

/** Split a flat token stream into lines, handling embedded newlines. */
export function assemble(value: string, tokens: Token[]): ParsedCode {
  const lines: ParsedLine[] = []
  let lineIndex = 0
  const lineTokens: Token[] = []
  let lastWasBreak = false

  function flushLine(tokens: Token[]): void {
    lines.push({
      index: lineIndex++,
      value: tokens.map(([, tokenValue]) => tokenValue).join(''),
      tokens: tokens.map(([type, tokenValue]) => ({
        type: TokenTypes[type]!,
        value: tokenValue,
      })),
      annotations: [],
    })
  }

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!
    const [type, tokenValue] = token
    if (type !== T_BREAK) {
      if (tokenValue.includes('\n')) {
        const values = tokenValue.split('\n')
        for (let part = 0; part < values.length; part++) {
          lineTokens.push([type, values[part]!])
          if (part < values.length - 1) {
            flushLine(lineTokens)
            lineTokens.length = 0
          }
        }
      } else {
        lineTokens.push(token)
      }
      lastWasBreak = false
    } else {
      if (lastWasBreak) {
        flushLine([])
      } else {
        flushLine(lineTokens)
        lineTokens.length = 0
      }
      if (index === tokens.length - 1) flushLine([])
      lastWasBreak = true
    }
  }

  if (lineTokens.length) flushLine(lineTokens)
  return { value, lines }
}

function lineClassName(annotations: string[]): string {
  return `fp__line${annotations.map((annotation) => ` fp__line--${annotation}`).join('')}`
}

function createLine(parsedLine: ParsedLine, markLine: DisplayOptions['markLine']): MarkLine {
  const line: MarkLine = {
    index: parsedLine.index,
    value: parsedLine.value,
    tokens: parsedLine.tokens,
    annotations: parsedLine.annotations,
    className: lineClassName(parsedLine.annotations),
    style: {},
    properties: {},
  }
  markLine?.(line)
  return line
}

function createToken(
  { type, value }: ParsedToken,
  cx: DisplayOptions['cx'],
  mark: DisplayOptions['mark'],
): MarkToken {
  const extraClassName = cx?.[type]
  const token: MarkToken = {
    type,
    value,
    className: `fp__token--${type}${extraClassName ? ` ${extraClassName}` : ''}`,
    style: { color: `var(--fp-${type})` },
    properties: {},
  }
  mark?.(token)
  return token
}

/** hast-like AST node (element or text). Consumed by the remark adapter. */
export interface AstText {
  type: 'text'
  value: string
}
export interface AstElement {
  type: 'element'
  tagName: string
  tokenType?: TokenType
  children: Array<AstElement | AstText>
  properties: Record<string, unknown>
}

/** Build a hast-like AST (one element per line, one per token). For unified/hast pipelines. */
export function generate(parsed: ParsedCode, options?: DisplayOptions): AstElement[] {
  const cx = options?.cx
  const mark = options?.mark
  const markLine = options?.markLine

  return parsed.lines.map((parsedLine) => {
    const line = createLine(parsedLine, markLine)
    return {
      type: 'element',
      tagName: 'span',
      children: parsedLine.tokens.map((parsedToken): AstElement => {
        const token = createToken(parsedToken, cx, mark)
        return {
          type: 'element',
          tokenType: token.type,
          tagName: 'span',
          children: [{ type: 'text', value: token.value }],
          properties: {
            ...token.properties,
            className: token.className,
            style: token.style,
          },
        }
      }),
      properties: {
        ...line.properties,
        className: line.className,
        style: line.style,
      },
    }
  })
}

/** Render parsed lines to an HTML string. Fast path when no display hooks are set. */
export function render(parsed: ParsedCode, options?: DisplayOptions): string {
  const cx = options?.cx
  const mark = options?.mark
  const markLine = options?.markLine

  // Fast path: no per-token object allocation, straight string concat.
  if (!cx && !mark && !markLine) {
    return parsed.lines
      .map((line) => {
        const className = lineClassName(line.annotations)
        const children = line.tokens
          .map(
            ({ type, value }) =>
              `<span class="fp__token--${type}" style="color:var(--fp-${type})">${encode(value)}</span>`,
          )
          .join('')
        return `<span class="${encode(className)}">${children}</span>`
      })
      .join('\n')
  }

  // Hook path: build mutable objects and run cx/mark/markLine.
  return parsed.lines
    .map((parsedLine) => {
      const line = createLine(parsedLine, markLine)
      const children = parsedLine.tokens
        .map((parsedToken) => {
          const token = createToken(parsedToken, cx, mark)
          return `<span ${attributes({
            ...token.properties,
            className: token.className,
            style: token.style,
          })}>${encode(token.value)}</span>`
        })
        .join('')
      return `<span ${attributes({
        ...line.properties,
        className: line.className,
        style: line.style,
      })}>${children}</span>`
    })
    .join('\n')
}

const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
}

export const encode = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => entities[character]!)

function attributes(values: Record<string, unknown>): string {
  const styleValue = (values.style ?? {}) as Record<string, unknown>
  const style = Object.entries(styleValue)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${value}`)
    .join(';')
  const properties = Object.entries(values)
    .filter(
      ([key, value]) =>
        /^[\w:-]+$/.test(key) && key !== 'className' && key !== 'style' && value !== false && value != null,
    )
    .map(([key, value]) => (value === true ? key : `${key}="${encode(String(value))}"`))
    .join(' ')
  const className = (values.className as string) || ''
  return `class="${encode(className)}"${style ? ` style="${encode(style)}"` : ''}${properties ? ` ${properties}` : ''}`
}
