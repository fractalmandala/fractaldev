/** Markdown / MDX tokenizer — headings, fences, inline code, emphasis, links, lists.
 * Line-oriented; a fenced ``` block colors its body as string until it closes. */
import {
  T_BREAK,
  T_CLASS,
  T_COMMENT,
  T_IDENTIFIER,
  T_KEYWORD,
  T_PROPERTY,
  T_SIGN,
  T_STRING,
  type Token,
} from '../shared.js'
import type { ParseOptions } from '../core.js'

/** Tokenize the inline content of a normal text line. */
function inline(tokens: Token[], text: string): void {
  let i = 0
  const n = text.length
  let buf = ''
  const flush = () => {
    if (buf) {
      tokens.push([T_IDENTIFIER, buf])
      buf = ''
    }
  }
  while (i < n) {
    const c = text[i]!
    // inline code
    if (c === '`') {
      flush()
      const end = text.indexOf('`', i + 1)
      const stop = end === -1 ? n : end + 1
      tokens.push([T_STRING, text.slice(i, stop)])
      i = stop
      continue
    }
    // emphasis markers
    if (c === '*' || c === '_') {
      flush()
      const s = i
      while (i < n && (text[i] === '*' || text[i] === '_')) i++
      tokens.push([T_SIGN, text.slice(s, i)])
      continue
    }
    // link / image [text](url)
    if (c === '[') {
      const close = text.indexOf(']', i)
      if (close !== -1 && text[close + 1] === '(') {
        const paren = text.indexOf(')', close)
        if (paren !== -1) {
          flush()
          tokens.push([T_SIGN, '['])
          tokens.push([T_PROPERTY, text.slice(i + 1, close)])
          tokens.push([T_SIGN, ']('])
          tokens.push([T_STRING, text.slice(close + 2, paren)])
          tokens.push([T_SIGN, ')'])
          i = paren + 1
          continue
        }
      }
    }
    buf += c
    i++
  }
  flush()
}

export const tokenize = (code: string): Token[] => {
  const tokens: Token[] = []
  const lines = code.split('\n')
  let fence = ''

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l]!
    const trimmed = line.trimStart()
    const fenceMarker = trimmed.match(/^(`{3,}|~{3,})/)?.[1]

    if (fence) {
      if (fenceMarker && fenceMarker[0] === fence[0] && fenceMarker.length >= fence.length) {
        fence = ''
      }
      tokens.push([T_STRING, line])
    } else if (fenceMarker) {
      fence = fenceMarker
      tokens.push([T_COMMENT, line]) // fence line (with optional lang label)
    } else if (/^#{1,6}\s/.test(trimmed)) {
      tokens.push([T_CLASS, line]) // heading
    } else if (/^>/.test(trimmed)) {
      tokens.push([T_COMMENT, line]) // blockquote
    } else {
      const indent = line.slice(0, line.length - trimmed.length)
      if (indent) tokens.push([T_IDENTIFIER, indent])
      const listMarker = trimmed.match(/^([-*+]|\d+\.)\s/)?.[1]
      if (listMarker) {
        tokens.push([T_KEYWORD, listMarker])
        inline(tokens, trimmed.slice(listMarker.length))
      } else {
        inline(tokens, trimmed)
      }
    }

    if (l < lines.length - 1) tokens.push([T_BREAK, '\n'])
  }

  return tokens
}

export const config: ParseOptions = { tokenize }
