/** Reusable comment-scanner bases shared by keyword-based language presets. */
import type { ParseOptions } from '../core.js'

export type LinePrefix = '//' | '#' | '--'
export interface CommentStyle {
  /** Line-comment prefixes (each closes at newline). */
  line?: LinePrefix[]
  /** C-style block comment `/* … *\/` (closes at the matching terminator). */
  block?: boolean
}

/** Build onCommentStart/onCommentEnd for a mix of line + block comment styles.
 * Line comments open as type 1 and close at `\n`; block comments open as type 2
 * and close at the terminator — so a single onCommentEnd serves both. */
export function commentRules(style: CommentStyle): Pick<ParseOptions, 'onCommentStart' | 'onCommentEnd'> {
  const line = style.line ?? []
  const hasSlash = line.includes('//')
  const hasHash = line.includes('#')
  const hasDash = line.includes('--')
  const block = style.block ?? false

  return {
    onCommentStart(curr, next) {
      if (block && curr === '/' && next === '*') return 2
      if (hasSlash && curr === '/' && next === '/') return 1
      if (hasHash && curr === '#') return 1
      if (hasDash && curr === '-' && next === '-') return 1
      return 0
    },
    onCommentEnd(prev, curr) {
      if (curr === '\n') return 1
      if (block && prev === '*' && curr === '/') return 2
      return 0
    },
  }
}

export interface KeywordLangSpec {
  keywords?: string[]
  typeKeywords?: string[]
  comments?: CommentStyle
  caseInsensitive?: boolean
}

/** Assemble a keyword-based language config over the shared general lexer. */
export function keywordLang(spec: KeywordLangSpec): ParseOptions {
  const config: ParseOptions = {}
  if (spec.keywords) config.keywords = new Set(spec.keywords)
  if (spec.typeKeywords) config.typeKeywords = new Set(spec.typeKeywords)
  if (spec.caseInsensitive) config.caseInsensitive = true
  if (spec.comments) Object.assign(config, commentRules(spec.comments))
  return config
}
