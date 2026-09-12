import { describe, expect, it, beforeAll } from 'vitest'
import { compile } from 'svelte/compiler'
import { render } from 'svelte/server'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'

// Compile Highlight.svelte to a server module once, then SSR-render it.
let Highlight: unknown
const tmpUrl = new URL('./__compiled_highlight.js', import.meta.url)

beforeAll(async () => {
  const src = readFileSync(new URL('../src/Highlight.svelte', import.meta.url), 'utf8')
  const { js } = compile(src, { generate: 'server', runes: true, filename: 'Highlight.svelte' })
  writeFileSync(tmpUrl, js.code)
  Highlight = (await import(tmpUrl.href)).default
})

describe('Highlight.svelte (SSR)', () => {
  it('renders fractalpop token spans server-side', () => {
    const { body } = render(Highlight as never, { props: { code: 'const ready = true', lang: 'ts' } })
    expect(body).toContain('fp__token--keyword')
    expect(body).toContain('var(--fp-keyword)')
    expect(body).toContain('<pre class="fp"')
  })

  it('highlights indented sass through the component', () => {
    const code = ['.card', '  color: $brand'].join('\n')
    const { body } = render(Highlight as never, { props: { code, lang: 'sass' } })
    expect(body).toContain('fp__token--property') // color / $brand
    expect(body).toContain('fp__token--class') // .card
  })

  it('marks highlighted lines from the highlightLines prop', () => {
    const code = ['const a = 1', 'const b = 2'].join('\n')
    const { body } = render(Highlight as never, { props: { code, lang: 'ts', highlightLines: [2] } })
    expect(body).toContain('fp__line--highlighted')
  })
})

// best-effort cleanup
try {
  process.on('exit', () => rmSync(tmpUrl, { force: true }))
} catch {}
