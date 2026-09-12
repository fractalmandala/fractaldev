import { describe, expect, it } from 'vitest'
import {
  highlight,
  findLanguage,
  lang,
  registerLanguage,
  setDefaults,
  importDefaults,
  getRegisteredLanguages,
  resetLanguageRegistry,
  resetLanguageConfigRegistry,
  getLanguageConfig,
} from '../src/index.js'
import { config as pythonConfig } from '../src/lang/python.js'
import { config as rustConfig } from '../src/lang/rust.js'

describe('default fractalpop registry', () => {
  it('only resolves typescript and plaintext by default', () => {
    expect(lang('ts')).toBe('typescript')
    expect(lang('txt')).toBe('plaintext')
    expect(lang('js')).toBeUndefined()
    expect(lang('python')).toBeUndefined()
    expect(lang('sass')).toBeUndefined()
  })

  it('registers typescript and plaintext configs by default', () => {
    expect(getLanguageConfig('typescript')).toBeDefined()
    expect(getLanguageConfig('plaintext')).toBeDefined()
    expect(highlight('const x = 1', { lang: 'ts' })).toContain('fp__token--keyword')
  })
})

describe('registerLanguage', () => {
  it('enables a new language', () => {
    registerLanguage({ id: 'python', extension: 'py', aliases: ['python3'] }, pythonConfig)
    expect(lang('py')).toBe('python')
    expect(getLanguageConfig('python')).toBe(pythonConfig)
    expect(highlight('def hello():', { lang: 'py' })).toContain('fp__token--keyword')
    resetLanguageRegistry()
    resetLanguageConfigRegistry()
  })
})

describe('setDefaults', () => {
  it('replaces the default set with an array of metadata', () => {
    setDefaults([
      { id: 'rust', extension: 'rs', aliases: [] },
      { id: 'python', extension: 'py', aliases: ['python3'] },
    ])
    expect(getRegisteredLanguages().map((l) => l.id).sort()).toEqual(['python', 'rust'])
    expect(lang('rs')).toBe('rust')
    expect(lang('py')).toBe('python')
    expect(lang('ts')).toBeUndefined()
  })

  it('accepts a record of configs and preserves known aliases', () => {
    setDefaults({ python: pythonConfig, rust: rustConfig })
    expect(lang('py')).toBe('python')
    expect(lang('python3')).toBe('python')
    expect(lang('rs')).toBe('rust')
    expect(getLanguageConfig('python')).toBe(pythonConfig)
    expect(getLanguageConfig('rust')).toBe(rustConfig)
    expect(highlight('def hello():', { lang: 'py' })).toContain('fp__token--keyword')
  })
})

describe('importDefaults', () => {
  it('asynchronously enables languages by id', async () => {
    setDefaults([])
    await importDefaults(['python', 'rust'])
    expect(lang('py')).toBe('python')
    expect(lang('rs')).toBe('rust')
    expect(getLanguageConfig('python')).toBeDefined()
    expect(getLanguageConfig('rust')).toBeDefined()
    expect(highlight('fn main() {}', { lang: 'rust' })).toContain('fp__token--keyword')
  })
})

describe('fractalpop/full', () => {
  it('resolves all 32 bundled languages', async () => {
    const full = await import('../src/full.js')
    const ids = new Set(full.allLanguages.map((l: { id: string }) => l.id))
    expect(ids.size).toBe(32)
    for (const id of ids) {
      expect(full.findLanguage(id)?.id).toBe(id)
      expect(full.getLanguageConfig(id)).toBeDefined()
    }
    expect(full.lang('jsx')).toBe('javascript')
    expect(full.lang('yml')).toBe('yaml')
    expect(full.lang('bash')).toBe('shell')
  })

  it('highlights typescript out of the box', async () => {
    const full = await import('../src/full.js')
    expect(full.highlight('const x = 1', { lang: 'ts' })).toContain('fp__token--keyword')
  })
})

describe('config override', () => {
  it('passing config directly overrides the registry', () => {
    const custom = { keywords: new Set(['magic']) }
    const html = highlight('magic word', { lang: 'ts', config: custom })
    expect(html).toContain('fp__token--keyword')
  })
})
