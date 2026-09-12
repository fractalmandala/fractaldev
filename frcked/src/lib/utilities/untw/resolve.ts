// Token resolution against the prebuilt compiler-output map, with exact
// arithmetic synthesis for v4's linear scales and @theme synthesis for custom
// names. No compiler, no network, no model at runtime.

import MAP from './resolution-map.json';
import { splitChain, labelChain } from './variants';
import { categorize } from './categories';
import { suggestFractal, spacingPx } from './fractal';
import { isDynamic } from './extract';
import type { ThemeInfo } from './theme';

const TABLE = MAP as Record<string, string[]>;

export interface Resolved {
	token: string;
	variants: string[];
	conditions: string[];
	core: string;
	/** merged declarations (@supports color-mix overrides already applied) */
	css: string | null;
	/** pre-color-mix fallback, when the map entry recorded one */
	fallback: string | null;
	px: number | null;
	category: string;
	fractal: string | null;
	unknown: boolean;
	/** group/group-name anchors emit no CSS of their own */
	marker: boolean;
	/** produced by arithmetic or theme synthesis rather than the map */
	synthesized: boolean;
	/** short machine hint for unknowns (custom-theme?, plugin?, typo?) */
	hint: string | null;
}

const HUES = [
	'slate',
	'gray',
	'zinc',
	'neutral',
	'stone',
	'red',
	'orange',
	'amber',
	'yellow',
	'lime',
	'green',
	'emerald',
	'teal',
	'cyan',
	'sky',
	'blue',
	'indigo',
	'violet',
	'purple',
	'fuchsia',
	'pink',
	'rose'
];
const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const KNOWN_COLORS = new Set<string>([
	...HUES.flatMap((h) => STEPS.map((s) => `${h}-${s}`)),
	'black',
	'white',
	'transparent',
	'current',
	'inherit'
]);

const LINEAR: Record<string, string> = {
	p: 'padding',
	px: 'padding-inline',
	py: 'padding-block',
	pt: 'padding-top',
	pr: 'padding-right',
	pb: 'padding-bottom',
	pl: 'padding-left',
	ps: 'padding-inline-start',
	pe: 'padding-inline-end',
	m: 'margin',
	mx: 'margin-inline',
	my: 'margin-block',
	mt: 'margin-top',
	mr: 'margin-right',
	mb: 'margin-bottom',
	ml: 'margin-left',
	ms: 'margin-inline-start',
	me: 'margin-inline-end',
	gap: 'gap',
	'gap-x': 'column-gap',
	'gap-y': 'row-gap',
	inset: 'inset',
	'inset-x': 'inset-inline',
	'inset-y': 'inset-block',
	top: 'top',
	right: 'right',
	bottom: 'bottom',
	left: 'left',
	start: 'inset-inline-start',
	end: 'inset-inline-end',
	w: 'width',
	h: 'height',
	'min-w': 'min-width',
	'max-w': 'max-width',
	'min-h': 'min-height',
	'max-h': 'max-height',
	basis: 'flex-basis'
};

// single-prop color cores; value is the var() they read (theme colors) — the
// opacity form wraps the same var in color-mix.
const COLOR_PROPS: Record<string, string> = {
	bg: 'background-color',
	text: 'color',
	border: 'border-color',
	'border-t': 'border-top-color',
	'border-r': 'border-right-color',
	'border-b': 'border-bottom-color',
	'border-l': 'border-left-color',
	'border-x': 'border-inline-color',
	'border-y': 'border-block-color',
	'border-s': 'border-inline-start-color',
	'border-e': 'border-inline-end-color',
	ring: '--tw-ring-color',
	divide: 'border-color',
	decoration: 'text-decoration-color',
	outline: 'outline-color',
	accent: 'accent-color',
	caret: 'caret-color',
	fill: 'fill',
	stroke: 'stroke'
};

const NUM = '(\\d+(?:\\.\\d+)?)';

