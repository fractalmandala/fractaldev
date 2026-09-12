import { describe, expect, it } from 'vitest'
import { highlight, findLanguage, lang, getLanguageConfig } from '../src/full.js'
import { parse, tokenize } from '../src/core.js'

describe('highlight', () => {
  it('returns HTML with fp token classes and css vars', () => {
    const html = highlight('const ready = true', { lang: 'ts' })
    expect(html).toContain('fp__token--keyword')
    expect(html).toContain('var(--fp-keyword)')
    expect(html).toContain('fp__line')
  })

  it('encodes HTML-significant characters', () => {
    const html = highlight('const x = a < b && c > d', { lang: 'ts' })
    expect(html).toContain('&lt;')
    expect(html).toContain('&gt;')
    expect(html).toContain('&amp;')
  })

  it('marks TypeScript keywords and Capitalized classes', () => {
    const parsed = parse('let x: Foo = null', getLanguageConfig(findLanguage('ts')!.id)!)
    const flat = parsed.lines.flatMap((l) => l.tokens)
    expect(flat.find((t) => t.value === 'let')?.type).toBe('keyword')
    expect(flat.find((t) => t.value === 'Foo')?.type).toBe('class') // Capitalized → class
    expect(flat.find((t) => t.value === 'null')?.type).toBe('class') // null → class
  })

  it('splits into one line span per source line', () => {
    const html = highlight('a\nb\nc', { lang: 'plaintext' })
    expect(html.split('\n')).toHaveLength(3)
  })
})

describe('css declarations', () => {
  it('tags a property before a colon inside a block', () => {
    const parsed = parse('.a { color: red }', getLanguageConfig(findLanguage('css')!.id)!)
    const flat = parsed.lines.flatMap((l) => l.tokens)
    expect(flat.some((t) => t.type === 'property' && t.value === 'color')).toBe(true)
  })
})

describe('lang registry', () => {
  it('resolves aliases and extensions', () => {
    expect(lang('tsx')).toBe('typescript')
    expect(lang('.scss')).toBe('scss')
    expect(lang('text')).toBe('plaintext')
    expect(lang('nope')).toBeUndefined()
  })
})
