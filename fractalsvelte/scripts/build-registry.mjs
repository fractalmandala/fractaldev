// =============================================================================
// build-registry — the complete inventory of what the styles system emits,
// attributed to the layer partial that produces it.
//
// Provenance is by per-layer standalone compile. Sass will not report which
// source file emitted a rule, and hand-written markers drift, so instead each
// layer is compiled on its own and its output harvested. Every layer partial
// only @use's config/vocab/tokens modules, none of which emit selectors, so a
// layer compiled alone yields exactly its own output. If a layer ever @use's
// another class-emitting layer, ownership falls to whichever comes first in
// index.sass order (see the ownership pass in buildRegistry).
//
// Run directly:  node scripts/build-registry.mjs
// Also called by the Vite plugin in vite.config.ts on every styles change.
// =============================================================================

import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';

/**
 * @typedef {'class' | 'token' | 'element' | 'keyframes'} Kind
 * @typedef {{ id: string, label: string }} Group
 * @typedef {{ id: string, label: string, families: string[] }} GroupSpec
 * @typedef {{ name: string, kind: Kind, group?: string }} Item
 * @typedef {{ id: string, label: string, file: string, order: number, items: Item[], groups?: Group[] }} Layer
 * @typedef {Record<Kind, Set<string>>} Harvest
 * @typedef {{ generatedAt?: string, totals: Record<string, number>, layers: Layer[] }} RegistryFile
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STYLES = path.join(ROOT, 'src', 'lib', 'styles');
const INDEX = path.join(STYLES, 'index.sass');
const OUT = path.join(ROOT, 'src', 'lib', 'data', 'registry.json');

// Emission order of the kind buckets, and the order the page renders filters.
/** @type {Kind[]} */
const KINDS = ['class', 'token', 'element', 'keyframes'];

// Layers with a sub-taxonomy get a second filter row on the page. Keys are the
// LEADING class token, which is the family key the config maps already use, so
// .gp-md, .gp-md-mob and .mn-64 all land in the right bucket in every band.
// Mirrors configvocab.sass ($gap-families / $pad-families / $border-families)
// plus the families declared inline in _02_dimensions.sass ($marg-families and
// its negative twins, $marg-neg-families) and the radius/size loops. An
// unrecognised prefix falls through to 'other' rather than disappearing, so a
// new family is visible before it is classified.
/** @type {Record<string, GroupSpec[]>} */
const TAXONOMIES = {
	'02_dimensions': [
		{ id: 'gaps', label: 'gaps', families: ['gp', 'rgp', 'cgp'] },
		{ id: 'pads', label: 'pads', families: ['pad', 'px', 'py', 'pt', 'pr', 'pb', 'pl'] },
		{
			id: 'margins',
			label: 'margins',
			families: ['mar', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'mn', 'mnx', 'mny', 'mnt', 'mnr', 'mnb', 'mnl']
		},
		{ id: 'borders', label: 'borders', families: ['border', 'bt', 'br', 'bb', 'bl'] },
		{ id: 'radius', label: 'radius', families: ['radius'] },
		{
			id: 'size',
			label: 'size (height & width)',
			families: ['w', 'h', 'square', 'wfull', 'hfull', 'full', 'min', 'min0', 'h88']
		}
	],
	'07_interactions': [
		{ id: 'components', label: 'components', families: ['btn', 'link', 'pill', 'card', 'badge'] },
		{ id: 'variants', label: 'variants (paint)', families: ['primary', 'outline', 'soft', 'ghost'] },
		{ id: 'sizes', label: 'sizes (metrics)', families: ['sm', 'bs', 'lg'] },
		{ id: 'shapes', label: 'shapes (corners)', families: ['round', 'square', 'curved'] }
	]
};
const OTHER = 'other';

const USE = /^@use\s+['"]([^'"]+)['"]\s+as\s+\*\s*$/;
const PRELUDE = /^(.*)\{\s*$/;
const TOKEN = /^\s*(--[a-z0-9-]+)\s*:/;
const CLASS = /\.(-?[_a-zA-Z][\w-]*)/g;
const KEYFRAMES = /@keyframes\s+([-\w]+)/g;
const PSEUDO = /::?[a-z-]+(\([^)]*\))?/gi;
const ATTRIBUTE = /\[[^\]]*\]/g;
const SIMPLE_TAG = /^(\*|[a-z][a-z0-9-]*)$/i;

