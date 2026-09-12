import { describe, expect, it } from 'vitest'
import { compile } from 'mdsvex'
import { fractalpopHighlighter, escapeSvelte, parseHighlightMeta } from '../src/index.js'

describe('mdsvex highlighter (real mdsvex compile)', () => {
  it('highlights a sass fence inside a .svx document', async () => {
    const svx = ['```sass', '$brand: red', '.card', '  color: $brand', '```'].join('\n')
    const out = await compile(svx, { highlight: { highlighter: fractalpopHighlighter } })
    const code = out!.code
    expect(code).toContain('fp__token--')
    expect(code).toContain('fp-lang--sass')
    // $brand colored as a property (variable)
    expect(code).toContain('fp__token--property')
  })

  it('escapes Svelte-significant braces in highlighted output', async () => {
    const svx = ['```ts', 'const x = { a: 1 }', '```'].join('\n')
    const out = await compile(svx, { highlight: { highlighter: fractalpopHighlighter } })
    expect(out!.code).toContain('&#123;') // { escaped so mdsvex/Svelte won't parse it
    expect(out!.code).toContain('&#125;') // }
  })

  it('marks fence-meta line ranges', async () => {
    const svx = ['```ts {2}', 'const a = 1', 'const b = 2', '```'].join('\n')
    const out = await compile(svx, { highlight: { highlighter: fractalpopHighlighter } })
    expect(out!.code).toContain('fp__line--highlighted')
  })

  it('canonicalizes ts to typescript in the language class', async () => {
    const svx = ['```ts', 'const x = 1', '```'].join('\n')
    const out = await compile(svx, { highlight: { highlighter: fractalpopHighlighter } })
    expect(out!.code).toContain('fp-lang--typescript')
  })
})

describe('meta + escaping units', () => {
  it('parses {1,3-5}', () => {
    expect([...parseHighlightMeta('{1,3-5}')]).toEqual([1, 3, 4, 5])
    expect(parseHighlightMeta(undefined).size).toBe(0)
  })
  it('escapes { } `', () => {
    expect(escapeSvelte('a{b}`c`')).toBe('a&#123;b&#125;&#96;c&#96;')
  })
})
