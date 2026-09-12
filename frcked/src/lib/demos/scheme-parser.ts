import type { Scheme } from './scheme-types';

/**
 * Runtime parser for the design-scheme `.md` files' frontmatter subset.
 *
 * The files are authored `--- … ---` blocks of `key: value` and shallow
 * nested maps (colors / typography / spacing / rounded). We parse just what
 * the playground consumes — quotes stripped, numbers kept as strings — and
 * fall back gracefully on malformed blocks.
 */

function stripQuotes(v: string): string {
	const t = v.trim();
	if (
		(t.startsWith('"') && t.endsWith('"') && t.length >= 2) ||
		(t.startsWith("'") && t.endsWith("'") && t.length >= 2)
	) {
		return t.slice(1, -1);
	}
	return t;
}

/** `key: value` pair at a given indent; null when the line is something else. */
function parsePair(line: string): { indent: number; key: string; value: string } | null {
	const m = /^(\s*)([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
	if (!m) return null;
	return { indent: m[1].length, key: m[2], value: stripQuotes(m[3]) };
}

export function parseSchemeFrontmatter(raw: string, id: string): Scheme {
	const scheme: Scheme = {
		id,
		name: id,
		description: '',
		version: '',
		archetype: 'default',
		tags: [],
		roles: {},
		typography: {},
		spacing: {},
		rounded: {},
		shadows: {},
		borders: {},
		materials: {},
		interactions: {},
		gradients: {},
		body: raw
	};

	const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
	if (!fm) return scheme;

	const bodyOnly = raw.slice((fm.index ?? 0) + fm[0].length);
	const tagsLine = /^Tags?:\s*(.+)$/m.exec(bodyOnly);
	if (tagsLine) {
		scheme.tags = tagsLine[1]
			.replace(/[.。]+\s*$/, '')
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
	}

	const lines = fm[1].split(/\r?\n/);

	// section map we're currently inside (colors / typography / spacing / rounded / shadows / borders / materials / interactions / gradients)
	let section: string | null = null;
	let sectionIndent = 0;
	let currentFont: string | null = null;

	for (const line of lines) {
		if (!line.trim()) continue;

		const pair = parsePair(line);
		if (!pair) continue;

		// A nested key opens (value empty) → becomes current section at its indent.
		// Inside typography, second-level openers (`display-lg:`, `heading-card:`) are font specs,
		// not sections — keep `typography` as the active section.
		if (pair.value === '') {
			if (section === 'typography' && pair.indent === sectionIndent + 2) {
				currentFont = pair.key;
				scheme.typography[currentFont] = {};
				continue;
			}
			if (pair.indent <= sectionIndent) currentFont = null;
			section = pair.key;
			sectionIndent = pair.indent;
			continue;
		}

		if (section === null || pair.indent <= sectionIndent) {
			// top-level scalar
			switch (pair.key) {
				case 'name':
					scheme.name = pair.value;
					break;
				case 'description':
					scheme.description = pair.value;
					break;
				case 'version':
					scheme.version = pair.value;
					break;
				case 'archetype':
					scheme.archetype = pair.value as any;
					break;
				case 'tags':
					scheme.tags = pair.value
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean);
					break;
			}
			section = null;
			currentFont = null;
			continue;
		}

		// Nested value inside a known section
		if (section === 'colors') {
			scheme.roles[pair.key as keyof Scheme['roles']] = pair.value;
		} else if (section === 'spacing') {
			scheme.spacing[pair.key] = pair.value;
		} else if (section === 'rounded') {
			scheme.rounded[pair.key] = pair.value;
		} else if (section === 'shadows') {
			if (!scheme.shadows) scheme.shadows = {};
			scheme.shadows[pair.key] = pair.value;
		} else if (section === 'borders') {
			if (!scheme.borders) scheme.borders = {};
			scheme.borders[pair.key] = pair.value as any;
		} else if (section === 'materials') {
			if (!scheme.materials) scheme.materials = {};
			scheme.materials[pair.key] = pair.value as any;
		} else if (section === 'interactions') {
			if (!scheme.interactions) scheme.interactions = {};
			scheme.interactions[pair.key] = pair.value;
		} else if (section === 'gradients') {
			if (!scheme.gradients) scheme.gradients = {};
			scheme.gradients[pair.key] = pair.value;
		} else if (section === 'typography') {
			if (currentFont && pair.indent > sectionIndent + 2) {
				const spec = scheme.typography[currentFont] ?? {};
				if (pair.key === 'fontWeight') spec.fontWeight = pair.value;
				else if (pair.key === 'fontFamily') spec.fontFamily = pair.value;
				else if (pair.key === 'fontSize') spec.fontSize = pair.value;
				else if (pair.key === 'lineHeight') spec.lineHeight = pair.value;
				else if (pair.key === 'letterSpacing') spec.letterSpacing = pair.value;
				else if (pair.key === 'textTransform') spec.textTransform = pair.value as any;
				else if (pair.key === 'tabularNums') spec.tabularNums = pair.value === 'true';
				scheme.typography[currentFont] = spec;
			}
		}
	}

	return scheme;
}
