/**
 * @fractalpop/remark — remark plugin that highlights fenced code in .md and .mdx.
 *
 * MDX code fences are the same mdast `code` nodes as Markdown, so this one plugin
 * serves both. It walks the tree, highlights each code node with fractalpop's
 * `generate()`, and replaces it with a <pre><code> hast subtree (via data.hName/
 * hProperties/hChildren). Fence meta like ```ts {2,4-6} marks those 1-based lines
 * with `fp__line--highlighted`.
 *
 *   import { remark } from 'remark'
 *   import html from 'remark-html'
 *   import remarkFractalpop from '@fractalpop/remark'
 *
 *   const out = await remark()
 *     .use(remarkFractalpop, { cx: { keyword: 'font-bold' } })
 *     .use(html, { sanitize: false })
 *     .process(markdown)
 */
import type { DisplayOptions, MarkLine, HighlightRange } from 'fractalpop'
import { parse, generate } from 'fractalpop/core'
import { lang as canonicalizeLang, getLanguageConfig } from 'fractalpop/full'
import { toHighlightRanges } from 'fractalpop'
import { map as unistMap } from 'unist-util-map'

export type RemarkFractalpopOptions = {
  cx?: DisplayOptions['cx']
  mark?: DisplayOptions['mark']
  markLine?: DisplayOptions['markLine']
}

/** Parse `{1,3-5}` from a code fence's meta string into ranges. */
export function parseHighlightMeta(meta?: string | null): HighlightRange[] {
  return toHighlightRanges(meta)
}

/** hast element that survives the mdast→hast transform. */
function h(tagName: string, properties: Record<string, unknown>, children: unknown[]) {
  return {
    type: 'element',
    tagName,
    data: { hName: tagName, hProperties: properties, hChildren: children },
    properties,
    children,
  }
}

const text = (value: string) => ({ type: 'text', value })

function styleString(style: Record<string, unknown> | undefined): string | undefined {
  if (!style) return undefined
  const entries = Object.entries(style)
  if (!entries.length) return undefined
  return entries
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${value}`)
    .join(';')
}

/** The remark plugin. Returns a transformer that highlights every code node. */
export function highlight(options: RemarkFractalpopOptions = {}) {
  const { cx, mark, markLine } = options
  return (tree: unknown) =>
    unistMap(tree as never, (node: any) => {
      if (node.type !== 'code') return node

      const language = String(node.lang || '').match(/^[a-zA-Z\d-]*/)?.[0] || ''
      const ranges = parseHighlightMeta(node.meta)
      const highlightLines = new Set<number>()
      for (const range of ranges) {
        if (Array.isArray(range)) {
          for (let i = range[0]; i <= range[1]; i++) highlightLines.add(i)
        } else {
          highlightLines.add(range)
        }
      }

      const canonical = canonicalizeLang(language)
      const outputLang = canonical || language || 'text'
      const config = canonical ? getLanguageConfig(canonical) : undefined
      const code = typeof node.value === 'string' ? node.value : ''

      const lines = generate(parse(code, config), {
        cx,
        mark,
        markLine(line: MarkLine) {
          markLine?.(line)
          if (highlightLines.has(line.index + 1)) line.className += ' fp__line--highlighted'
        },
      })

      const children = lines.map((line) => {
        const tokens = line.children.map((token: any) =>
          h(
            'span',
            {
              className: token.properties.className,
              style: styleString(token.properties.style),
            },
            [text(token.children[0]?.type === 'text' ? token.children[0].value : '')],
          ),
        )
        // preserve line breaks in the rendered output
        tokens.push(h('span', { className: 'fp__token--line' }, [text('\n')]))
        return h(
          'span',
          {
            className: line.properties.className,
            style: styleString(line.properties.style as Record<string, unknown>),
          },
          tokens,
        )
      })

      const codeEl = h(
        'code',
        { className: `fp-lang--${outputLang}`, 'data-fp-language': outputLang },
        children,
      )
      return h('pre', { className: `fp-lang--${outputLang}` }, [codeEl])
    })
}

export default highlight
