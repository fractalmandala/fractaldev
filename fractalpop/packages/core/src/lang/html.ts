/** HTML / XML / markup tokenizer. Also the basis for Svelte markup regions.
 * Emits tags (class), attribute names (property), values (string), and text. */
import {
  T_BREAK,
  T_CLASS,
  T_COMMENT,
  T_IDENTIFIER,
  T_PROPERTY,
  T_SIGN,
  T_SPACE,
  T_STRING,
  type Token,
} from '../shared.js'
import type { ParseOptions } from '../core.js'

const isSpace = (c: string): boolean => c === ' ' || c === '\t' || c === '\r'
const isNameChar = (c: string): boolean => /[A-Za-z0-9_:.\-]/.test(c)

/** Push text, splitting out newlines (break) and horizontal whitespace (space). */
function pushText(tokens: Token[], type: number, text: string): void {
  if (!text) return
  let buf = ''
  const flush = () => {
    if (buf) {
      tokens.push([type, buf])
      buf = ''
    }
  }
  for (const ch of text) {
    if (ch === '\n') {
      flush()
      tokens.push([T_BREAK, '\n'])
    } else {
      buf += ch
    }
  }
  flush()
}

export const tokenize = (code: string): Token[] => {
  const tokens: Token[] = []
  let i = 0
  const n = code.length

  while (i < n) {
    const curr = code[i]!

    // Comment <!-- ... -->
    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4)
      const stop = end === -1 ? n : end + 3
      pushText(tokens, T_COMMENT, code.slice(i, stop))
      i = stop
      continue
    }

    // Tag start
    if (curr === '<') {
      tokens.push([T_SIGN, '<'])
      i++
      if (code[i] === '/') {
        tokens.push([T_SIGN, '/'])
        i++
      }
      // tag name
      const nameStart = i
      while (i < n && isNameChar(code[i]!)) i++
      if (i > nameStart) tokens.push([T_CLASS, code.slice(nameStart, i)])

      // attributes until > or />
      while (i < n && code[i] !== '>') {
        const c = code[i]!
        if (c === '\n') {
          tokens.push([T_BREAK, '\n'])
          i++
        } else if (isSpace(c)) {
          const s = i++
          while (i < n && isSpace(code[i]!)) i++
          tokens.push([T_SPACE, code.slice(s, i)])
        } else if (c === '/') {
          tokens.push([T_SIGN, '/'])
          i++
        } else if (c === '=') {
          tokens.push([T_SIGN, '='])
          i++
        } else if (c === '"' || c === "'") {
          const q = c
          const s = i++
          while (i < n && code[i] !== q) i++
          if (i < n) i++
          pushText(tokens, T_STRING, code.slice(s, i))
        } else if (isNameChar(c)) {
          const s = i++
          while (i < n && isNameChar(code[i]!)) i++
          tokens.push([T_PROPERTY, code.slice(s, i)])
        } else {
          tokens.push([T_SIGN, c])
          i++
        }
      }
      if (code[i] === '>') {
        tokens.push([T_SIGN, '>'])
        i++
      }
      continue
    }

    // Text run until next tag
    const start = i
    while (i < n && code[i] !== '<') i++
    pushText(tokens, T_IDENTIFIER, code.slice(start, i))
  }

  return tokens
}

export const config: ParseOptions = { tokenize }
