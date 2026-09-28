#!/usr/bin/env node
/**
 * Token pipeline — _00_tokens.sass is the single source of truth.
 *
 * The token file is hand-maintained (grouped, commented, with explanatory
 * notes), so the machine-readable consumers are now DERIVED from it instead of
 * the other way around:
 *
 *   scripts/generate-tokens.mjs            → rewrite token-source.json + tokens.schema.ts
 *   scripts/generate-tokens.mjs --check    → exit 1 if either is out of date
 *
 * token-source.json mirrors the light/dark mixins (`=light-theme-tokens`,
 * `=dark-theme-tokens`) plus the shared :root scales, and tokens.schema.ts
 * groups the vocabulary for the public token API. The style-contract checker
 * re-verifies both on every `pnpm style:check`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sassPath = resolve(root, 'src/lib/styles/_00_tokens.sass');
const jsonPath = resolve(root, 'src/lib/styles/token-source.json');
const schemaPath = resolve(root, 'src/lib/styles/tokens.schema.ts');

const sass = readFileSync(sassPath, 'utf8');

/** Pull `--token: value` pairs out of a top-level block, skipping comments. */
function parseBlock(startMarker, endMarker) {
	const start = sass.indexOf(startMarker);
	if (start === -1) throw new Error(`block ${startMarker} not found in _00_tokens.sass`);
	const end = endMarker ? sass.indexOf(endMarker, start) : sass.length;
	const body = sass.slice(start, end === -1 ? sass.length : end);
	const tokens = {};
	for (const line of body.split('\n')) {
		if (line.trim().startsWith('//')) continue;
		const m = line.match(/^\t(--[a-z0-9-]+):\s*(.+?)\s*(?:\/\/.*)?$/);
		if (m) tokens[m[1]] = m[2].trim();
	}
	return tokens;
}

const dark = parseBlock('=dark-theme-tokens', '@media');
const rootStart = sass.indexOf(':root');
const rootBody = sass.slice(rootStart, sass.indexOf('@media', rootStart));
const shared = {};
for (const line of rootBody.split('\n')) {
	if (line.trim().startsWith('//')) continue;
	const m = line.match(/^\t(--[a-z0-9-]+):\s*(.+?)\s*(?:\/\/.*)?$/);
	if (m) shared[m[1]] = m[2].trim();
}
const light = parseBlock('=light-theme-tokens', '\n=');
const { 'color-scheme': _drop, ...lightTokens } = light;

// defaults = shared scales + light palette; dark carries the full per-mode set.
const defaults = { ...shared, ...lightTokens };
const darkFull = { ...defaults, ...dark };

// --- Group vocabulary (schema) -----------------------------------------------------
const PALETTE_PREFIXES = ['--white-fixed', '--black-fixed', '--bg', '--state-', '--border', '--theme-color', '--success', '--warning', '--danger', '--info', '--ring', '--text-primary', '--text-secondary', '--text-muted', '--text-inverse'];
const LAYOUT_NAMES = ['--header-height', '--footer-height', '--measure', '--page-gutter', '--sidebar-width', '--toc-width', '--card-min', '--breakpoint', '--shell-pad', '--layout-max'];

const groupOf = (name) => {
	if (PALETTE_PREFIXES.some((p) => name.startsWith(p))) return 'palette';
	if (name.startsWith('--font-') || name.startsWith('--text-')) return 'typography';
	if (name.startsWith('--space-')) return 'space';
	if (name.startsWith('--radius')) return 'radius';
	if (name.startsWith('--control-h')) return 'controls';
	if (name.startsWith('--shadow-')) return 'elevation';
	if (name.startsWith('--z-')) return 'layering';
	if (name.startsWith('--motion-') || name.startsWith('--ease-')) return 'motion';
	if (LAYOUT_NAMES.includes(name)) return 'layout';
	return 'palette';
};

const groupOrder = ['typography', 'space', 'radius', 'controls', 'elevation', 'layering', 'layout', 'motion', 'palette'];
const grouped = {};
for (const name of Object.keys(defaults)) (grouped[groupOf(name)] ??= []).push(name);

const groupKinds = {
	typography: 'type',
	space: 'space',
	radius: 'radius',
	controls: 'length',
	elevation: 'shadow',
	layering: 'number',
	layout: 'length',
	motion: 'number',
	palette: 'color'
};
const groupDescriptions = {
	typography: 'Font family or fluid type scale value.',
	space: 'Fluid spacing scale value.',
	radius: 'Corner radius value.',
	controls: 'Native control height value.',
	elevation: 'Elevation shadow value.',
	layering: 'Stacking order value.',
	layout: 'Global layout measurement.',
	motion: 'Motion duration or easing value.',
	palette: 'Theme surface, text, state, border, accent, or focus value.'
};

// --- Emit --------------------------------------------------------------------------
const json = JSON.stringify({ defaults, dark: darkFull }, null, 2) + '\n';
const schema = `// Generated from _00_tokens.sass by scripts/generate-tokens.mjs — do not edit.
// Run \`pnpm tokens:generate\` after changing the token vocabulary.

import tokenSource from './token-source.json';

export const tokenGroups = {
${groupOrder
	.filter((g) => grouped[g]?.length)
	.map((g) => {
		const list = grouped[g].map((n) => `'${n}'`).join(', ');
		return `\t${g}: [${list}]`;
	})
	.join(',\n')}
} as const;

export type TokenGroup = keyof typeof tokenGroups;
export type TokenName = (typeof tokenGroups)[TokenGroup][number];
export type ThemeTokenName = TokenName | \`--ui-\${string}\`;

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
${groupOrder.filter((g) => grouped[g]?.length).map((g) => `\t${g}: '${groupKinds[g]}'`).join(',\n')}
};

const groupDescriptions: Record<TokenGroup, string> = {
${groupOrder.filter((g) => grouped[g]?.length).map((g) => `\t${g}: '${groupDescriptions[g]}'`).join(',\n')}
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
`;

if (process.argv.includes('--check')) {
	let stale = false;
	for (const [path, generated] of [
		[jsonPath, json],
		[schemaPath, schema]
	]) {
		const current = readFileSync(path, 'utf8');
		if (current !== generated) {
			console.error(`Out of date: ${path.replace(root + '/', '')}. Run \`pnpm tokens:generate\` after editing _00_tokens.sass.`);
			stale = true;
		}
	}
	if (stale) process.exit(1);
	console.log('Token artifacts are in sync with _00_tokens.sass.');
} else {
	writeFileSync(jsonPath, json);
	writeFileSync(schemaPath, schema);
	await import('./generate-token-guide.mjs');
	console.log(
		`tokens: ${Object.keys(defaults).length} defaults, ${Object.keys(darkFull).length} dark → token-source.json + tokens.schema.ts (${groupOrder.filter((g) => grouped[g]?.length).length} groups)`
	);
}
