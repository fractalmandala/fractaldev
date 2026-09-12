import type { FigureKind, FigureRenderer, Graphic, Seed } from '$site/types.js'

/**
 * Figure registry.
 *
 * Each renderer is (level, seed) => SVG markup. Any group carrying a
 * data-spin attribute rotates at that multiple of the component's clock.
 * Groups carry data-stage (1–6) for the staggered arrival; the enclosure
 * ring carries data-draw for the draw-on; enclosure dots carry data-vtx and
 * minis carry data-echo / data-cluster so hovering a vertex lights its copy.
 * Add a kind here, then reference it from a slide's graphic.kind.
 */

export const CENTRE = 256
export const VIEWBOX = '0 0 512 512'

const R_OUT = 240
const RINGS = 5

/* Editorial legend strip (diagram-design SKILL.md §6): the figure lives in
   the 512-square band; readout + hairline sit in the 60px strip below. */
const STRIP_RULE_Y = 524
const STRIP_TEXT_Y = 548

const LEVEL_META: Record<number, { name: string; title: string; desc: string }> = {
	0: {
		name: 'BINDU',
		title: 'Mandala — Bindu, a point and a rule',
		desc: 'A single seed polygon with its centre mark; the rule before any repetition.'
	},
	1: {
		name: 'SPREAD',
		title: 'Mandala — Spread, one unit repeated outward',
		desc: 'Concentric repetitions of the seed polygon at one growing ratio, with spokes.'
	},
	2: {
		name: 'ECHO',
		title: 'Mandala — Echo, the whole smaller at every vertex',
		desc: 'A smaller copy of the seed folded onto each vertex of the whole.'
	},
	3: {
		name: 'CLUSTER',
		title: 'Mandala — Cluster, motifs orbiting motifs',
		desc: 'Stable motifs arranged as units on a larger ring.'
	},
	4: {
		name: 'ENCLOSE',
		title: 'Mandala — Enclose, the boundary from the same count',
		desc: 'An outer ring whose marks divide by the same seed count, closing the figure.'
	},
	5: {
		name: 'LIGHT',
		title: 'Mandala — Light, the complete figure made visible',
		desc: 'The full figure with its focal gradient; nothing structural changes, only light.'
	}
}

/* One editorial callout at a time (primitive-annotation.md): italic serif,
   dashed leader, landing dot — margins only, never crossing the figure. */
const CALLOUTS: Record<number, { text: string; dot: [number, number]; elbow: string }> = {
	1: {
		text: 'distance is the only new information',
		dot: [420, 92],
		elbow: 'M 492 32 Q 448 48 420 92'
	},
	4: {
		text: 'the wrapper keeps the same count',
		dot: [424, 88],
		elbow: 'M 492 32 Q 450 44 424 88'
	}
}

type Point = [number, number]

