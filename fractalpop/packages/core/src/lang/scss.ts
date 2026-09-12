/** SCSS — CSS brace/semicolon structure plus Sass features ($vars, @rules, %placeholder,
 * #{} interpolation, // line comments, math, !flags). Structure is CSS's; symbols are Sass's. */
import type { Token } from '../shared.js'
import { tokenize as tokenizePlain, type ParseOptions } from '../core.js'
import { mergeDashedNames, cssDeclarationPass, onLiteral } from './css.js'
import { applySassSymbols } from '../presets/sass-values.js'

export const onCommentStart = (curr: string, next: string): number =>
  curr === '/' && next === '*' ? 2 : curr === '/' && next === '/' ? 1 : 0
export const onCommentEnd = (prev: string, curr: string): number =>
  curr === '\n' ? 1 : prev === '*' && curr === '/' ? 2 : 0

export const tokenize = (code: string, options?: ParseOptions): Token[] => {
  const tokens = tokenizePlain(code, {
    ...options,
    tokenize: undefined,
    onCommentStart,
    onCommentEnd,
    onLiteral,
  })
  mergeDashedNames(tokens)
  cssDeclarationPass(tokens)
  applySassSymbols(tokens)
  return tokens
}

export const config: ParseOptions = { onCommentStart, onCommentEnd, onLiteral, tokenize }
