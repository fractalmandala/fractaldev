/**
 * fractalpop core — the general-purpose lexer and `parse`.
 *
 * A single left-to-right scan classifies keyword/string/comment/sign languages.
 * Complex languages (CSS, Sass, Svelte) supply a `tokenize` override that runs
 * this plain lexer and then post-processes the token array.
 */

import {
  assemble,
  generate,
  render,
  FractalPop,
  T_BREAK,
  T_CLASS,
  T_COMMENT,
  T_IDENTIFIER,
  T_KEYWORD,
  T_PROPERTY,
  T_SIGN,
  T_SPACE,
  T_STRING,
  type ParsedCode,
  type ParsedLine,
  type Token,
} from './shared.js'

export interface ParseOptions {
  keywords?: Set<string>
  typeKeywords?: Set<string>
  onCommentStart?: (curr: string, next: string, index: number, code: string) => number | boolean
  onCommentEnd?: (
    prev: string,
    curr: string,
    index: number,
    code: string,
    start: number,
  ) => number | boolean
  onLiteral?: (curr: string, index: number, code: string) => number | null | undefined
  onQuote?: (curr: string, index: number, code: string) => number | null | undefined
  quotedKeys?: boolean
  caseInsensitive?: boolean
  templateStrings?: boolean
  /** JS runtime: enable JSX tag parsing. */
  jsx?: boolean
  /** JS runtime: enable regex-literal detection. */
  regex?: boolean
  /** JS runtime: force TypeScript keyword set (else heuristic detection). */
  typescript?: boolean
  /** Full tokenize override for complex languages. */
  tokenize?: (code: string, options: ParseOptions) => Token[]
  /** Per-line annotation hook (adds classes like `fp__line--<annotation>`). */
  annotateLine?: (line: ParsedLine) => void
}

const signs = new Set('+-*/%=!&|^~?:.,;()[]{}<>#@\\'.split(''))
const noComment = () => 0

const isWord = (value: string): boolean =>
  value === '_' || value === '$' || /[\p{L}\p{N}]/u.test(value)

function isQuotedKey(code: string, index: number): boolean {
  while (index < code.length && /\s/.test(code[index]!)) index++
  return code[index] === ':'
}

/** General lexer. Returns `[numericType, value]` pairs. */
export function tokenize(code: string, options?: ParseOptions): Token[] {
  if (typeof options?.tokenize === 'function') return options.tokenize(code, options)

  const keywords = options?.keywords || new Set<string>()
  const typeKeywords = options?.typeKeywords || new Set<string>()
  const onCommentStart = options?.onCommentStart || noComment
  const onCommentEnd = options?.onCommentEnd || noComment
  const normalize = options?.caseInsensitive
    ? (value: string) => value.toLowerCase()
    : (value: string) => value

  const tokens: Token[] = []
  let lastSignificant = ''

  function append(type: number, value: string): void {
    if (!value) return
    tokens.push([type, value])
    if (type !== T_SPACE && type !== T_BREAK) lastSignificant = value
  }

  for (let i = 0; i < code.length; ) {
    const curr = code[i]!
    const next = code[i + 1] ?? ''

    const commentType = onCommentStart(curr, next, i, code)
    if (commentType) {
      const start = i++
      while (i < code.length) {
        if (onCommentEnd(code[i - 1]!, code[i]!, i, code, start) == commentType) {
          i++
          break
        }
        i++
      }
      append(T_COMMENT, code.slice(start, i))
      continue
    }

    const literalLength = options?.onLiteral?.(curr, i, code)
    if (literalLength) {
      append(T_STRING, code.slice(i, i + literalLength))
      i += literalLength
      continue
    }

    if (typeof options?.onQuote === 'function' && curr === "'") {
      const length = options.onQuote(curr, i, code)
      if (typeof length === 'number' && length >= 1) {
        append(T_IDENTIFIER, code.slice(i, i + length))
        i += length
        continue
      }
    }

    if (curr === '"' || curr === "'" || (options?.templateStrings && curr === '`')) {
      const quote = curr
      const start = i++
      while (i < code.length) {
        if (code[i] === quote && code[i - 1] !== '\\') {
          i++
          break
        }
        i++
      }
      const value = code.slice(start, i)
      append(options?.quotedKeys && isQuotedKey(code, i) ? T_PROPERTY : T_STRING, value)
      continue
    }

    if (curr === '\n') {
      append(T_BREAK, curr)
      i++
      continue
    }

    if (/[^\S\r\n]/.test(curr)) {
      const start = i++
      while (i < code.length && /[^\S\r\n]/.test(code[i]!)) i++
      append(T_SPACE, code.slice(start, i))
      continue
    }

    if (isWord(curr)) {
      const start = i++
      while (i < code.length && isWord(code[i]!)) i++
      if (/^\d/.test(curr) && code[i] === '.' && /\d/.test(code[i + 1] || '')) {
        i++
        while (i < code.length && isWord(code[i]!)) i++
      }
      const value = code.slice(start, i)
      const normalized = normalize(value)
      const type = typeKeywords.has(normalized)
        ? T_CLASS
        : keywords.has(normalized)
          ? T_KEYWORD
          : lastSignificant === '.'
            ? T_PROPERTY
            : /^\d/.test(value) || value === 'null' || /^\p{Lu}/u.test(value)
              ? T_CLASS
              : T_IDENTIFIER
      append(type, value)
      continue
    }

    if (signs.has(curr)) {
      append(T_SIGN, curr)
      i++
      continue
    }

    append(T_STRING, curr)
    i++
  }

  return tokens
}

/** Tokenize + assemble into lines, running any per-line annotation hook. */
export function parse(code: string, options?: ParseOptions): ParsedCode {
  const parsed = assemble(code, tokenize(code, options))
  if (options?.annotateLine) {
    for (const line of parsed.lines) options.annotateLine(line)
  }
  return parsed
}

export { generate, render, FractalPop }
