import { describe, expect, it } from 'vitest'
import { parse } from '../src/core.js'
import { findLanguage, getLanguageConfig } from '../src/full.js'
import type { ParsedToken } from '../src/shared.js'

const flat = (code: string, lang: string): ParsedToken[] =>
  parse(code, getLanguageConfig(findLanguage(lang)!.id)!).lines.flatMap((l) => l.tokens)
const typeOf = (code: string, lang: string, value: string): string | undefined =>
  flat(code, lang).find((t) => t.value === value)?.type

describe('regex literals', () => {
  it('treats /ab+c/gi as a single string token, not division', () => {
    const t = flat('const re = /ab+c/gi', 'js')
    expect(t.some((x) => x.value === '/ab+c/gi' && x.type === 'string')).toBe(true)
    // and not split into `/`, `ab`, `+` …
    expect(t.some((x) => x.value === 'ab')).toBe(false)
  })

  it('does not mistake division for regex', () => {
    const t = flat('const x = a / b / c', 'js')
    expect(t.filter((x) => x.type === 'string').length).toBe(0)
  })
})

describe('template strings', () => {
  it('breaks out ${...} interpolation', () => {
    const t = flat('const s = `hi ${name} bye`', 'js')
    // the interpolation braces are signs, and `name` is an identifier, not part of the string
    expect(t.some((x) => x.value === '${' && x.type === 'sign')).toBe(true)
    expect(t.some((x) => x.value === 'name' && x.type === 'identifier')).toBe(true)
    expect(t.some((x) => x.value === '}' && x.type === 'sign')).toBe(true)
    expect(t.some((x) => x.type === 'string' && x.value.includes('hi'))).toBe(true)
  })
})

describe('jsx', () => {
  it('colors tags as entities, attributes as properties, text as jsx literals', () => {
    const code = 'const App = () => <div className="x">hello {count}</div>'
    const t = flat(code, 'jsx')
    expect(t.some((x) => x.value === 'div' && x.type === 'entity')).toBe(true)
    expect(t.some((x) => x.value === 'className' && x.type === 'property')).toBe(true)
    expect(t.some((x) => x.type === 'jsxliterals' && x.value.includes('hello'))).toBe(true)
    // the expression inside {} is highlighted as code
    expect(t.some((x) => x.value === 'count' && x.type === 'identifier')).toBe(true)
  })

  it('does not treat a TS generic call as a JSX tag', () => {
    const t = flat('const y = id<number>(1)', 'ts')
    // `id` should not become a jsx entity; no jsxliterals emitted
    expect(t.some((x) => x.type === 'jsxliterals')).toBe(false)
  })
})

describe('classification basics still hold', () => {
  it('keywords, strings, comments', () => {
    expect(typeOf('const x = 1', 'js', 'const')).toBe('keyword')
    // strings are emitted as adjacent string tokens (quote, content, quote)
    const s = flat('const s = "hi"', 'js').filter((x) => x.type === 'string').map((x) => x.value).join('')
    expect(s).toBe('"hi"')
    expect(flat('// note', 'js').some((x) => x.type === 'comment')).toBe(true)
    expect(flat('/* b */', 'js').some((x) => x.type === 'comment')).toBe(true)
  })
})
