import { describe, expect, it } from 'vitest'
import { lang } from '../src/full.js'

describe('canonical alias resolution', () => {
  it('resolves common extensions and aliases', () => {
    expect(lang('ts')).toBe('typescript')
    expect(lang('js')).toBe('javascript')
    expect(lang('py')).toBe('python')
    expect(lang('yml')).toBe('yaml')
    expect(lang('bash')).toBe('shell')
  })

  it('returns undefined for unknown names', () => {
    expect(lang('nope')).toBeUndefined()
  })
})
