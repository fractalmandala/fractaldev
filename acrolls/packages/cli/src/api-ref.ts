import { resolve, relative, extname, basename, sep } from 'node:path';
import { stat, readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { exists } from './util.js';
import type { Args } from './util.js';
import { frontmatter, isObj, slugify } from './api-ref-md.js';
import { openapiToMarkdown, type ApiPage } from './api-ref-openapi.js';
import { asyncapiToMarkdown } from './api-ref-asyncapi.js';
import {
	graphqlIntrospectionToMarkdown,
	graphqlSdlToMarkdown,
	type GraphqlModule
} from './api-ref-graphql.js';

/**
 * `acrolls api-ref` — build-time API-reference generation.
 *
 * Reads an OpenAPI / AsyncAPI / GraphQL spec (a file or a directory of specs) and
 * emits Markdown pages consumable by the Acrolls docs content source: YAML
 * frontmatter (`title` + `description`), GFM tables, and fenced examples that the
 * pipeline highlights with Shiki and renders through `Publication`. No leading H1
 * is emitted (the shell renders the frontmatter title and warns on a leading H1).
 *
 * Parsing is dependency-light by design. JSON specs (including GraphQL
 * introspection JSON) need nothing. YAML specs use the optional `yaml` peer and
 * GraphQL SDL uses the optional `graphql` peer — both loaded lazily through a
 * variable specifier so the bundled CLI never hard-depends on them (the same
 * optional-peer contract `search-index` uses for `pagefind`).
 */

export type ApiFormat = 'openapi' | 'asyncapi' | 'graphql';

/** Minimal shape of the `yaml` package (optional peer). */
export type YamlModule = { parse(text: string): unknown };

export type ApiRefOptions = {
	/** Spec file or directory of specs. Resolved against cwd. */
	input: string;
	/** Output directory for generated Markdown. Defaults to `content/api`. */
	out?: string;
	/** Force a format instead of auto-detecting from content. */
	format?: ApiFormat;
	/** Override the output filename slug (single-file input only). */
	slug?: string;
	/** Report what would be written without touching disk. */
	dryRun?: boolean;
	/** Test seam: a YAML module, or `null` to simulate "not installed". */
	yaml?: YamlModule | null;
	/** Test seam: a GraphQL module, or `null` to simulate "not installed". */
	graphql?: GraphqlModule | null;
};

export type ApiRefPage = {
	format: ApiFormat;
	slug: string;
	title: string;
	file: string;
	markdown: string;
};

export type ApiRefResult =
	| { ok: true; pages: ApiRefPage[]; outDir: string; written: boolean; inputPath: string }
	| { ok: false; message: string };

type Res<T> = { ok: true; value: T } | { ok: false; message: string };

const JSON_EXT = new Set(['.json']);
const YAML_EXT = new Set(['.yaml', '.yml']);
const SDL_EXT = new Set(['.graphql', '.gql']);
const SPEC_EXT = new Set([...JSON_EXT, ...YAML_EXT, ...SDL_EXT]);

const YAML_HINT =
	'YAML parsing needs the optional `yaml` package.\nAdd it (`pnpm add -D yaml`, or the npm/yarn/bun equivalent), or point at a JSON spec, then re-run.';
const GRAPHQL_HINT =
	'GraphQL SDL parsing needs the optional `graphql` package.\nAdd it (`pnpm add -D graphql`), or provide introspection JSON instead, then re-run.';

function msg(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

/** Import by variable specifier so the bundler leaves it external and tsc does not
 * need the package installed to type-check. Returns `null` when unavailable. */
async function tryImport(name: string): Promise<unknown> {
	try {
		return await import(/* @vite-ignore */ name);
	} catch {
		return null;
	}
}

async function loadYaml(injected: YamlModule | null | undefined): Promise<YamlModule | null> {
	if (injected !== undefined) return injected;
	const mod = await tryImport('yaml');
	return mod && typeof (mod as YamlModule).parse === 'function' ? (mod as YamlModule) : null;
}

async function loadGraphql(
	injected: GraphqlModule | null | undefined
): Promise<GraphqlModule | null> {
	if (injected !== undefined) return injected;
	const mod = await tryImport('graphql');
	return mod && typeof (mod as GraphqlModule).parse === 'function' ? (mod as GraphqlModule) : null;
}

function detectFormat(fileName: string, text: string, doc: unknown): ApiFormat | null {
	if (SDL_EXT.has(extname(fileName).toLowerCase())) return 'graphql';
	if (isObj(doc)) {
		if ('openapi' in doc || 'swagger' in doc) return 'openapi';
		if ('asyncapi' in doc) return 'asyncapi';
		if ('__schema' in doc || (isObj(doc.data) && '__schema' in doc.data)) return 'graphql';
	}
	if (
		/^\s*(?:schema\s*\{|type\s+\w+|input\s+\w+|enum\s+\w+|interface\s+\w+|union\s+\w+|scalar\s+\w+|directive\s+@)/m.test(
			text
		)
	) {
		return 'graphql';
	}
	return null;
}

type ParsedSpec =
	| { kind: 'json'; format: ApiFormat; doc: unknown; slugBase: string }
	| { kind: 'sdl'; format: 'graphql'; sdl: string; slugBase: string };

async function parseSpecFile(file: string, opts: ApiRefOptions): Promise<Res<ParsedSpec>> {
	const text = await readFile(file, 'utf8');
	const ext = extname(file).toLowerCase();
	const slugBase = basename(file, ext);

	if (SDL_EXT.has(ext) || (opts.format === 'graphql' && !JSON_EXT.has(ext) && !looksJson(text))) {
		// A GraphQL SDL document — but introspection JSON also parses as JSON, so only
		// treat it as SDL when it is not JSON.
		if (!looksJson(text)) return { ok: true, value: { kind: 'sdl', format: 'graphql', sdl: text, slugBase } };
	}

	let doc: unknown;
	if (looksJson(text)) {
		try {
			doc = JSON.parse(text);
		} catch (err) {
			if (JSON_EXT.has(ext)) return { ok: false, message: `Invalid JSON in ${file}: ${msg(err)}` };
			doc = undefined; // fall through to YAML
		}
	}
	if (doc === undefined) {
		const yaml = await loadYaml(opts.yaml);
		if (!yaml) return { ok: false, message: YAML_HINT };
		try {
			doc = yaml.parse(text);
		} catch (err) {
			return { ok: false, message: `Invalid YAML in ${file}: ${msg(err)}` };
		}
	}

	const format = opts.format ?? detectFormat(file, text, doc);
	if (!format) {
		return {
			ok: false,
			message: `Could not detect an API spec in ${file}.\nPass --format openapi|asyncapi|graphql to force one.`
		};
	}
	return { ok: true, value: { kind: 'json', format, doc, slugBase } };
}

function looksJson(text: string): boolean {
	const head = text.trimStart();
	return head.startsWith('{') || head.startsWith('[');
}

async function renderParsed(
	parsed: ParsedSpec,
	opts: ApiRefOptions
): Promise<Res<{ format: ApiFormat; page: ApiPage; slugBase: string }>> {
	if (parsed.kind === 'sdl') {
		const graphql = await loadGraphql(opts.graphql);
		if (!graphql) return { ok: false, message: GRAPHQL_HINT };
		try {
			return {
				ok: true,
				value: { format: 'graphql', page: graphqlSdlToMarkdown(parsed.sdl, graphql), slugBase: parsed.slugBase }
			};
		} catch (err) {
			return { ok: false, message: `Failed to parse GraphQL SDL: ${msg(err)}` };
		}
	}
	try {
		let page: ApiPage;
		if (parsed.format === 'openapi') page = openapiToMarkdown(parsed.doc);
		else if (parsed.format === 'asyncapi') page = asyncapiToMarkdown(parsed.doc);
		else page = graphqlIntrospectionToMarkdown(parsed.doc);
		return { ok: true, value: { format: parsed.format, page, slugBase: parsed.slugBase } };
	} catch (err) {
		return { ok: false, message: `Failed to render ${parsed.format} reference: ${msg(err)}` };
	}
}

function toMarkdown(page: ApiPage): string {
	const fm = frontmatter({ title: page.title, description: page.description });
	return `${fm}\n\n${page.body.replace(/\s+$/, '')}\n`;
}

async function collectSpecs(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { recursive: true, withFileTypes: true });
	const out: string[] = [];
	for (const entry of entries) {
		if (!entry.isFile()) continue;
		if (!SPEC_EXT.has(extname(entry.name).toLowerCase())) continue;
		const full = resolve(entry.parentPath ?? dir, entry.name);
		if (full.split(sep).includes('node_modules')) continue;
		out.push(full);
	}
	return out.sort();
}

function rel(abs: string): string {
	return relative(process.cwd(), abs) || '.';
}

export async function generateApiReference(opts: ApiRefOptions): Promise<ApiRefResult> {
	const inputAbs = resolve(process.cwd(), opts.input);
	if (!(await exists(inputAbs))) return { ok: false, message: `Spec not found: ${opts.input}` };
	const st = await stat(inputAbs);
	const files = st.isDirectory() ? await collectSpecs(inputAbs) : [inputAbs];
	if (!files.length) {
		return { ok: false, message: `No API specs (.json/.yaml/.yml/.graphql/.gql) found in ${opts.input}` };
	}

	const outDir = resolve(process.cwd(), opts.out ?? 'content/api');
	const pages: ApiRefPage[] = [];
	for (const file of files) {
		const parsed = await parseSpecFile(file, opts);
		if (!parsed.ok) return parsed;
		const rendered = await renderParsed(parsed.value, opts);
		if (!rendered.ok) return rendered;
		const { format, page, slugBase } = rendered.value;
		const slug =
			opts.slug && files.length === 1 ? slugify(opts.slug) : page.slug || slugify(slugBase);
		pages.push({
			format,
			slug,
			title: page.title,
			file: resolve(outDir, `${slug}.md`),
			markdown: toMarkdown(page)
		});
	}

	let written = false;
	if (!opts.dryRun) {
		await mkdir(outDir, { recursive: true });
		for (const page of pages) await writeFile(page.file, page.markdown, 'utf8');
		written = true;
	}
	return { ok: true, pages, outDir: rel(outDir), written, inputPath: rel(inputAbs) };
}

export async function cmdApiRef(args: Args): Promise<number> {
	const input = args._[1];
	if (!input) {
		console.error(
			'Usage: acrolls api-ref <spec|dir> [--out <dir>] [--format openapi|asyncapi|graphql] [--slug <name>] [--dry-run]'
		);
		return 2;
	}
	const out = args.flags.out !== undefined ? String(args.flags.out) : undefined;
	const slug = args.flags.slug !== undefined ? String(args.flags.slug) : undefined;
	const dryRun = Boolean(args.flags['dry-run']);
	const formatFlag = args.flags.format !== undefined ? String(args.flags.format) : undefined;
	let format: ApiFormat | undefined;
	if (formatFlag !== undefined) {
		if (formatFlag !== 'openapi' && formatFlag !== 'asyncapi' && formatFlag !== 'graphql') {
			console.error('Invalid --format. Use openapi, asyncapi, or graphql.');
			return 2;
		}
		format = formatFlag;
	}

	const result = await generateApiReference({ input, out, slug, format, dryRun });
	if (!result.ok) {
		console.error(result.message);
		return 1;
	}
	for (const page of result.pages) {
		const prefix = dryRun ? '[dry-run] ' : '';
		console.log(`${prefix}${page.format} → ${rel(page.file)} (${page.title})`);
	}
	const noun = `${result.pages.length} page${result.pages.length === 1 ? '' : 's'}`;
	console.log(
		dryRun ? `[dry-run] would write ${noun} to ${result.outDir}` : `Wrote ${noun} to ${result.outDir}`
	);
	return 0;
}
