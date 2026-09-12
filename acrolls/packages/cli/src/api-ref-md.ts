// Shared Markdown + JSON-Schema helpers for the API-reference generators.
// Everything here is pure and dependency-free, so it is trivially testable and
// behaves identically across the OpenAPI, AsyncAPI, and GraphQL emitters. The
// output targets the Acrolls content pipeline: GFM tables (remark-gfm) and
// fenced code blocks (Shiki), with no leading H1 (the shell renders the
// frontmatter title and warns on a leading H1).

export type Json = unknown;

export function isObj(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArr(value: unknown): value is unknown[] {
	return Array.isArray(value);
}

/** String coercion with a fallback — specs are untrusted JSON/YAML. */
export function str(value: unknown, fallback = ''): string {
	return typeof value === 'string' && value.length ? value : fallback;
}

/** Last segment of a `$ref` / path, URL-decoded (`#/components/schemas/Pet` → `Pet`). */
export function refName(ref: string): string {
	const parts = ref.split('/');
	try {
		return decodeURIComponent(parts[parts.length - 1] ?? ref);
	} catch {
		return parts[parts.length - 1] ?? ref;
	}
}

/**
 * Resolve a local JSON pointer `$ref` (e.g. `#/components/schemas/Pet`) against
 * the document root. Non-local, missing, or cyclic refs return the original node
 * so rendering never throws on a partial spec.
 */
export function resolveRef(root: unknown, node: unknown, seen = new Set<string>()): unknown {
	if (!isObj(node)) return node;
	const ref = node.$ref;
	if (typeof ref !== 'string' || !ref.startsWith('#/') || seen.has(ref)) return node;
	const next = new Set(seen).add(ref);
	let current: unknown = root;
	for (const raw of ref.slice(2).split('/')) {
		const segment = raw.replace(/~1/g, '/').replace(/~0/g, '~');
		if (!isObj(current) || !(segment in current)) return node;
		current = current[segment];
	}
	// A resolved node may itself be a `$ref`; follow once more (bounded by `seen`).
	return resolveRef(root, current, next);
}

/**
 * A human type label for a JSON-Schema node: `string`, `integer (int32)`,
 * `array[Pet]`, `Pet` (for a `$ref`), `enum[a | b]`, `oneOf[A, B]`.
 */
export function schemaType(root: unknown, schemaIn: unknown): string {
	if (isObj(schemaIn) && typeof schemaIn.$ref === 'string') return refName(schemaIn.$ref);
	const schema = resolveRef(root, schemaIn);
	if (!isObj(schema)) return 'any';
	if (isArr(schema.enum)) return `enum[${schema.enum.map((e) => String(e)).join(' | ')}]`;
	for (const combinator of ['oneOf', 'anyOf', 'allOf'] as const) {
		const list = schema[combinator];
		if (isArr(list) && list.length) {
			return `${combinator}[${list.map((s) => schemaType(root, s)).join(', ')}]`;
		}
	}
	const type = str(schema.type);
	if (type === 'array' || (!type && schema.items)) {
		return `array[${schema.items ? schemaType(root, schema.items) : 'any'}]`;
	}
	const fmt = str(schema.format);
	if (type) return fmt ? `${type} (${fmt})` : type;
	if (typeof schema.title === 'string') return schema.title;
	return isObj(schema.properties) ? 'object' : 'any';
}

/**
 * Synthesize an example value from a JSON-Schema node, honouring explicit
 * `example`/`default`, enums, and combinators, then falling back to type-shaped
 * primitives. Recursion is bounded by depth and a per-`$ref` seen-set so cyclic
 * schemas terminate.
 */
export function exampleFromSchema(
	root: unknown,
	schemaIn: unknown,
	seen = new Set<string>(),
	depth = 0
): unknown {
	if (depth > 5) return null;
	if (isObj(schemaIn)) {
		if ('example' in schemaIn) return schemaIn.example;
		if ('default' in schemaIn) return schemaIn.default;
	}
	let nextSeen = seen;
	if (isObj(schemaIn) && typeof schemaIn.$ref === 'string') {
		if (seen.has(schemaIn.$ref)) return {};
		nextSeen = new Set(seen).add(schemaIn.$ref);
	}
	const schema = resolveRef(root, schemaIn);
	if (!isObj(schema)) return null;
	if ('example' in schema) return schema.example;
	if (isArr(schema.enum)) return schema.enum[0] ?? null;
	const branch = isArr(schema.oneOf)
		? schema.oneOf
		: isArr(schema.anyOf)
			? schema.anyOf
			: null;
	if (branch && branch.length) return exampleFromSchema(root, branch[0], nextSeen, depth + 1);
	if (isArr(schema.allOf) && schema.allOf.length) {
		const merged: Record<string, unknown> = {};
		for (const part of schema.allOf) {
			const ex = exampleFromSchema(root, part, nextSeen, depth + 1);
			if (isObj(ex)) Object.assign(merged, ex);
		}
		return merged;
	}
	const type =
		str(schema.type) || (isObj(schema.properties) ? 'object' : schema.items ? 'array' : '');
	switch (type) {
		case 'object': {
			const out: Record<string, unknown> = {};
			const props = isObj(schema.properties) ? schema.properties : {};
			for (const [key, value] of Object.entries(props)) {
				out[key] = exampleFromSchema(root, value, nextSeen, depth + 1);
			}
			return out;
		}
		case 'array':
			return schema.items ? [exampleFromSchema(root, schema.items, nextSeen, depth + 1)] : [];
		case 'string': {
			const fmt = str(schema.format);
			if (fmt === 'date-time') return '2024-01-01T12:00:00Z';
			if (fmt === 'date') return '2024-01-01';
			if (fmt === 'uuid') return '3fa85f64-5717-4562-b3fc-2c963f66afa6';
			if (fmt === 'email') return 'user@example.com';
			if (fmt === 'uri' || fmt === 'url') return 'https://example.com';
			return 'string';
		}
		case 'integer':
		case 'number':
			return 0;
		case 'boolean':
			return true;
		default:
			return null;
	}
}

/** A GFM properties table for an object schema's top-level properties. */
export function propertiesTable(root: unknown, schemaIn: unknown): string {
	const schema = resolveRef(root, schemaIn);
	if (!isObj(schema) || !isObj(schema.properties)) return '';
	const required = new Set(isArr(schema.required) ? schema.required.map((r) => String(r)) : []);
	const rows = Object.entries(schema.properties).map(([name, prop]) => {
		const resolved = resolveRef(root, prop);
		const description = isObj(resolved) ? str(resolved.description) : '';
		return [`\`${name}\``, schemaType(root, prop), required.has(name) ? 'yes' : 'no', description];
	});
	return mdTable(['Name', 'Type', 'Required', 'Description'], rows);
}

/** Collapse to a single line and trim — safe for YAML frontmatter scalars. */
export function singleLine(value: unknown): string {
	return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function yamlScalar(value: string | number | boolean): string {
	if (typeof value !== 'string') return String(value);
	// Quote when a plain scalar could be misread by a YAML parser. JSON.stringify
	// yields a valid YAML double-quoted flow scalar with escapes.
	if (/^[\s]|[\s]$|[:#\[\]{}&*!|>'"%@`,?\-]|^\d|^$/.test(value)) return JSON.stringify(value);
	return value;
}

/** Emit a `---`-delimited YAML frontmatter block, skipping empty values. */
export function frontmatter(fields: Record<string, string | number | boolean | undefined>): string {
	const lines = ['---'];
	for (const [key, value] of Object.entries(fields)) {
		if (value === undefined || value === '') continue;
		lines.push(`${key}: ${yamlScalar(typeof value === 'string' ? singleLine(value) : value)}`);
	}
	lines.push('---');
	return lines.join('\n');
}

/** Escape a value for a GFM table cell: pipes, backslashes, and line breaks. */
export function escapeCell(value: unknown): string {
	return String(value ?? '')
		.replace(/\\/g, '\\\\')
		.replace(/\|/g, '\\|')
		.replace(/\r?\n/g, '<br>');
}

/** A GFM table, or `''` when there are no rows. Empty cells render as an em dash. */
export function mdTable(
	headers: string[],
	rows: (string | number | boolean | null | undefined)[][]
): string {
	if (!rows.length) return '';
	const head = `| ${headers.join(' | ')} |`;
	const divider = `| ${headers.map(() => '---').join(' | ')} |`;
	const body = rows.map((row) => `| ${row.map((cell) => escapeCell(cell) || '—').join(' | ')} |`);
	return [head, divider, ...body].join('\n');
}

/** A fenced code block with trailing whitespace trimmed. */
export function fence(lang: string, code: string): string {
	return '```' + lang + '\n' + code.replace(/\s+$/, '') + '\n```';
}

/** A pretty-printed JSON fenced block. */
export function jsonFence(value: unknown): string {
	return fence('json', JSON.stringify(value, null, 2));
}

export function slugify(value: string, fallback = 'api'): string {
	return (
		value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 60) || fallback
	);
}

export function heading(level: number, text: string): string {
	return '#'.repeat(Math.max(1, Math.min(6, level))) + ' ' + text;
}

/** Join non-empty Markdown blocks with a blank line, dropping empties. */
export function joinBlocks(blocks: (string | false | null | undefined)[]): string {
	return blocks
		.filter((block): block is string => typeof block === 'string' && block.trim().length > 0)
		.join('\n\n');
}
