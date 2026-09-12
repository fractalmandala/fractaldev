// Playground class catalogue — typed view over configurations-api §6.
// Only names the registry emits. No Sass here, no new classes.

export const STEPS = ['2xs', 'xs', 'sm', 'md', 'bs', 'lg', 'xl', '2xl', '3xl'] as const;
export type Step = (typeof STEPS)[number];

export const SPACE_LITERALS = [0, 1, 2, 4, 6, 8, 12, 16, 24, 32, 40, 48, 56, 64] as const;
export const RADIUS_LITERALS = [0, 2, 3, 4, 6, 8, 12, 16, 24] as const;

export const GAP_FAMILIES = ['gap', 'rgap', 'cgap'] as const;
export const PAD_FAMILIES = [
	'pad',
	'pad-x',
	'pad-y',
	'pad-top',
	'pad-right',
	'pad-bottom',
	'pad-left'
] as const;
export const MARG_FAMILIES = [
	'marg',
	'marg-x',
	'marg-y',
	'marg-top',
	'marg-right',
	'marg-bottom',
	'marg-left'
] as const;

export interface QuickGroup {
	id: string;
	label: string;
	hint: string;
	items: string[];
}

export const QUICK_GROUPS: QuickGroup[] = [
	{
		id: 'container',
		label: 'Container',
		hint: 'box / row / grid + alignment nests under base',
		items: [
			'box',
			'box xcenter',
			'box ycenter',
			'box xcenter ycenter',
			'row',
			'row xbetween ycenter',
			'row xcenter ycenter',
			'grid',
			'grid center',
			'wrap',
			'grow',
			'scroll-y',
			'scroll-x'
		]
	},
	{
		id: 'gap',
		label: 'Gap',
		hint: 'needs a layout — gaps never enable layout',
		items: ['gap-xs', 'gap-sm', 'gap-md', 'gap-bs', 'gap-lg', 'gap-xl', 'gap-16', 'rgap-md', 'cgap-md']
	},
	{
		id: 'pad',
		label: 'Pad',
		hint: 'container breathing × --pad-scale',
		items: ['pad-xs', 'pad-sm', 'pad-md', 'pad-bs', 'pad-lg', 'pad-xl', 'pad-x-md', 'pad-y-lg']
	},
	{
		id: 'layout',
		label: 'Layouts',
		hint: 'grids step 1→2→4, 1→3, 1→2→3→6 — never orphan a card',
		items: ['grid-1', 'grid-2', 'grid-3', 'grid-4', 'grid-6', 'card-grid', 'prose', 'reel', 'frame-16-9', 'frame-1-1']
	},
	{
		id: 'surface',
		label: 'Surfaces',
		hint: 'one declaration each over --bg-*',
		items: ['bg', 'surface', 'raised', 'panel', 'canvas', 'terminal']
	},
	{
		id: 'ink',
		label: 'Ink + type',
		hint: 'text-* over --text-*, sizes are fluid clamps',
		items: [
			'text-primary',
			'text-secondary',
			'text-muted',
			'text-theme',
			'text-success',
			'text-warning',
			'text-danger',
			'text-info',
			'text-xs',
			'text-sm',
			'text-bs',
			'text-lg',
			'text-xl',
			'text-2xl',
			'weight-500',
			'weight-700',
			'eyebrow',
			'mono',
			'ta-c',
			'truncate'
		]
	},
	{
		id: 'border',
		label: 'Borders + radius + shadow',
		hint: 'literals bypass data-shape, channels follow it',
		items: [
			'border',
			'border-top',
			'border-subtle',
			'radius-sm',
			'radius-md',
			'radius-lg',
			'radius-full',
			'radius-8',
			'radius-16',
			'shadow-sm',
			'shadow-md',
			'shadow-lg'
		]
	},
	{
		id: 'component',
		label: 'Components',
		hint: 'card, field, badge, pill, kbd, avatar, divider',
		items: ['card', 'badge', 'pill', 'pill active', 'kbd', 'avatar', 'divider', 'field', 'field-label']
	},
	{
		id: 'interaction',
		label: 'Inputs + buttons',
		hint: 'modifiers never stand alone — .button.primary not .primary',
		items: [
			'button',
			'button primary',
			'button ghost',
			'button small',
			'button is-icon',
			'input',
			'select',
			'link',
			'tab-list',
			'tab-trigger active'
		]
	},
	{
		id: 'compound',
		label: 'Compounds',
		hint: 'border → pad → gap, suffix once: b-ps-gl-desk',
		items: ['b-ps-gl', 'b-px:sm-gr:lg', 'ps-gb', 'b-pl:sm-gr:lg', 'px:sm-gr:lg', 'b-ps-gl-desk']
	},
	{
		id: 'sizing',
		label: 'Sizing',
		hint: 'full ladder to 512 for w/h/square only',
		items: ['w-64', 'h-64', 'square-64', 'wfull', 'hfull-vh', 'min0']
	}
];

