// Bracket-aware variant-chain splitting plus human condition labels.
// `data-[side=bottom]:slide-in-from-top-2` -> variants [data-[side=bottom]],
// core slide-in-from-top-2. Colons inside [...] (and quotes inside those) never
// split. Pure TypeScript, zero dependencies.

/** Split a token into its variant chain and core utility. */
export function splitChain(token: string): { variants: string[]; core: string } {
	const parts: string[] = [];
	let depth = 0;
	let quote = '';
	let cur = '';
	for (const ch of token) {
		if (quote) {
			cur += ch;
			if (ch === quote) quote = '';
			continue;
		}
		if (ch === '"' || ch === "'") {
			quote = ch;
			cur += ch;
			continue;
		}
		if (ch === '[') depth++;
		if (ch === ']') depth = Math.max(0, depth - 1);
		if (ch === ':' && depth === 0) {
			parts.push(cur);
			cur = '';
			continue;
		}
		cur += ch;
	}
	parts.push(cur);
	if (parts.length === 1) return { variants: [], core: token };
	return { variants: parts.slice(0, -1), core: parts[parts.length - 1] };
}

const BREAKPOINTS: Record<string, string> = {
	sm: 'viewport ≥ 640px',
	md: 'viewport ≥ 768px',
	lg: 'viewport ≥ 1024px',
	xl: 'viewport ≥ 1280px',
	'2xl': 'viewport ≥ 1536px'
};

const PSEUDO: Record<string, string> = {
	hover: 'on hover',
	focus: 'on focus',
	'focus-visible': 'on keyboard focus',
	'focus-within': 'when a child has focus',
	active: 'while pressed',
	visited: 'after visit',
	target: 'when targeted',
	disabled: 'when disabled',
	enabled: 'when enabled',
	checked: 'when checked',
	indeterminate: 'when indeterminate',
	required: 'when required',
	optional: 'when optional',
	valid: 'when valid',
	invalid: 'when invalid',
	'in-range': 'when in range',
	'out-of-range': 'when out of range',
	'placeholder-shown': 'when placeholder shown',
	autofill: 'on autofill',
	'read-only': 'when read-only',
	first: 'first child',
	last: 'last child',
	only: 'only child',
	odd: 'odd children',
	even: 'even children',
	'first-of-type': 'first of type',
	'last-of-type': 'last of type',
	'only-of-type': 'only of type',
	open: 'when open',
	closed: 'when closed',
	empty: 'when empty',
	'motion-safe': 'when motion allowed',
	'motion-reduce': 'when motion reduced',
	'contrast-more': 'when high contrast',
	'contrast-less': 'when low contrast',
	print: 'when printing',
	portrait: 'in portrait',
	landscape: 'in landscape',
	ltr: 'left-to-right',
	rtl: 'right-to-left',
	dark: 'in dark mode',
	light: 'in light mode'
};

/** Human label for one variant segment. */
export function labelVariant(v: string): string {
	if (v === '*') return 'for direct children';
	if (v === '**') return 'for all descendants';
	if (BREAKPOINTS[v]) return `at ${BREAKPOINTS[v]} (default theme)`;
	if (PSEUDO[v]) return PSEUDO[v];
	if (v.startsWith('max-')) {
		const inner = v.slice(4);
		if (BREAKPOINTS[inner])
			return `below ${BREAKPOINTS[inner].replace('≥', '').trim()} (default theme)`;
		return `below ${inner}`;
	}
	if (v.startsWith('min-')) return `at ${v.slice(4)} and up`;
	let m = v.match(/^not-(.+)$/);
	if (m) return `not (${labelVariant(m[1])})`;
	m = v.match(/^data-\[([^=]+)=([^\]]+)\]$/);
	if (m) return `when data-${m[1]}=${m[2]}`;
	m = v.match(/^data-(.+)$/);
	if (m) return `when data-${m[1]} present`;
	m = v.match(/^aria-\[([^=]+)=([^\]]+)\]$/);
	if (m) return `when aria-${m[1]}=${m[2]}`;
	m = v.match(/^aria-(.+)$/);
	if (m) return `when aria-${m[1]} true`;
	m = v.match(/^(group|peer)(?:-([a-z0-9_-]+))?(?:\/([a-z0-9_-]+))?$/);
	if (m) return `when ${m[1]}${m[3] ? ` “${m[3]}”` : ''} is ${m[2] ?? 'marked'}`;
	m = v.match(/^supports-\[(.+)\]$/);
	if (m) return `when supporting ${m[1].replace(/_/g, ' ')}`;
	m = v.match(/^has-\[(.+)\]$/);
	if (m) return `when containing ${m[1].replace(/_/g, ' ')}`;
	if (v.startsWith('[') && v.endsWith(']')) return `for ${v.slice(1, -1).replace(/_/g, ' ')}`;
	return `when ${v}`;
}

/** Labels for a full variant chain, in order. */
export function labelChain(variants: string[]): string[] {
	return variants.map(labelVariant);
}
