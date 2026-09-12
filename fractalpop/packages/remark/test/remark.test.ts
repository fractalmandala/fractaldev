import { describe, expect, it } from 'vitest'
import { remark } from 'remark'
import html from 'remark-html'
import remarkFractalpop, { parseHighlightMeta } from '../src/index.js'

async function render(md: string, options = {}) {
  const file = await remark().use(remarkFractalpop, options).use(html, { sanitize: false }).process(md)
  return String(file)
}

describe('@fractalpop/remark (real remark pipeline)', () => {
  it('highlights a fenced code block', async () => {
    const out = await render('```ts\nconst ready = true\n```')
    expect(out).toContain('fp__token--keyword') // const
    expect(out).toContain('var(--fp-keyword)')
    expect(out).toContain('fp-lang--typescript')
    expect(out).toContain('<pre')
  })

  it('highlights an indented Sass fence', async () => {
    const out = await render('```sass\n$brand: red\n.card\n  color: $brand\n```')
    expect(out).toContain('fp__token--property') // $brand
    expect(out).toContain('fp-lang--sass')
  })

  it('marks fence-meta line ranges', async () => {
    const out = await render('```ts {2}\nconst a = 1\nconst b = 2\n```')
    expect(out).toContain('fp__line--highlighted')
  })

  it('leaves non-code nodes untouched', async () => {
    const out = await render('# Title\n\nSome **text**.')
    expect(out).toContain('<h1>Title</h1>')
    expect(out).not.toContain('fp__token')
  })

  it('resolves aliases (jsx -> javascript, yml -> yaml)', async () => {
    expect(await render('```jsx\nconst x = 1\n```')).toContain('fp-lang--javascript')
    expect(await render('```yml\nname: app\n```')).toContain('fp-lang--yaml')
  })
})

describe('parseHighlightMeta', () => {
  it('parses single lines and ranges', () => {
    expect(parseHighlightMeta('{1,3-5}')).toEqual([1, [3, 5]])
    expect(parseHighlightMeta(undefined)).toEqual([])
    expect(parseHighlightMeta('no ranges')).toEqual([])
  })
})
