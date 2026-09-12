/** CSS preset. Runs the plain lexer, then post-processes to mark declarations
 * (property before a `:` inside a block) and rejoin `--dashed-names`. */
import { T_BREAK, T_CLASS, T_COMMENT, T_IDENTIFIER, T_PROPERTY, T_SIGN, T_SPACE, type Token } from '../shared.js'
import { tokenize as tokenizePlain, type ParseOptions } from '../core.js'

export const keywords = new Set([
  '@media', '@import', '@keyframes', '@font-face', '@supports', '@page', '@counter-style',
  '@font-feature-values', '@viewport', '@document', '@namespace', '@charset', '@layer', '@container',
])

export const onCommentStart = (curr: string, next: string): number => (curr + next === '/*' ? 1 : 0)
export const onCommentEnd = (prev: string, curr: string): number => (prev + curr === '*/' ? 1 : 0)

export const onLiteral = (curr: string, index: number, code: string): number => {
  if (curr !== '#') return 0
  return (
    code
      .slice(index)
      .match(/^#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})(?![\w-])/i)?.[0].length || 0
  )
}

const isIgnored = (type: number): boolean => type === T_SPACE || type === T_BREAK || type === T_COMMENT
const isPropertyPart = ([type, value]: Token): boolean =>
  type === T_IDENTIFIER || type === T_CLASS || (type === T_SIGN && value === '-')
const isNamePart = ([type]: Token): boolean =>
  type === T_IDENTIFIER || type === T_CLASS || type === T_PROPERTY
const isNameStart = (token: Token): boolean => isNamePart(token) && !/^\d/.test(token[1])
const isHyphen = ([type, value]: Token): boolean => type === T_SIGN && value === '-'

/** Rejoin CSS dashed identifiers split by the shared punctuation lexer. */
export const mergeDashedNames = (tokens: Token[]): void => {
  for (let index = 0; index < tokens.length; index++) {
    let firstWord = index
    let end = index

    if (isHyphen(tokens[end]!)) {
      while (tokens[end] && isHyphen(tokens[end]!)) end++
      if (!tokens[end] || !isNameStart(tokens[end]!)) continue
      firstWord = end++
    } else if (isNameStart(tokens[end]!)) {
      end++
    } else {
      continue
    }

    let dashed = firstWord > index
    while (tokens[end] && isHyphen(tokens[end]!)) {
      const hyphenStart = end
      while (tokens[end] && isHyphen(tokens[end]!)) end++
      if (!tokens[end] || !isNamePart(tokens[end]!)) {
        end = hyphenStart
        break
      }
      dashed = true
      end++
    }

    if (!dashed) continue
    const name = tokens.slice(index, end).map(([, value]) => value).join('')
    tokens.splice(index, end - index, [tokens[firstWord]![0], name])
  }
}

/** True when a colon opens a nested block (selector) rather than a declaration. */
const opensBlock = (tokens: Token[], start: number): boolean => {
  let parentheses = 0
  let brackets = 0
  for (let index = start; index < tokens.length; index++) {
    const [type, value] = tokens[index]!
    if (type !== T_SIGN) continue
    if (value === '(') parentheses++
    else if (value === ')') parentheses--
    else if (value === '[') brackets++
    else if (value === ']') brackets--
    else if (!parentheses && !brackets && value === '{') return true
    else if (!parentheses && !brackets && (value === ';' || value === '}')) return false
  }
  return false
}

/** Mark `property:` declarations inside brace blocks. Shared with SCSS. */
export const cssDeclarationPass = (tokens: Token[]): void => {
  let blockDepth = 0
  let declarationStart = false

  for (let index = 0; index < tokens.length; index++) {
    const [type, value] = tokens[index]!

    if (type === T_SIGN && value === '{') {
      blockDepth++
      declarationStart = true
      continue
    }
    if (type === T_SIGN && value === '}') {
      blockDepth--
      declarationStart = false
      continue
    }
    if (type === T_SIGN && value === ';') {
      declarationStart = blockDepth > 0
      continue
    }
    if (!declarationStart || isIgnored(type)) continue

    const propertyStart = index
    let propertyEnd = index
    while (propertyEnd < tokens.length && isPropertyPart(tokens[propertyEnd]!)) propertyEnd++
    let colon = propertyEnd
    while (colon < tokens.length && isIgnored(tokens[colon]![0])) colon++

    if (
      propertyEnd > propertyStart &&
      tokens[colon]?.[0] === T_SIGN &&
      tokens[colon]![1] === ':' &&
      !opensBlock(tokens, colon + 1)
    ) {
      const property = tokens
        .slice(propertyStart, propertyEnd)
        .map(([, part]) => part)
        .join('')
      tokens.splice(propertyStart, propertyEnd - propertyStart, [T_PROPERTY, property])
    }
    declarationStart = false
  }
}

/** Add CSS declaration context after the shared plain lexer runs. */
export const tokenize = (code: string, options?: ParseOptions): Token[] => {
  const tokens = tokenizePlain(code, { ...options, tokenize: undefined })
  mergeDashedNames(tokens)
  cssDeclarationPass(tokens)
  return tokens
}

export const config: ParseOptions = {
  keywords,
  onCommentStart,
  onCommentEnd,
  onLiteral,
  tokenize,
}