function linearDecl(prop: string, n: number): string {
	return `${prop}: calc(var(--spacing) * ${n})`;
}

/** Exact v4 synthesis for linear numeric scales. Null when not synthesizable. */
function synthesizeNumeric(core: string): string | null {
	let m = core.match(new RegExp(`^(-)?([a-z]+(?:-[xy])?)-${NUM}$`));
	if (m) {
		const neg = m[1] ? -1 : 1;
		const pre = m[2];
		const n = parseFloat(m[3]) * neg;
		if (LINEAR[pre]) {
			if (pre === 'size') return `${linearDecl('width', n)}; ${linearDecl('height', n)}`;
			return linearDecl(LINEAR[pre], n);
		}
		if (pre === 'space-x')
			return `--tw-space-x-reverse: 0; margin-inline-start: calc(calc(var(--spacing) * ${n}) * var(--tw-space-x-reverse)); margin-inline-end: calc(calc(var(--spacing) * ${n}) * calc(1 - var(--tw-space-x-reverse)))`;
		if (pre === 'space-y')
			return `--tw-space-y-reverse: 0; margin-block-start: calc(calc(var(--spacing) * ${n}) * var(--tw-space-y-reverse)); margin-block-end: calc(calc(var(--spacing) * ${n}) * calc(1 - var(--tw-space-y-reverse)))`;
		return null;
	}
	m = core.match(new RegExp(`^(z|opacity|order|duration|delay)-(-?${NUM})$`));
	if (m) {
		const n = m[2];
		if (m[1] === 'z') return `z-index: ${n}`;
		if (m[1] === 'opacity') return `opacity: ${n}%`;
		if (m[1] === 'order') return `order: ${n}`;
		if (m[1] === 'duration') return `--tw-duration: ${n}ms; transition-duration: ${n}ms`;
		return `transition-delay: ${n}ms`;
	}
	m = core.match(/^grid-cols-(\d+)$/);
	if (m) return `grid-template-columns: repeat(${m[1]}, minmax(0, 1fr))`;
	m = core.match(/^(col|row)-span-(\d+)$/);
	if (m) return `grid-${m[1] === 'col' ? 'column' : 'row'}: span ${m[2]} / span ${m[2]}`;
	m = core.match(/^(col|row)-(start|end)-(\d+)$/);
	if (m) return `grid-${m[1] === 'col' ? 'column' : 'row'}-${m[2]}: ${m[3]}`;
	m = core.match(/^(-?)rotate-(\d+(?:\.\d+)?)$/);
	if (m) return `rotate: ${m[1] ? '-' : ''}${m[2]}deg`;
	m = core.match(/^underline-offset-(\d+)$/);
	if (m) return `text-underline-offset: ${m[1]}px`;
	m = core.match(/^decoration-(\d+)$/);
	if (m) return `text-decoration-thickness: ${m[1]}px`;
	m = core.match(/^basis-(\d+)\/(\d+)$/);
	if (m) return `flex-basis: calc(${m[1]} / ${m[2]} * 100%)`;
	m = core.match(/^([wh]|size|min-w|max-w|min-h|max-h)-(\d+)\/(\d+)$/);
	if (m) {
		const v = `calc(${m[2]} / ${m[3]} * 100%)`;
		if (m[1] === 'size') return `width: ${v}; height: ${v}`;
		const prop = LINEAR[m[1]] ?? m[1];
		return `${prop}: ${v}`;
	}
	return null;
}

const COLOR_PREFIX =
	'bg|text|border-(?:[trblxyse])|border|ring|divide|decoration|outline|accent|caret|fill|stroke';

