/** Indented pure Sass (.sass) — no braces, no semicolons; structure is indentation.
 * A line-oriented tokenizer classifies each line from its indent + leading token,
 * then lexes the content. The property/selector colon ambiguity is resolved by
 * looking ahead at the next line's indent (a selector has deeper-indented children;
 * a bare declaration does not). See SPEC §6. */
import {
  T_BREAK,
  T_CLASS,
  T_COMMENT,
  T_ENTITY,
  T_PROPERTY,
  T_SIGN,
  T_SPACE,
  type Token,
} from '../shared.js'
import { tokenize as tokenizePlain, type ParseOptions } from '../core.js'
import { onLiteral } from './css.js'
import { applySassSymbols } from '../presets/sass-values.js'

const onCommentStart = (curr: string, next: string): number =>
  curr === '/' && next === '*' ? 2 : curr === '/' && next === '/' ? 1 : 0
const onCommentEnd = (prev: string, curr: string): number =>
  curr === '\n' ? 1 : prev === '*' && curr === '/' ? 2 : 0

/** Lex a run of inline Sass content (a value or a selector) and color its symbols. */
function lexInline(text: string): Token[] {
  const tokens = tokenizePlain(text, { onCommentStart, onCommentEnd, onLiteral })
  applySassSymbols(tokens)
  return tokens
}

/** In a selector line, promote `.name` / `#name` to class coloring. */
function retagSelector(tokens: Token[]): void {
  for (let i = 0; i < tokens.length; i++) {
    const [type, value] = tokens[i]!
    if (type === T_SIGN && (value === '.' || value === '#')) {
      const next = tokens[i + 1]
      if (next && next[0] !== T_SPACE && next[0] !== T_BREAK) next[0] = T_CLASS
    }
  }
}

const leadingWhitespace = (line: string): string => line.match(/^[ \t]*/)?.[0] ?? ''

export const tokenize = (code: string): Token[] => {
  const out: Token[] = []
  const lines = code.split('\n')

  // Indent length of each non-blank line (-1 for blank), for child lookahead.
  const indents = lines.map((line) => (line.trim() === '' ? -1 : leadingWhitespace(line).length))
  const hasChildren = (index: number): boolean => {
    const own = indents[index]!
    for (let j = index + 1; j < lines.length; j++) {
      const next = indents[j]!
      if (next === -1) continue
      return next > own
    }
    return false
  }

  let inBlockComment = false

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l]!
    const indent = leadingWhitespace(line)
    const content = line.slice(indent.length)
    if (indent) out.push([T_SPACE, indent])

    if (inBlockComment) {
      out.push([T_COMMENT, content])
      if (content.includes('*/')) inBlockComment = false
    } else if (content === '') {
      // blank line — only the break below
    } else if (content.startsWith('//')) {
      out.push([T_COMMENT, content])
    } else if (content.startsWith('/*')) {
      out.push([T_COMMENT, content])
      if (!content.includes('*/')) inBlockComment = true
    } else if (content[0] === '@') {
      // at-rule / control directive — symbols handled by applySassSymbols.
      out.push(...lexInline(content))
    } else if (content[0] === '=' || content[0] === '+') {
      // indented-syntax mixin define (=name) / include (+name).
      out.push([T_SIGN, content[0]!])
      const rest = content.slice(1)
      const nameMatch = rest.match(/^[\w-]+/)?.[0]
      if (nameMatch) {
        out.push([T_ENTITY, nameMatch])
        out.push(...lexInline(rest.slice(nameMatch.length)))
      } else {
        out.push(...lexInline(rest))
      }
    } else {
      const decl = content.match(/^(\$?[\w-]+)\s*:(.*)$/)
      const isPseudoSelector = decl ? hasChildren(l) && /^\S/.test(decl[2]!) : false
      if (decl && !isPseudoSelector) {
        // declaration: `prop: value` or `$var: value`
        const [, prop, rest] = decl
        out.push([T_PROPERTY, prop!])
        const colonAt = content.indexOf(':', prop!.length)
        out.push([T_SIGN, ':'])
        out.push(...lexInline(content.slice(colonAt + 1)))
      } else {
        // selector line
        const tokens = lexInline(content)
        retagSelector(tokens)
        out.push(...tokens)
      }
    }

    if (l < lines.length - 1) out.push([T_BREAK, '\n'])
  }

  return out
}

export const config: ParseOptions = { tokenize }
