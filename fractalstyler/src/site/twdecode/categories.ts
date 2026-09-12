// twdecode/categories.ts — Pebble 3b: group a resolved token into a design bucket.
// Heuristic on the *core* (variant stripped). Order matters: first match wins.

export type Category =
	| 'Layout'
	| 'Spacing'
	| 'Sizing'
	| 'Border'
	| 'Typography'
	| 'Surface'
	| 'Effect'
	| 'State'
	| 'Other';

const RULES: Array<[Category, RegExp]> = [
	[
		'Layout',
		/^(flex|inline-flex|grid|inline-grid|block|inline-block|hidden|contents|isolate|relative|absolute|fixed|sticky|static|float-|clear-|object-|overflow-|z-|top-|right-|bottom-|left-|inset-|order-|col-|row-|grid-|flex-|basis-|grow|shrink|place-|content-|items-|justify-|self-|align-)/
	],
	['Spacing', /^(-?[mp][trblxy]?-|gap-|space-|divide-)/],
	['Sizing', /^(w-|min-w-|max-w-|h-|min-h-|max-h-|size-|aspect-)/],
	['Border', /^(border|rounded|outline|ring|ring-|outline-|divide-|border-|rounded-)/],
	[
		'Typography',
		/^(text-|font-|tracking-|leading-|align-|whitespace-|break-|truncate|uppercase|lowercase|capitalize|normal-case|italic|not-italic|underline|line-through|no-underline|antialiased|tabular-nums)/
	],
	[
		'Surface',
		/^(bg-|from-|via-|to-|fill-|stroke-|text-(white|black|transparent|inherit|current)|bg-(white|black|transparent|inherit|current)|accent-|caret-|placeholder-|decoration-)/
	],
	[
		'Effect',
		/^(shadow|opacity-|mix-blend-|bg-blend-|blur|brightness-|contrast-|grayscale|hue-rotate|invert|saturate-|sepia|backdrop-|transition|duration-|ease-|delay-|animate-|transform|scale-|rotate-|translate-|skew-|cursor-|pointer-events-|select-|filter|will-change|clip-|mask-)/
	]
];

export function categorize(core: string): Category {
	for (const [cat, re] of RULES) if (re.test(core)) return cat;
	return 'Other';
}

/** Buckets in display order for the design summary. */
export const CATEGORY_ORDER: Category[] = [
	'Layout',
	'Spacing',
	'Sizing',
	'Border',
	'Typography',
	'Surface',
	'Effect',
	'State',
	'Other'
];