/** Concrete color literal (not a var() indirection)? usable for srgb fallbacks. */
function isColorLiteral(value: string): boolean {
	const v = value.trim().toLowerCase();
	return (
		/^(oklch|oklab|rgb|hsl|lab|lch|color-mix|light-dark)\(/.test(v) || /^#[0-9a-f]{3,8}$/.test(v)
	);
}

/** Value a theme-keyed utility reads: inlined declaration, else its var. */
function themeValue(kind: string, name: string, theme: ThemeInfo): string {
	const d = theme.detail[`${kind}:${name}`];
	if (d && d.inline) return d.value;
	return `var(--${kind}-${name})`;
}

/** Opacity-modified color: bg-red-500/10 (known or theme color names). */
function synthesizeOpacity(
	core: string,
	theme: ThemeInfo
): { css: string; fallback: string | null } | null {
	const m = core.match(new RegExp(`^(${COLOR_PREFIX})-(.+?)\\/(\\d{1,3})$`));
	if (!m) return null;
	const prop = COLOR_PROPS[m[1]];
	if (!prop) return null;
	const name = m[2];
	const o = Math.min(100, parseInt(m[3], 10));
	const isTheme = theme.colors.has(name);
	if (!KNOWN_COLORS.has(name) && !isTheme) return null;
	const base = isTheme ? themeValue('color', name, theme) : `var(--color-${name})`;
	const css = `${prop}: color-mix(in oklab, ${base} ${o}%, transparent)`;
	// verified progressive-enhancement fallback: concrete literals precompute the
	// srgb mix, var() indirections stay plain. Default-palette fallbacks need
	// literal oklch values the offline engine does not ship — omitted, not faked.
	let fallback: string | null = null;
	if (isTheme) {
		const detail = theme.detail[`color:${name}`];
		fallback =
			detail && isColorLiteral(detail.value)
				? `${prop}: color-mix(in srgb, ${detail.value} ${o}%, transparent)`
				: `${prop}: ${base}`;
	}
	return { css, fallback };
}

/** Arbitrary values: min-w-[96px], max-h-(--radix-x), origin-(--y). */
function synthesizeArbitrary(core: string): string | null {
	const arb = core.match(/^([a-z0-9-]+?)-(\[.*\]|\(--.*\))$/);
	if (!arb) return null;
	const pre = arb[1];
	const raw = arb[2];
	const val = raw.startsWith('[')
		? raw.slice(1, -1).replace(/_/g, ' ')
		: `var(${raw.slice(1, -1)})`;
	const prop =
		LINEAR[pre] ??
		{
			'min-w': 'min-width',
			'max-w': 'max-width',
			'min-h': 'min-height',
			'max-h': 'max-height',
			origin: 'transform-origin',
			size: null as unknown as string
		}[pre];
	if (!prop) {
		if (pre === 'size') return `width: ${val}; height: ${val}`;
		if (pre === 'text') return `font-size: ${val}`;
		if (pre === 'shadow') return `box-shadow: ${val}`;
		if (pre === 'rounded') return `border-radius: ${val}`;
		if (pre === 'z') return `z-index: ${val}`;
		if (pre === 'opacity') return `opacity: ${val}`;
		if (pre === 'order') return `order: ${val}`;
		if (pre === 'rotate') return `rotate: ${val}`;
		return null;
	}
	if (pre === 'size') return `width: ${val}; height: ${val}`;
	return `${prop}: ${val}`;
}
/** Custom @theme names: bg-foo, text-foo, rounded-foo, animate-foo, font-foo. */
function synthesizeTheme(core: string, theme: ThemeInfo): string | null {
	let m = core.match(new RegExp(`^(${COLOR_PREFIX})-(.+)$`));
	if (m && COLOR_PROPS[m[1]] && theme.colors.has(m[2])) {
		if (m[1] === 'ring') return `--tw-ring-color: ${themeValue('color', m[2], theme)}`;
		return `${COLOR_PROPS[m[1]]}: ${themeValue('color', m[2], theme)}`;
	}
	m = core.match(/^rounded-(.+)$/);
	if (m && theme.radii.has(m[1])) return `border-radius: ${themeValue('radius', m[1], theme)}`;
	m = core.match(/^animate-(.+)$/);
	if (m && theme.animates.has(m[1])) return `animation: ${themeValue('animate', m[1], theme)}`;
	m = core.match(/^font-(.+)$/);
	if (m && theme.fonts.has(m[1])) return `font-family: var(--font-${m[1]})`;
	m = core.match(/^text-(.+)$/);
	if (m && theme.texts.has(m[1]))
		return `font-size: var(--text-${m[1]}); line-height: var(--tw-leading, var(--text-${m[1]}--line-height))`;
	return null;
}

function unknownHint(core: string, variants: string[], theme: ThemeInfo): string {
	if (variants.length > 0 && core.includes('[')) return 'custom variant value';
	for (const prefix of [
		'bg-',
		'text-',
		'border-',
		'ring-',
		'from-',
		'via-',
		'to-',
		'accent-',
		'decoration-'
	]) {
		if (core.startsWith(prefix)) {
			const rest = core.slice(prefix.length).split('/')[0];
			if (!KNOWN_COLORS.has(rest) && !theme.colors.has(rest))
				return theme.colors.size > 0
					? 'not in pasted theme — typo or missing @theme entry?'
					: 'custom theme color? paste @theme CSS and convert again';
		}
	}
	if (/^animate-/.test(core))
		return 'custom animation? paste @theme CSS with its @keyframes and convert again';
	if (/^(placeholder|file|marker|selection)-/.test(core))
		return 'v4 variant-position utility — write as placeholder:… / file:…';
	return 'not a default-theme utility — typo, plugin, or project @utility?';
}

export function resolveToken(token: string, theme: ThemeInfo): Resolved {
	const base = {
		token,
		variants: [] as string[],
		conditions: [] as string[],
		core: token,
		css: null as string | null,
		fallback: null as string | null,
		px: null as number | null,
		category: 'Other',
		fractal: null as string | null,
		unknown: false,
		marker: false,
		synthesized: false,
		hint: null as string | null
	};
	if (isDynamic(token)) {
		return {
			...base,
			unknown: true,
			hint: 'dynamic value — cannot resolve statically; add to safelist'
		};
	}
	const { variants, core } = splitChain(token);
	base.variants = variants;
	base.conditions = labelChain(variants);
	base.core = core;
	// group anchors emit no CSS; they only name the hook group-* variants read
	if (/^group(\/[a-z0-9_-]+)?$/.test(core)) {
		return { ...base, marker: true, category: 'State', hint: 'group anchor — no CSS of its own' };
	}
	const themed =
		theme.colors.size +
			theme.radii.size +
			theme.animates.size +
			theme.fonts.size +
			theme.texts.size >
		0;
	const entry = TABLE[core];
	// With a pasted theme, utilities reading an overridden --color-*/--radius-*/
	// --animate-* name are re-derived so custom values win over default-theme map
	// rows. Map rows (real compiler output) stay authoritative everywhere else.
	const op = synthesizeOpacity(core, theme);
	const th = themed ? synthesizeTheme(core, theme) : null;
	const use = (css: string, fallback: string | null) => {
		base.css = css;
		base.fallback = fallback;
		base.synthesized = !entry || css !== entry[0];
	};
	if (th) use(th, null);
	else if (op && op.fallback) use(op.css, op.fallback);
	else if (entry) {
		base.css = entry[0];
		base.fallback = entry[1] ?? null;
	} else if (op) use(op.css, null);
	else {
		const synth = synthesizeNumeric(core) ?? synthesizeArbitrary(core);
		if (synth) {
			base.css = synth;
			base.synthesized = true;
		} else {
			base.unknown = true;
			base.hint = unknownHint(core, variants, theme);
		}
	}
	base.px = spacingPx(core);
	base.category = base.unknown && variants.length > 0 ? 'State' : categorize(core);
	base.fractal = suggestFractal(core);
	return base;
}