const mandala: FigureRenderer = (level, { sides, ratio }: Seed) => {
	const rad = (i: number): number => R_OUT / Math.pow(ratio, RINGS - 1 - i)

	const verts = (cx: number, cy: number, r: number, n: number, rot = 0): Point[] =>
		Array.from({ length: n }, (_, k): Point => {
			const a = rot + (k * 2 * Math.PI) / n - Math.PI / 2
			/* Round: deterministic coords, no long-float drift in the markup. */
			const q = (v: number): number => Math.round(v * 10) / 10
			return [q(cx + r * Math.cos(a)), q(cy + r * Math.sin(a))]
		})

	const pts = (p: Point[]): string => p.map((q) => q.join(',')).join(' ')

	// recursive: the unit drawn at each of its own vertices. Fill stays
	// whisper-quiet (depth cue, not signal); the seed passes its own tint.
	const unit = (
		cx: number,
		cy: number,
		r: number,
		depth: number,
		rot: number,
		stroke: string,
		op: number,
		fill = 'var(--text-primary)',
		fillOp = 0.05
	): string => {
		if (depth <= 0 || r < 3) return ''
		const p = verts(cx, cy, r, sides, rot)
		let out = `<polygon points="${pts(p)}" fill="${fill}" fill-opacity="${fillOp}" stroke="${stroke}" stroke-width="1" opacity="${op}"/>`
		if (depth > 1)
			for (const [x, y] of p)
				out += unit(x, y, r / (ratio * 1.55), depth - 1, rot + Math.PI / sides, stroke, op * 0.72, fill, fillOp)
		return out
	}

	const C = CENTRE
	const lit = level >= 5
	const ink = lit ? 'url(#lum)' : 'var(--text-primary)'
	let g = ''

	// the enclosure — drawn first so it sits behind. Radii stay inside the
	// 512 band with breathing room (Loop §2.4); all values divisible by 4.
	if (level >= 4)
		g += `<g data-spin="-0.9" data-stage="5" opacity=".85">
			<circle data-draw="enclosure" cx="${C}" cy="${C}" r="252" fill="none" pathLength="1" stroke="${lit ? 'var(--theme-color)' : 'var(--border)'}" stroke-width="1.2"/>
			<circle cx="${C}" cy="${C}" r="236" fill="none" stroke="${lit ? 'var(--theme-color)' : 'var(--border)'}" stroke-width="1" stroke-dasharray="1 13" opacity="1"/>
			${verts(C, C, 252, sides * 2)
				.map(
					([x, y], k) =>
						`<circle data-vtx="${k}" cx="${x}" cy="${y}" r="1.6" fill="${lit ? 'var(--theme-color)' : 'var(--border)'}" stroke="transparent" stroke-width="6" style="cursor:pointer"/>`
				)
				.join('')}
		</g>`

	// the spreading — concentric repetitions plus spokes. Inner rings fine
	// (0.8), outer rings strong (1.2); alternate fills give body without shadow.
	if (level >= 1) {
		for (let i = 0; i < RINGS; i++)
			g += `<g data-spin="${(i % 2 ? 1 : -1) * (0.6 + i * 0.22)}" data-stage="${i < 2 ? 1 : 2}">
				<polygon points="${pts(verts(C, C, rad(i), sides, (i * Math.PI) / sides))}" fill="${i % 2 ? 'none' : 'var(--text-primary)'}" fill-opacity="${i % 2 ? 0 : 0.05}" stroke="${ink}" stroke-width="${i < 2 ? 0.8 : i < 4 ? 1 : 1.2}" opacity="${0.24 + i * 0.11}"/>
			</g>`
		g += `<g data-stage="3" opacity="${lit ? 0.3 : 0.18}">${verts(C, C, R_OUT, sides)
			.map(
				([x, y]) =>
					`<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" stroke="${ink}" stroke-width="1" stroke-dasharray="5,4"/>`
			)
			.join('')}</g>`
	}

	// self-similarity — the whole, smaller, at every vertex. Each mini is
	// addressable (data-echo) so hovering its vertex lights it up.
	if (level >= 2)
		g += `<g data-spin="1.5">${verts(C, C, rad(2), sides, Math.PI / sides)
			.map(([x, y], k) => `<g data-echo="${k}" data-stage="4">${unit(x, y, rad(0) * 0.62, 2, 0, ink, 0.62)}</g>`)
			.join('')}</g>`

	// the cluster — motifs orbiting motifs, same hover contract.
	if (level >= 3)
		g += `<g data-spin="-0.55">${verts(C, C, rad(4), sides)
			.map(([x, y], k) => `<g data-cluster="${k}" data-stage="4">${unit(x, y, rad(1) * 0.42, 2, Math.PI / sides, ink, 0.5)}</g>`)
			.join('')}</g>`

	// the seed — always present, always at the centre. The one focal element
	// (style-guide focal rule): accent stroke + tint body + halo + centre mark.
	const seedStroke = lit ? 'url(#lum)' : 'var(--theme-color)'
	g += `<g data-spin="2.2" data-stage="6">${unit(C, C, rad(0), 1, 0, seedStroke, 0.95, 'var(--theme-color)', 0.08)}</g>`
	g += `<g data-stage="6"><circle cx="${C}" cy="${C}" r="8" fill="none" stroke="var(--theme-color)" stroke-width="1" opacity=".18"/>` +
		`<circle cx="${C}" cy="${C}" r="${lit ? 4.5 : 3}" fill="var(--theme-color)"/></g>`
	if (lit)
		g += `<circle cx="${C}" cy="${C}" r="13" fill="none" stroke="var(--theme-color)" stroke-width="1" opacity=".45"/>`

	/* Legend strip: hairline + one mono readout binding the dials to the
	   figure. Single line keeps density at 4/10. */
	const meta = LEVEL_META[level] ?? LEVEL_META[0]
	const readout = `L${level} · ${meta.name} · ${sides} SIDES · RATIO ${ratio.toFixed(2)}`
	const strip =
		`<line x1="32" y1="${STRIP_RULE_Y}" x2="480" y2="${STRIP_RULE_Y}" stroke="var(--border)" stroke-width="0.8" opacity="1"/>` +
		`<text x="${C}" y="${STRIP_TEXT_Y}" fill="var(--text-primary)" font-size="8" text-anchor="middle" letter-spacing="0.14em">${readout}</text>`

	/* Editorial callout for the two levels whose copy names the move. */
	const callout = CALLOUTS[level]
	const aside = callout
		? `<g data-stage="6"><text x="496" y="28" fill="var(--text-secondary)" font-size="12" font-style="italic" font-family="'Instrument Serif', Georgia, serif" text-anchor="end">${callout.text}</text>` +
			`<path d="${callout.elbow}" fill="none" stroke="var(--text-primary)" stroke-width="1" stroke-dasharray="4,3" opacity=".8"/>` +
			`<circle cx="${callout.dot[0]}" cy="${callout.dot[1]}" r="2" fill="var(--text-secondary)"/></g>`
		: ''

	return `<title id="fig-title">${meta.title}</title><desc id="fig-desc">${meta.desc}</desc><defs>
		<linearGradient id="lum" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="var(--theme-color)"/><stop offset="55%" stop-color="var(--theme-color-alt)"/><stop offset="100%" stop-color="var(--text-primary)"/>
		</linearGradient>
		<filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
			<feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
		</filter>
	</defs><g ${lit ? 'filter="url(#glow)"' : ''}>${g}</g>${aside}${strip}`
}

export const figures: Record<FigureKind, FigureRenderer> = { mandala }

export function renderFigure(graphic: Graphic, seed: Seed): string {
	const draw = figures[graphic.kind] ?? figures.mandala
	return draw(graphic.level, seed)
}
