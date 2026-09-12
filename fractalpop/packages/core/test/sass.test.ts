import { describe, expect, it } from 'vitest'
import { parse } from '../src/core.js'
import { findLanguage, getLanguageConfig } from '../src/full.js'
import type { ParsedToken } from '../src/shared.js'

const sass = getLanguageConfig(findLanguage('sass')!.id)!
const flat = (code: string): ParsedToken[] => parse(code, sass).lines.flatMap((l) => l.tokens)
const typeOf = (code: string, value: string): string | undefined =>
  flat(code).find((t) => t.value === value)?.type

describe('indented sass', () => {
  it('colors a variable declaration', () => {
    const t = flat('$brand: hsl(212, 90%, 55%)')
    expect(t.find((x) => x.value === '$brand')?.type).toBe('property')
    expect(t.some((x) => x.value === 'hsl' && x.type === 'entity')).toBe(true)
  })

  it('treats a plain property line as a declaration', () => {
    // `color` before a colon with a value, no nested children → property
    expect(typeOf('color: red', 'color')).toBe('property')
  })

  it('distinguishes a pseudo-class selector from a declaration via child lookahead', () => {
    const code = ['a:hover', '  color: red'].join('\n')
    const t = flat(code)
    // `a:hover` is a selector (it has a deeper-indented child), so `a` is NOT a property.
    const a = t.find((x) => x.value === 'a')
    expect(a?.type).not.toBe('property')
    // the nested `color` IS a declaration property
    expect(t.find((x) => x.value === 'color')?.type).toBe('property')
  })

  it('colors @-rules as keywords and mixin names as entities', () => {
    const t = flat('@mixin card($pad: 1rem)')
    expect(t.find((x) => x.value === '@mixin')?.type).toBe('keyword')
    expect(t.find((x) => x.value === 'card')?.type).toBe('entity')
    expect(t.find((x) => x.value === '$pad')?.type).toBe('property')
  })

  it('handles indented-syntax include (+name) and define (=name)', () => {
    expect(typeOf('+button-reset', 'button-reset')).toBe('entity')
    expect(typeOf('=button-reset', 'button-reset')).toBe('entity')
  })

  it('colors placeholder selectors', () => {
    expect(typeOf('%placeholder', '%placeholder')).toBe('class')
  })

  it('colors class selectors', () => {
    const code = ['.card', '  color: blue'].join('\n')
    expect(typeOf(code, 'card')).toBe('class')
  })

  it('handles line and block comments', () => {
    expect(typeOf('// a comment', '// a comment')).toBe('comment')
    const t = flat(['/* multi', 'line */', '.a', '  x: 1'].join('\n'))
    expect(t.filter((x) => x.type === 'comment').length).toBeGreaterThanOrEqual(2)
  })

  it('colors !default and function calls in values', () => {
    const t = flat('$x: darken($brand, 10%) !default')
    expect(t.find((x) => x.value === 'darken')?.type).toBe('entity')
    expect(t.find((x) => x.value === '!default')?.type).toBe('keyword')
  })
})

describe('scss', () => {
  const scss = getLanguageConfig(findLanguage('scss')!.id)!
  const sflat = (code: string) => parse(code, scss).lines.flatMap((l) => l.tokens)

  it('colors nested rules, $vars and // comments', () => {
    const code = '.card {\n  color: $brand; // note\n  &:hover { color: red }\n}'
    const t = sflat(code)
    expect(t.find((x) => x.value === '$brand')?.type).toBe('property')
    expect(t.find((x) => x.value === 'color')?.type).toBe('property')
    expect(t.some((x) => x.type === 'comment' && x.value.includes('note'))).toBe(true)
  })
})
