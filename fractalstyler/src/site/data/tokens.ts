import raw from '$lib/styles/_00_tokens.sass?raw'

/**
 * Token values are READ from _00_tokens.sass, never retyped here. If the
 * scale moves, the orientation moves with it.
 *
 * Utopia clamps take the form
 *   clamp(<min>rem, <base>rem + <slope>vw, <max>rem)
 * which resolves, at viewport w, to
 *   clamp(min, base*16 + slope*w/100, max)  in px.
 */

export interface Scale {
	name: string
	/** The literal declaration as authored. */
	source: string
	min: number
	base: number
	slope: number
	max: number
}

const ROOT_PX = 16

const CLAMP =
	/--(?<name>[\w-]+):\s*(?<src>clamp\(\s*([\d.]+)rem,\s*([\d.]+)rem\s*\+\s*([\d.]+)vw,\s*([\d.]+)rem\s*\))/

function parse(prefix: string): Scale[] {
	const out: Scale[] = []
	for (const line of raw.split('\n')) {
		const m = CLAMP.exec(line.trim())
		if (!m?.groups) continue
		const name = m.groups.name
		if (!name.startsWith(prefix)) continue
		out.push({
			name,
			source: m.groups.src,
			min: Number(m[3]) * ROOT_PX,
			base: Number(m[4]) * ROOT_PX,
			slope: Number(m[5]),
			max: Number(m[6]) * ROOT_PX
		})
	}
	return out
}

/** Non-clamped literals in the same family (e.g. --text-xs: 0.75rem). */
function literal(name: string): Scale | null {
	const re = new RegExp(`--${name}:\\s*([\\d.]+)rem\\s*$`, 'm')
	const m = re.exec(raw)
	if (!m) return null
	const px = Number(m[1]) * ROOT_PX
	return { name, source: `${m[1]}rem`, min: px, base: px, slope: 0, max: px }
}

export const TEXT_SCALE: Scale[] = [literal('text-xs'), ...parse('text-')].filter(
	(s): s is Scale => s !== null
)
export const SPACE_SCALE: Scale[] = parse('space-')

/** Resolve one clamp at a given viewport width, in px. */
export function resolve(s: Scale, viewport: number): number {
	const fluid = s.base + (s.slope * viewport) / 100
	return Math.min(Math.max(fluid, s.min), s.max)
}

/** Is the value pinned at a bound, or still moving with the viewport? */
export function boundState(s: Scale, viewport: number): 'min' | 'fluid' | 'max' {
	const fluid = s.base + (s.slope * viewport) / 100
	// Half a pixel of tolerance: the band tops out AT 1240, and floating point
	// should not make the ceiling read as still moving.
	if (fluid <= s.min + 0.5) return 'min'
	if (fluid >= s.max - 0.5) return 'max'
	return 'fluid'
}

/** The 30 semantic colour tokens, read from the light mixin, in source order. */
export function colorTokens(): { name: string; light: string }[] {
	const block = raw.split('=light-theme-tokens')[1]?.split('=dark-theme-tokens')[0] ?? ''
	const out: { name: string; light: string }[] = []
	for (const line of block.split('\n')) {
		const m = /^\s+--([\w-]+):\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))\s*$/.exec(line)
		if (m) out.push({ name: m[1], light: m[2] })
	}
	return out
}