/**
 * index.sass is the composition contract: its ordered `@use '<x>' as *` lines
 * ARE the layer roster, so adding a layer there adds its filter for free.
 *
 * Layer ids may carry a directory ('components/button'). Sass resolves the
 * underscore onto the basename, so the file for 'components/button' is
 * 'components/_button.sass' — resolve against the real filesystem instead of
 * assuming a leading underscore on the whole path.
 *
 * @returns {Promise<{ id: string, file: string }[]>}
 */
async function readLayers() {
	const source = await readFile(INDEX, 'utf8');
	/** @type {{ id: string, file: string }[]} */
	const layers = [];
	for (const line of source.split('\n')) {
		const match = USE.exec(line.trim());
		if (!match) continue;
		const id = match[1];
		const relFile = await resolveLayerFile(id);
		layers.push({ id, file: relFile });
	}
	return layers;
}

/**
 * @param {string} id the @use id, possibly with a directory part
 * @returns {Promise<string>} path relative to STYLES that exists on disk
 */
async function resolveLayerFile(id) {
	const norm = id.replaceAll('\\', '/');
	const slash = norm.lastIndexOf('/');
	const dir = slash === -1 ? '' : norm.slice(0, slash + 1);
	const base = slash === -1 ? norm : norm.slice(slash + 1);
	const candidates = [
		`${dir}_${base}.sass`,
		`${dir}${base}.sass`,
		`_${norm}.sass`,
		`${norm}.sass`
	];
	for (const candidate of candidates) {
		try {
			await stat(path.join(STYLES, candidate));
			return candidate;
		} catch {
			// try the next candidate
		}
	}
	return `_${id}.sass`;
}

/**
 * Sanitize filename for frontend display:
 * removes leading underscores, numerical prefixes (00, 01, etc.), and .sass extension.
 * e.g. '_00_tokens.sass' -> 'tokens'
 *
 * @param {string} file
 * @returns {string}
 */
function sanitizeFileName(file) {
	return file
		.replace(/\.sass$/, '')
		.replace(/^_+/, '')
		.replace(/^\d+_+/, '')
		.replace(/^_+|_+$/g, '');
}

/**
 * @param {string} name '.gp-md', '.mn-64', '.wfull' …
 * @param {GroupSpec[]} taxonomy
 * @returns {string}
 */
function groupOf(name, taxonomy) {
	const family = name.replace(/^\./, '').split('-')[0];
	return taxonomy.find((spec) => spec.families.includes(family))?.id ?? OTHER;
}

/**
 * @param {string} css
 * @returns {Harvest}
 */
function harvest(css) {
	/** @type {Harvest} */
	const found = { class: new Set(), token: new Set(), element: new Set(), keyframes: new Set() };

	for (const match of css.matchAll(KEYFRAMES)) found.keyframes.add(match[1]);

	for (const raw of css.split('\n')) {
		const line = raw.trim();

		const token = TOKEN.exec(line);
		if (token) found.token.add(token[1]);

		// Rule preludes only: at-rules (media, keyframes) are not selectors, and
		// their blocks are already walked line by line so nested rules count.
		if (line.startsWith('@')) continue;
		const prelude = PRELUDE.exec(line);
		if (!prelude) continue;
		const selector = prelude[1].trim();

		// A pseudo suffix is not a separate class, so .trigger:hover contributes
		// .trigger exactly once.
		for (const match of selector.matchAll(CLASS)) found.class.add(`.${match[1]}`);

		// Bare element selectors only — a descendant like ".foo span" defines no
		// element of its own.
		for (const part of selector.split(',')) {
			const tag = part.replace(PSEUDO, '').replace(ATTRIBUTE, '').trim();
			if (SIMPLE_TAG.test(tag)) found.element.add(tag);
		}
	}

	return found;
}

/**
 * @param {Harvest} found
 * @returns {Item[]}
 */
