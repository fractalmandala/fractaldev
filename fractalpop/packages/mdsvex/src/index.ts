/**
 * @fractalpop/mdsvex — highlighter for mdsvex's `highlight.highlighter` hook.
 *
 *   // svelte.config.js
 *   import { fractalpopHighlighter } from '@fractalpop/mdsvex'
 *   mdsvex({ highlight: { highlighter: fractalpopHighlighter } })
 *
 * Returns an HTML string and escapes Svelte-significant chars ({ } `) in the
 * OUTPUT markup so highlighted code isn't reparsed as Svelte. Fence meta like
 * ```sass {2,4} marks those 1-based lines with `fp__line--highlighted`.
 */
import {
  highlight,
  type MarkLine,
  parseHighlightMeta,
  escapeSvelte,
  canonicalizeLang,
} from 'fractalpop/full'

export { parseHighlightMeta, escapeSvelte } from 'fractalpop/full'

export function fractalpopHighlighter(code: string, lang?: string, meta?: string): string {
  const highlightLines = parseHighlightMeta(meta)
  const inner = highlight(code, {
    lang,
    markLine: highlightLines.size
      ? (line: MarkLine) => {
          if (highlightLines.has(line.index + 1)) line.className += ' fp__line--highlighted'
        }
      : undefined,
  })
  const canonical = lang ? canonicalizeLang(lang) : undefined
  const langClass = canonical ? ` fp-lang--${canonical}` : ''
  return `<pre class="fp${langClass}"><code>${escapeSvelte(inner)}</code></pre>`
}

export default fractalpopHighlighter
