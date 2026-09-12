import { remark } from 'remark'
import html from 'remark-html'
import remarkFractalpop from '@fractalpop/remark'
import { highlight } from 'fractalpop'

// A normal Markdown string — the kind you'd load from a CMS or a content file.
// Everything below is turned into highlighted HTML at load time by a real
// `remark` pipeline, so the page can show the remark plugin's own output
// alongside the fences mdsvex compiled at build time.
const markdown = [
  'This block was **not** written in the page file. It is a Markdown string run',
  'through `remark().use(remarkFractalpop).use(remarkHtml)` in `+page.ts`, then',
  'dropped in as HTML — the same tokens, produced outside Svelte entirely.',
  '',
  '```ts {2}',
  'const a = 1',
  'const b = 2',
  'const c = a + b',
  '```',
  '',
  '```sass',
  '$brand: hsl(212, 90%, 55%)',
  '.card',
  '  color: $brand',
  '  &:hover',
  '    background: darken($brand, 8%)',
  '```',
].join('\n')

export async function load() {
  const file = await remark()
    .use(remarkFractalpop)
    .use(html, { sanitize: false })
    .process(markdown)
  const sourceHtml = highlight(markdown, { lang: 'markdown' })
  return { html: String(file), source: markdown, sourceHtml }
}
