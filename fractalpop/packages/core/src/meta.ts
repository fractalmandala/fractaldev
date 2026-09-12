/** Highlight range: either a single 1-based line or an inclusive [start, end] pair. */
export type HighlightRange = number | [number, number]

function parseMetaParts(meta?: string | null): string[] | undefined {
  const match = meta?.match(/\{([^}]*)\}/)
  return match ? match[1]!.split(',') : undefined
}

/**
 * Parse `{1,3-5,7}` fence metadata into a Set of 1-based line numbers.
 *
 * Tolerates whitespace (`{ 1 , 3 - 5 }`) and silently ignores invalid or
 * negative numbers.
 */
export function parseHighlightMeta(meta?: string | null): Set<number> {
  const lines = new Set<number>()
  const parts = parseMetaParts(meta)
  if (!parts) return lines

  for (const part of parts) {
    const range = part.trim()
    if (!range) continue

    if (range.includes('-')) {
      const [start, end] = range.split('-').map((n) => Number(n.trim()))
      if (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start! > 0 &&
        end! >= start!
      ) {
        for (let i = start!; i <= end!; i++) lines.add(i)
      }
    } else {
      const n = Number(range)
      if (Number.isFinite(n) && n > 0) lines.add(n)
    }
  }

  return lines
}

/**
 * Convert `{1,3-5,7}` fence metadata into remark-compatible highlight ranges.
 *
 * Returns single numbers for individual lines and `[start, end]` tuples for
 * explicit ranges. Invalid/negative numbers are ignored.
 */
export function toHighlightRanges(meta?: string | null): HighlightRange[] {
  const out: HighlightRange[] = []
  const parts = parseMetaParts(meta)
  if (!parts) return out

  for (const part of parts) {
    const range = part.trim()
    if (!range) continue

    if (range.includes('-')) {
      const [start, end] = range.split('-').map((n) => Number(n.trim()))
      if (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start! > 0 &&
        end! >= start!
      ) {
        out.push([start!, end!])
      }
    } else {
      const n = Number(range)
      if (Number.isFinite(n) && n > 0) out.push(n)
    }
  }

  return out
}

/** Escape characters Svelte's compiler would otherwise interpret in markup. */
export function escapeSvelte(html: string): string {
  return html
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/`/g, '&#96;')
}
