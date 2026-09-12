// Design buckets. Heuristic on the core utility (variant stripped).
// First match wins.

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
		/^(flex|inline-flex|grid|inline-grid|block|inline-block|hidden|contents|isolate|relative|absolute|fixed|sticky|static|float-|clear-|object-|overflow-|overscroll-|z-|top-|right-|bottom-|left-|inset-|start-|end-|order-|col-|row-|grid-|flex-|basis-|grow|shrink|place-|content-|items-|justify-|self-|align-|table|table-|caption-|touch-|scroll-|will-change-)/
	],
	['Spacing', /^(-?[mp][trblxyse]?-|gap-|space-|divide-)/],
	['Sizing', /^(w-|min-w-|max-w-|h-|min-h-|max-h-|size-|aspect-)/],
	['Border', /^(border|rounded|outline|ring|ring-|outline-|divide-|border-|rounded-)/],
	[
		'Typography',
		/^(text-|font-|tracking-|leading-|uppercase|lowercase|capitalize|normal-case|italic|not-italic|underline|overline|line-through|no-underline|decoration-|antialiased|truncate|whitespace-|break-|align-|sr-only|not-sr-only)/
	],
	['Surface', /^(bg-|from-|via-|to-|fill-|stroke-|accent-|caret-|placeholder-)/],
	[
		'Effect',
		/^(shadow|opacity-|mix-blend-|bg-blend-|blur|brightness-|contrast-|grayscale|hue-rotate|invert|saturate-|sepia|backdrop-|transition|duration-|ease-|delay-|animate-|fade-|zoom-|spin-|slide-|transform|scale-|rotate-|translate-|skew-|cursor-|pointer-events-|select-|filter|will-change|clip-|mask-|appearance-|forced-color-|resize-)/
	]
];

export function categorize(core: string): Category {
	for (const [cat, re] of RULES) if (re.test(core)) return cat;
	return 'Other';
}

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