function toItems(found) {
	return KINDS.flatMap((kind) => [...found[kind]].sort().map((name) => ({ name, kind })));
}

/** @returns {Promise<{ raw: string, data: RegistryFile } | null>} */
async function readPrevious() {
	try {
		const raw = await readFile(OUT, 'utf8');
		return { raw, data: JSON.parse(raw) };
	} catch {
		return null;
	}
}

/**
 * Compile every layer and write the registry.
 *
 * @param {{ quiet?: boolean }} [options]
 * @returns {Promise<{
 *   changed: boolean,
 *   total: number,
 *   failures: number,
 *   totals: Record<string, number>,
 *   layers: Layer[]
 * }>}
 */
export async function buildRegistry({ quiet = false } = {}) {
	const layers = await readLayers();
	const previous = await readPrevious();

	/** @type {Layer[]} */
	const built = [];
	let failures = 0;

	for (const [order, layer] of layers.entries()) {
		/** @type {Item[]} */
		let items;
		try {
			const { css } = sass.compile(path.join(STYLES, layer.file), { style: 'expanded' });
			items = toItems(harvest(css));
		} catch (error) {
			// A half-saved partial must not blank the page: keep what the layer
			// last produced and say so.
			failures += 1;
			items = previous?.data?.layers?.find((entry) => entry.id === layer.id)?.items ?? [];
			if (!quiet) {
				const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
				console.warn(`[registry] ${layer.file} failed to compile, kept ${items.length} item(s): ${reason}`);
			}
		}

		const taxonomy = TAXONOMIES[layer.id];
		/** @type {Group[] | undefined} */
		let groups;
		if (taxonomy) {
			for (const item of items) item.group = groupOf(item.name, taxonomy);
			// Only buckets this layer actually fills get a chip: declaring a family
			// that another layer emits (borders live in _06_visuals, not here) must
			// not leave a filter that always reads zero.
			const used = new Set(items.map((item) => item.group));
			groups = taxonomy
				.filter((spec) => used.has(spec.id))
				.map(({ id, label }) => ({ id, label }));
			if (used.has(OTHER)) groups.push({ id: OTHER, label: OTHER });
		}

		built.push({
			id: layer.id,
			label: sanitizeFileName(layer.file),
			file: sanitizeFileName(layer.file),
			order,
			items,
			...(groups && groups.length > 1 ? { groups } : {})
		});
	}

	// Each name has exactly one owner, so a layer that pulls in another layer's
	// output cannot double-report it.
	const owned = new Set();
	for (const layer of built) {
		layer.items = layer.items.filter((item) => {
			const key = `${item.kind}\u0000${item.name}`;
			if (owned.has(key)) return false;
			owned.add(key);
			return true;
		});
	}

	const totals = Object.fromEntries(
		KINDS.map((kind) => [
			kind,
			built.reduce((n, layer) => n + layer.items.filter((item) => item.kind === kind).length, 0)
		])
	);

	const payload = { totals, layers: built };
	const total = Object.values(totals).reduce((a, b) => a + b, 0);

	// Only stamp a new generatedAt when something actually changed, so a dev
	// restart — or the dev server regenerating after your own manual run — does
	// not churn the committed file.
	if (previous && JSON.stringify(payload) === JSON.stringify({ totals: previous.data.totals, layers: previous.data.layers })) {
		return { changed: false, ...payload, total, failures };
	}

	const registry = { generatedAt: new Date().toISOString(), ...payload };
	await writeFile(OUT, `${JSON.stringify(registry, null, '\t')}\n`, 'utf8');

	return { changed: true, ...payload, total, failures };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const result = await buildRegistry();
	const parts = KINDS.filter((kind) => result.totals[kind] > 0).map((kind) => `${result.totals[kind]} ${kind}`);
	console.log(
		`[registry] ${result.layers.length} layers, ${parts.join(', ')}` +
			`${result.failures ? ` (${result.failures} layer(s) kept from previous run)` : ''}` +
			`${result.changed ? '' : ' — already fresh, nothing written'}`
	);
	console.log(`[registry] ${path.relative(ROOT, OUT)}`);
}