/** Small known-class set for inline validation + autocomplete. */
const KNOWN = new Set<string>();

function buildKnown(): void {
	if (KNOWN.size) return;
	for (const g of QUICK_GROUPS) for (const item of g.items) for (const t of item.split(' ')) KNOWN.add(t);
	for (const f of [...GAP_FAMILIES, ...PAD_FAMILIES]) {
		for (const s of STEPS) KNOWN.add(`${f}-${s}`);
		for (const n of SPACE_LITERALS) KNOWN.add(`${f}-${n}`);
	}
	for (const f of MARG_FAMILIES) {
		for (const s of STEPS) {
			KNOWN.add(`${f}-${s}`);
			KNOWN.add(`${f}--${s}`);
		}
		for (const n of SPACE_LITERALS) {
			KNOWN.add(`${f}-${n}`);
			KNOWN.add(`${f}--${n}`);
		}
	}
	for (const n of RADIUS_LITERALS) KNOWN.add(`radius-${n}`);
	// Alignment modifiers nest under their base in _03_containers.sass
	// (box.xcenter, row.xbetween…) — valid only alongside the base.
	for (const m of [
		'xcenter',
		'xleft',
		'xright',
		'xbetween',
		'xevenly',
		'xaround',
		'xstretch',
		'ycenter',
		'ytop',
		'ybot',
		'ybetween',
		'yevenly',
		'yaround',
		'ystretch',
		'center'
	])
		KNOWN.add(m);
	// Interaction modifiers nest under .button / .pill in _07_interactions.sass
	// (button.small, pill.active…) — valid only alongside the base.
	for (const m of ['small', 'ghost', 'primary', 'outline', 'active', 'is-icon', 'themed', 'hoverstyle', 'bord0', 'blank'])
		KNOWN.add(m);
	KNOWN.add('pill');
	KNOWN.add('weight-800');
	for (const t of ['box', 'row', 'grid', 'wrap', 'grow', 'shrink-0', 'relative', 'card-grid', 'prose', 'reel', 'card', 'badge', 'pill', 'kbd', 'avatar', 'divider', 'field', 'input', 'select', 'link', 'button', 'border', 'surface', 'raised', 'panel', 'bg', 'canvas', 'terminal'])
		KNOWN.add(t);
}

export function isKnownClass(token: string): boolean {
	buildKnown();
	if (!token) return true;
	if (token.endsWith('-mob') || token.endsWith('-desk')) return isKnownClass(token.replace(/-(mob|desk)$/, ''));
	return KNOWN.has(token);
}

/** Split a class string, marking unknown tokens for the inline hint. */
export function splitClasses(classes: string): { token: string; known: boolean }[] {
	return classes
		.split(/\s+/)
		.filter(Boolean)
		.map((token) => ({ token, known: isKnownClass(token) }));
}

export function suggestClasses(query: string, limit = 8): string[] {
	buildKnown();
	const q = query.toLowerCase();
	if (!q) return [...QUICK_GROUPS[1].items].slice(0, limit);
	return [...KNOWN].filter((c) => c.toLowerCase().includes(q)).slice(0, limit);
}
