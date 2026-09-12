// Playground token system — typed view over _00_tokens.sass + _00_presets.sass.
// SCOPE RULE: every edit here applies as an inline var on the canvas wrapper
// (style="--bg: ..."), never on :root. The page around the playground does not move.
// Compile-time Sass ($...) is deliberately absent — nothing here needs a recompile.

export type TokenKind = 'color' | 'length' | 'number' | 'shadow' | 'font';
export type TokenGroup =
	| 'surface'
	| 'ink'
	| 'status'
	| 'space'
	| 'radius'
	| 'density'
	| 'layout';

export interface TokenDef {
	name: string;
	group: TokenGroup;
	kind: TokenKind;
	label: string;
	def: string;
	readBy: string;
}

export const TOKEN_GROUPS: { id: TokenGroup; label: string; hint: string }[] = [
	{ id: 'surface', label: 'Surfaces', hint: 'Card, panel and page fills' },
	{ id: 'ink', label: 'Ink + accent', hint: 'Text and theme colour' },
	{ id: 'status', label: 'Status', hint: 'Success, warning, danger, info' },
	{ id: 'space', label: 'Space steps', hint: 'What gap-* / pad-* compute to' },
	{ id: 'radius', label: 'Radius', hint: 'Shape channels + card geometry' },
	{ id: 'density', label: 'Density', hint: 'Gap / pad multipliers' },
	{ id: 'layout', label: 'Layout', hint: 'Card min, measure, avatar' }
];

export const TOKEN_DEFS: TokenDef[] = [
	// Surfaces — color inputs
	{ name: '--bg', group: 'surface', kind: 'color', label: 'Page bg', def: '#ffffff', readBy: '.bg' },
	{ name: '--bg-surface', group: 'surface', kind: 'color', label: 'Surface', def: '#eae9e8', readBy: '.surface .card .pill' },
	{ name: '--bg-raised', group: 'surface', kind: 'color', label: 'Raised', def: '#d0d0d2', readBy: '.raised .kbd' },
	{ name: '--bg-panel', group: 'surface', kind: 'color', label: 'Panel', def: '#eae9e8', readBy: '.panel' },
	{ name: '--bg-popover', group: 'surface', kind: 'color', label: 'Popover', def: '#e6e8e9', readBy: '.popover' },
	{ name: '--bg-dialog', group: 'surface', kind: 'color', label: 'Dialog', def: '#e6e6e6', readBy: '.dialog .badge' },
	{ name: '--bg-input', group: 'surface', kind: 'color', label: 'Input', def: '#ffffff', readBy: '.input .select' },
	{ name: '--border', group: 'surface', kind: 'color', label: 'Border', def: '#e9ebed', readBy: '.border .card' },
	// Ink + accent
	{ name: '--text-primary', group: 'ink', kind: 'color', label: 'Text 1', def: '#0f172a', readBy: '.text-primary' },
	{ name: '--text-secondary', group: 'ink', kind: 'color', label: 'Text 2', def: '#717171', readBy: '.text-secondary' },
	{ name: '--text-muted', group: 'ink', kind: 'color', label: 'Muted', def: '#a3a4a7', readBy: '.text-muted .eyebrow' },
	{ name: '--theme-color', group: 'ink', kind: 'color', label: 'Theme', def: '#2F9E44', readBy: '.text-theme .link .button.primary' },
	{ name: '--theme-color-alt', group: 'ink', kind: 'color', label: 'Theme alt', def: '#2d9206', readBy: '.text-alt hover states' },
	// Status
	{ name: '--success', group: 'status', kind: 'color', label: 'Success', def: '#10B981', readBy: '.text-success .bg-success' },
	{ name: '--warning', group: 'status', kind: 'color', label: 'Warning', def: '#F59E0B', readBy: '.text-warning .bg-warning' },
	{ name: '--danger', group: 'status', kind: 'color', label: 'Danger', def: '#EF4444', readBy: '.text-danger .bg-danger' },
	{ name: '--info', group: 'status', kind: 'color', label: 'Info', def: '#3B82F6', readBy: '.text-info .bg-info' },
	// Space steps — length inputs override the fluid clamp for testing
	{ name: '--space-2xs', group: 'space', kind: 'length', label: '2xs', def: '0', readBy: '.gap-2xs .pad-2xs' },
	{ name: '--space-xs', group: 'space', kind: 'length', label: 'xs', def: 'clamp(2px, 4px)', readBy: '.gap-xs .pad-xs' },
	{ name: '--space-sm', group: 'space', kind: 'length', label: 'sm', def: '~8px fluid', readBy: '.gap-sm .pad-sm' },
	{ name: '--space-md', group: 'space', kind: 'length', label: 'md', def: '~12px fluid', readBy: '.gap-md .pad-md' },
	{ name: '--space-bs', group: 'space', kind: 'length', label: 'bs', def: '~16px fluid', readBy: '.gap-bs .pad-bs' },
	{ name: '--space-lg', group: 'space', kind: 'length', label: 'lg', def: '~24px fluid', readBy: '.gap-lg .pad-lg' },
	{ name: '--space-xl', group: 'space', kind: 'length', label: 'xl', def: '~32px fluid', readBy: '.gap-xl .pad-xl' },
	{ name: '--space-2xl', group: 'space', kind: 'length', label: '2xl', def: '~48px fluid', readBy: '.gap-2xl .pad-2xl' },
	{ name: '--space-3xl', group: 'space', kind: 'length', label: '3xl', def: '~64px fluid', readBy: '.gap-3xl .pad-3xl' },
	// Radius channels — the ones .radius-sm/md/lg read + data-shape remaps
	{ name: '--radius-sm', group: 'radius', kind: 'length', label: 'radius sm', def: '8px', readBy: '.radius-sm .kbd' },
	{ name: '--radius-md', group: 'radius', kind: 'length', label: 'radius md', def: '16px', readBy: '.radius-md .card .input' },
	{ name: '--radius-lg', group: 'radius', kind: 'length', label: 'radius lg', def: '24px', readBy: '.radius-lg .pill' },
	// Density multipliers — direct override; data-layout preset also sets these
	{ name: '--gap-scale', group: 'density', kind: 'number', label: 'gap scale', def: '1', readBy: '.gap-* .marg-*' },
	{ name: '--pad-scale', group: 'density', kind: 'number', label: 'pad scale', def: '1', readBy: '.pad-*' },
	// Layout geometry
	{ name: '--card-min', group: 'layout', kind: 'length', label: 'card min', def: '16rem', readBy: '.card-grid' },
	{ name: '--avatar-size', group: 'layout', kind: 'length', label: 'avatar', def: '32px', readBy: '.avatar' },
	{ name: '--measure', group: 'layout', kind: 'length', label: 'measure', def: '65ch', readBy: '.prose' }
];

export interface TokenOverride {
	token: string;
	value: string;
}

export function varsToStyle(vars: TokenOverride[]): string {
	return vars.map((v) => `${v.token}: ${v.value}`).join('; ');
}

export function upsertVar(vars: TokenOverride[], token: string, value: string): TokenOverride[] {
	const i = vars.findIndex((v) => v.token === token);
	if (i === -1) return [...vars, { token, value }];
	const next = [...vars];
	next[i] = { token, value };
	return next;
}

export function removeVar(vars: TokenOverride[], token: string): TokenOverride[] {
	return vars.filter((v) => v.token !== token);
}
