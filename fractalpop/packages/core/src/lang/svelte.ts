/** Svelte composite lexer. A `.svelte` file mixes three languages:
 *   <script [lang=ts]> … </script>   → the JS/TS runtime
 *   markup with {expr} / {#if} / {@render} blocks → Svelte markup (expressions delegated to JS)
 *   <style [lang=sass|scss]> … </style> → the css / scss / sass tokenizer
 * The region splitter tokenizes each part and concatenates the streams in source order. */
import {
  T_BREAK,
  T_CLASS,
  T_COMMENT,
  T_IDENTIFIER,
  T_KEYWORD,
  T_PROPERTY,
  T_SIGN,
  T_SPACE,
  T_STRING,
  type Token,
} from '../shared.js'
import { tokenize as tokenizeJs } from '../presets/javascript-runtime.js'
import { tokenize as tokenizeCss } from './css.js'
import { tokenize as tokenizeScss } from './scss.js'
import { tokenize as tokenizeSass } from './sass.js'
import type { ParseOptions } from '../core.js'

const isSpace = (c: string): boolean => c === ' ' || c === '\t' || c === '\r'
const isNameChar = (c: string): boolean => /[A-Za-z0-9_:.\-]/.test(c)
const isNameStart = (c: string): boolean => /[A-Za-z]/.test(c)

/** Push text, splitting newlines into break tokens so line assembly stays correct. */
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
    } else buf += ch
  }
  flush()
}

const emit = (tokens: Token[], produced: Token[]): void => {
  for (const t of produced) tokens.push(t)
}

/** Tokenize a `{ … }` mustache/block at `i` (code[i] === '{'). Returns the index past '}'. */
function mustache(tokens: Token[], code: string, i: number): number {
  const n = code.length
  let depth = 0
  let str = ''
  let j = i
  for (; j < n; j++) {
    const ch = code[j]!
    if (str) {
      if (ch === str && code[j - 1] !== '\\') str = ''
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') str = ch
    else if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        j++
        break
      }
    }
  }
  const inner = code.slice(i + 1, j - 1)
  tokens.push([T_SIGN, '{'])
  // Svelte block prefixes: {#if}, {:else}, {/each}, {@render}, {@html}, {@const}, {@debug}
  const block = inner.match(/^(\s*)([#:/@][a-zA-Z]+)/)
  let expr = inner
  if (block) {
    if (block[1]) pushText(tokens, T_SPACE, block[1])
    tokens.push([T_KEYWORD, block[2]!])
    expr = inner.slice(block[0].length)
  }
  emit(tokens, tokenizeJs(expr, {}))
  tokens.push([T_SIGN, '}'])
  return j
}

/** Tokenize a markup tag starting at `i` (code[i] === '<'). Attribute values may hold {expr}. */
function tag(tokens: Token[], code: string, i: number): number {
  const n = code.length
  tokens.push([T_SIGN, '<'])
  i++
  if (code[i] === '/') {
    tokens.push([T_SIGN, '/'])
    i++
  }
  const nameStart = i
  while (i < n && isNameChar(code[i]!)) i++
  if (i > nameStart) tokens.push([T_CLASS, code.slice(nameStart, i)])

  while (i < n && code[i] !== '>') {
    const c = code[i]!
    if (c === '\n') {
      tokens.push([T_BREAK, '\n'])
      i++
    } else if (isSpace(c)) {
      const s = i++
      while (i < n && isSpace(code[i]!)) i++
      tokens.push([T_SPACE, code.slice(s, i)])
    } else if (c === '/' || c === '=') {
      tokens.push([T_SIGN, c])
      i++
    } else if (c === '"' || c === "'") {
      const q = c
      const s = i++
      // an attribute string may embed {expr}: flush the plain part, then mustache
      let buf = code[s]!
      while (i < n && code[i] !== q) {
        if (code[i] === '{') {
          pushText(tokens, T_STRING, buf)
          buf = ''
          i = mustache(tokens, code, i)
        } else {
          buf += code[i]
          i++
        }
      }
      if (i < n) {
        buf += code[i]
        i++
      }
      pushText(tokens, T_STRING, buf)
    } else if (c === '{') {
      i = mustache(tokens, code, i)
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
  return i
}

/** Tokenize a markup region (text, tags, comments, and {expr} mustaches). */
function markup(tokens: Token[], code: string): void {
  const n = code.length
  let i = 0
  while (i < n) {
    const c = code[i]!
    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4)
      const stop = end === -1 ? n : end + 3
      pushText(tokens, T_COMMENT, code.slice(i, stop))
      i = stop
    } else if (c === '<' && (isNameStart(code[i + 1] ?? '') || code[i + 1] === '/')) {
      i = tag(tokens, code, i)
    } else if (c === '{') {
      i = mustache(tokens, code, i)
    } else {
      const start = i
      while (i < n && code[i] !== '<' && code[i] !== '{') i++
      pushText(tokens, T_IDENTIFIER, code.slice(start, i))
    }
  }
}

/** Choose the style tokenizer from a `<style lang="…">` attribute. */
function styleTokenizer(attrs: string): (code: string) => Token[] {
  const lang = attrs.match(/lang\s*=\s*["']?(sass|scss|css|postcss)/i)?.[1]?.toLowerCase()
  if (lang === 'sass') return tokenizeSass
  if (lang === 'scss') return (c) => tokenizeScss(c)
  return (c) => tokenizeCss(c)
}

export const tokenize = (code: string): Token[] => {
  const tokens: Token[] = []
  const re = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>/gi
  let pos = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(code))) {
    const start = m.index
    const end = re.lastIndex
    const kind = m[1]!.toLowerCase()
    const attrs = m[2] ?? ''
    if (start > pos) markup(tokens, code.slice(pos, start))

    const openTag = m[0]!.slice(0, m[0]!.indexOf('>') + 1)
    const closeTag = kind === 'script' ? '</script>' : '</style>'
    const inner = code.slice(start + openTag.length, end - closeTag.length)

    markup(tokens, openTag)
    if (kind === 'script') {
      const ts = /lang\s*=\s*["']?(ts|typescript)/i.test(attrs)
      emit(tokens, tokenizeJs(inner, ts ? { typescript: true } : {}))
    } else {
      emit(tokens, styleTokenizer(attrs)(inner))
    }
    markup(tokens, closeTag)
    pos = end
  }
  if (pos < code.length) markup(tokens, code.slice(pos))
  return tokens
}

export const config: ParseOptions = { tokenize }
