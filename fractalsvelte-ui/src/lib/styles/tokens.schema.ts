// Generated from _00_tokens.sass by scripts/generate-tokens.mjs — do not edit.
// Run `pnpm tokens:generate` after changing the token vocabulary.

import tokenSource from './token-source.json';

export const tokenGroups = {
	typography: ['--font-sans', '--font-mono', '--text-xs', '--text-sm', '--text-md', '--text-bs', '--text-lg', '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl', '--text-5xl', '--text-6xl'],
	space: ['--space-3xs', '--space-2xs', '--space-xs', '--space-sm', '--space-md', '--space-bs', '--space-lg', '--space-xl', '--space-2xl', '--space-3xl'],
	radius: ['--radius-0', '--radius-2', '--radius-3', '--radius-4', '--radius-6', '--radius-8', '--radius-10', '--radius-12', '--radius-16', '--radius-24', '--radius-sm', '--radius-md', '--radius-bs', '--radius-lg', '--radius-full'],
	controls: ['--control-h-sm', '--control-h-md', '--control-h-bs'],
	layering: ['--z-base', '--z-raised', '--z-sticky', '--z-modal', '--z-toast'],
	layout: ['--header-height', '--footer-height', '--measure', '--page-gutter', '--sidebar-width', '--toc-width', '--card-min', '--breakpoint'],
	motion: ['--motion-fast', '--motion-base', '--motion-slow', '--ease-out', '--ease-spring'],
	palette: ['--unit-space', '--app-inline', '--transin1', '--transin2', '--transin3', '--transout1', '--transout2', '--transout3', '--speed1', '--speed2', '--speed3', '--motionin1', '--motionout1', '--motionin2', '--motionout2', '--motionin3', '--motionout3', '--height-bs', '--height-md', '--h32', '--h28', '--h24', '--h20', '--fit-height', '--widebar-width', '--white-fixed', '--black-fixed', '--bg', '--bg-surface', '--bg-raised', '--bg-panel', '--bg-sunken', '--bg-popover', '--bg-button', '--bg-sidebar', '--bg-input', '--bg-button-soft', '--border', '--border-subtle', '--border-strong', '--text-primary', '--text-secondary', '--text-muted', '--text-inverse', '--state-hover', '--state-selected', '--theme-color', '--theme-color-alt', '--success', '--success-hover', '--warning', '--warning-hover', '--danger', '--danger-hover', '--info', '--info-hover', '--ring']
} as const;

export type TokenGroup = keyof typeof tokenGroups;
export type TokenName = (typeof tokenGroups)[TokenGroup][number];
export type ThemeTokenName = TokenName | `--ui-${string}`;

export type TokenValueKind = 'font' | 'type' | 'space' | 'radius' | 'length' | 'shadow' | 'number' | 'color' | 'alias';

export type TokenMetadata = {
	name: TokenName;
	group: TokenGroup;
	kind: TokenValueKind;
	defaultValue: string;
	description: string;
};

export const tokenDefaults = tokenSource.defaults as Record<TokenName, string>;
export const darkTokenDefaults = tokenSource.dark as Partial<Record<TokenName, string>>;
export const publicTokenNames = new Set<TokenName>(Object.values(tokenGroups).flat());

const groupKinds: Record<TokenGroup, TokenValueKind> = {
	typography: 'type',
	space: 'space',
	radius: 'radius',
	controls: 'length',
	layering: 'number',
	layout: 'length',
	motion: 'number',
	palette: 'color'
};

const groupDescriptions: Record<TokenGroup, string> = {
	typography: 'Font family or fluid type scale value.',
	space: 'Fluid spacing scale value.',
	radius: 'Corner radius value.',
	controls: 'Native control height value.',
	layering: 'Stacking order value.',
	layout: 'Global layout measurement.',
	motion: 'Motion duration or easing value.',
	palette: 'Theme surface, text, state, border, accent, or focus value.'
};

export const tokenMetadata = Object.entries(tokenGroups).flatMap(([group, names]) => names.map((name) => ({
	name,
	group: group as TokenGroup,
	kind: groupKinds[group as TokenGroup],
	defaultValue: tokenDefaults[name as TokenName],
	description: groupDescriptions[group as TokenGroup]
}))) as TokenMetadata[];

export const tokenMetadataByName = Object.fromEntries(tokenMetadata.map((token) => [token.name, token])) as Record<TokenName, TokenMetadata>;

export function isPublicTokenName(value: string): value is TokenName {
	return publicTokenNames.has(value as TokenName);
}
