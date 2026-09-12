import tokenSource from './token-source.json';

export const tokenGroups = {
	typography: ['--font-sans', '--font-mono', '--text-xs', '--text-sm', '--text-md', '--text-lg', '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl'],
	space: ['--space-3xs', '--space-2xs', '--space-xs', '--space-s', '--space-m', '--space-l', '--space-xl', '--space-2xl', '--space-3xl'],
	radius: ['--radius-0', '--radius-2', '--radius-3', '--radius-4', '--radius-6', '--radius-8', '--radius-12', '--radius-16', '--radius-24', '--radius-full'],
	controls: ['--control-h-s', '--control-h-m', '--control-h-l'],
	elevation: ['--shadow-s', '--shadow-m', '--shadow-l'],
	layering: ['--z-base', '--z-raised', '--z-sticky', '--z-modal', '--z-toast'],
	layout: ['--header-height', '--footer-height', '--measure'],
	palette: ['--bg', '--bg-surface', '--bg-raised', '--bg-panel', '--bg-footer', '--bg-popover', '--bg-dialog', '--bg-terminal', '--bg-input', '--bg-canvas', '--text-primary', '--text-secondary', '--text-muted', '--text-inverse', '--state-hover', '--state-hover-subtle', '--state-selected', '--border', '--border-subtle', '--theme-color', '--theme-color-alt', '--theme', '--theme-hover', '--success', '--success-hover', '--warning', '--warning-hover', '--danger', '--danger-hover', '--info', '--info-hover', '--feedback-error', '--ring'],
	structure: ['--border-width', '--border-emphasis-width', '--focus-ring-width']
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
	elevation: 'shadow',
	layering: 'number',
	layout: 'length',
	palette: 'color',
	structure: 'length'
};

const groupDescriptions: Record<TokenGroup, string> = {
	typography: 'Font family or fluid type scale value.',
	space: 'Fluid spacing scale value.',
	radius: 'Corner radius value.',
	controls: 'Native control height value.',
	elevation: 'Elevation shadow value.',
	layering: 'Stacking order value.',
	layout: 'Global layout measurement.',
	palette: 'Theme surface, text, state, border, accent, or focus value.',
	structure: 'Border or focus geometry value.'
};

export const tokenMetadata = Object.entries(tokenGroups).flatMap(([group, names]) => names.map((name) => ({
	name,
	group: group as TokenGroup,
	kind: groupKinds[group as TokenGroup],
	defaultValue: tokenDefaults[name],
	description: groupDescriptions[group as TokenGroup]
}))) as TokenMetadata[];

export const tokenMetadataByName = Object.fromEntries(tokenMetadata.map((token) => [token.name, token])) as Record<TokenName, TokenMetadata>;

export function isPublicTokenName(value: string): value is TokenName {
	return publicTokenNames.has(value as TokenName);
}
