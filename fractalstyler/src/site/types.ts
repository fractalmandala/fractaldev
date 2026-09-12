/** Seed values the whole figure is derived from. */
export interface Seed {
	sides: number
	ratio: number
}

/** A figure kind registered in figures.ts. */
export type FigureKind = 'mandala'

/** Signature every figure renderer must satisfy. */
export type FigureRenderer = (level: number, seed: Seed) => string

export interface Graphic {
	kind: FigureKind
	/** 0–5. Which accretion of the figure to draw. */
	level: number
}

export interface Footnote {
	label: string
	text: string
}

export interface Example {
	label: string
	/** Real syntax from the system. Newlines are preserved. Wrap anything
	 *  not yet supplied in [[ ]] to render it as a visible placeholder. */
	code: string
}

/**
 * INLINE MARKUP — usable in heading, body, footnote.text and heuristic:
 *   {like this}   emphasised  (violet italic in a heading, gold elsewhere)
 *   *like this*   strong      (brighter, slightly heavier)
 */
export interface Slide {
	/** Slug, for your own reference. */
	id: string
	/** One word, shown on the constellation progress rail. */
	node: string
	/** Eyebrow line above the heading. */
	step: string
	/** The big line. One sentence. Use {} once, not twice. */
	heading?: string
	/** Devanagari line, sits above the heading. */
	sanskrit?: string
	/** Romanised line, sits above the heading. */
	translit?: string
	/** Paragraphs. Two is the rhythm, three is the ceiling. */
	body?: string[]
	/** Staggered-reveal treatment, sits where the heading would. */
	heuristic?: string[]
	/** Show the seed + ratio controls. */
	dials: boolean
	graphic: Graphic
	/** Small line under the graphic. Lowercase, no period. */
	caption: string
	/** The quiet translation line. */
	footnote?: Footnote
	example?: Example
}

export interface Deck {
	wordmark: string
	seed: Seed
	dialLabels: Record<keyof Seed, string>
	dialNote: string
}

// ─────────────────────────────────────────────────────────────────────────────
// ACT II — the system deck.
//
// Act I teaches the rule with no class names in it. Act II hands over the
// instrument: one specimen, assembled across nine screens, rendered by the
// real compiled stylesheet. Everything below extends the Act I contract —
// nothing above it changed, so `orientation.data.ts` still type-checks.
// ─────────────────────────────────────────────────────────────────────────────

/** An interactive control rig. One per screen, registered in rigs/index.ts. */
export type RigKind =
	| 'none'
	| 'ruler'
	| 'stepwheel'
	| 'axispad'
	| 'harmony'
	| 'shell'
	| 'dress'
	| 'compact'

export interface Rig {
	kind: RigKind
	/** Rig-specific options. Each rig documents its own shape.  */
	config?: Record<string, unknown>
}

/** What a screen contributes to the running ledger. */
export interface LedgerPatch {
	/** Human label for the lines this screen added. */
	label: string
	/** Classes lit as "new" while this screen is current. */
	fresh: string[]
}

/** The one artifact, carried across every screen. Never resets. */
export interface Specimen {
	/** Simulated viewport for the ruler-driven stages, in px. */
	viewport: number
	gap: SpaceStep
	pad: SpaceStep
	/** Which container primitive the specimen's root is. */
	axis: 'box' | 'row'
	alignX: string
	alignY: string
	/** How many cards the harmony grid holds. */
	count: 3 | 4 | 6
	/** L4 drawer disclosure. */
	drawer: boolean
	surface: 'surface' | 'raised' | 'panel'
	bordered: boolean
	radius: 'radius-sm' | 'radius-md' | 'radius-lg' | ''
	presets: Presets
}

export type SpaceStep = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'bs' | 'lg' | 'xl' | '2xl' | '3xl'

/** The four preset axes, stamped as data-attributes on the vitrine root. */
export interface Presets {
	/** A built-in palette class, or '' for the plain mode defaults. */
	theme: string
	shape: '' | 'round' | 'curved' | 'pro' | 'sharp'
	layout: '' | 'tight' | 'comfortable' | 'sprawling'
	color: '' | 'clean' | 'general' | 'vibrant'
	motion: '' | 'reduced' | 'active' | 'heavy' | 'springy'
	mode: 'dark' | 'light'
}

/** A screen in the system deck. Reuses every Act I field it can. */
export interface SystemSlide {
	id: string
	node: string
	step: string
	level?: string
	heading?: string
	body?: string[]
	heuristic?: string[]
	rig: Rig
	ledger?: LedgerPatch
	/** The quiet translation line, same shape as Act I. */
	footnote?: Footnote
	/** Which doc this screen is drawn from, shown as a source line. */
	source?: string
}

export interface SystemDeck {
	wordmark: string
	specimen: Specimen
}
