// Acrolls MCP server (agent tier).
//
// A minimal, dependency-free Model Context Protocol server over stdio (JSON-RPC,
// newline-delimited as required by the MCP stdio transport). It exposes an Acrolls
// Markdown corpus to coding agents as MCP *resources* and *tools*:
//
//   - resources/list          → every page in the corpus (path, title, mime: text/markdown)
//   - resources/read          → raw Markdown for a page
//   - tools/list              → list_pages / read_page / search_pages
//   - tools/call              → those tools
//
// Two modes:
//   --content <dir>  read Markdown files directly from a directory (docs/blog corpus)
//   --url <base>     talk to a running/served Acrolls site over HTTP via content
//                    negotiation (GET {base}{path}.md returns text/markdown)
//
// This ships no MCP SDK dependency: the protocol surface we implement is tiny and
// stable (initialize / notifications/initialized / tools·list·call / resources),
// so Acrolls stays dependency-light. Both modes read the same Acrolls content model
// (frontmatter title/description, date, tags, hidden/draft), so an agent sees the
// same shape regardless of which mode a host wires up.

import { createInterface } from 'node:readline';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, isAbsolute, posix, extname } from 'node:path';

const PROTOCOL_VERSION = '2025-03-26';
const SERVER_NAME = 'acrolls';
const SERVER_VERSION = '0.8.0';

type MimePage = {
	path: string;
	title: string;
	description?: string;
	date?: string;
	tags: string[];
	mimeType: string;
};

/** Coerce a JSON-RPC id back to a string for responses (string or number). */
type JsonRpcId = string | number | null;

type ServerConfig = {
	/** Absolute root of the local Markdown corpus, or undefined in site mode. */
	contentDir?: string;
	/** Base URL of a served Acrolls site (no trailing slash). */
	baseUrl?: string;
	/** Path prefix on the site for pages (e.g. `/docs`, `/blog`). */
	pathPrefix?: string;
};

// ---------------------------------------------------------------- frontmatter

/**
 * Parse the small YAML subset Acrolls frontmatter uses: scalars, inline lists
 * (`[a, b]`), and block lists (`key:` then `- item` lines). Values stay strings;
 * callers coerce. This intentionally avoids a YAML dependency so the MCP server
 * stays dependency-free.
 */
function parseFrontmatter(text: string): { data: Record<string, unknown>; body: string } {
	if (!text.startsWith('---')) return { data: {}, body: text };
	const end = text.indexOf('\n---', 3);
	if (end === -1) return { data: {}, body: text };
	const raw = text.slice(3, end);
	const body = text.slice(end + 4).trimStart();
	const data: Record<string, unknown> = {};
	let currentListKey: string | null = null;

	for (const line of raw.split('\n')) {
		const itemMatch = line.match(/^\s*-\s+(.*)$/);
		if (itemMatch && currentListKey) {
			const list = (data[currentListKey] as string[]) ?? [];
			list.push(stripQuotes(itemMatch[1]!.trim()));
			data[currentListKey] = list;
			continue;
		}
		const eq = line.indexOf(':');
		if (eq === -1) {
			currentListKey = null;
			continue;
		}
		const key = line.slice(0, eq).trim();
		if (!key) continue;
		const value = line.slice(eq + 1).trim();
		if (!value) {
			// `key:` may open a block list on the following lines.
			data[key] = [];
			currentListKey = key;
			continue;
		}
		currentListKey = null;
		if (value.startsWith('[') && value.endsWith(']')) {
			data[key] = value
				.slice(1, -1)
				.split(',')
				.map((v) => stripQuotes(v.trim()))
				.filter(Boolean);
		} else {
			data[key] = stripQuotes(value);
		}
	}

	// A `key:` with no list items is an empty scalar, not a list.
	for (const [key, value] of Object.entries(data)) {
		if (Array.isArray(value) && value.length === 0) data[key] = '';
	}
	return { data, body };
}

function stripQuotes(value: string): string {
	return value.replace(/^["']|["']$/g, '');
}

function stringArray(value: unknown): string[] {
	if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
	if (typeof value === 'string' && value.trim()) return [value.trim()];
	return [];
}

// ------------------------------------------------------------ content directory

async function walkMarkdown(dir: string, base = dir): Promise<string[]> {
	const out: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...(await walkMarkdown(full, base)));
		else if (/\.(md|svx)$/.test(entry.name)) out.push(full);
	}
	return out;
}

async function pageFromFile(
	abs: string,
	root: string,
	pathPrefix: string
): Promise<MimePage> {
	const text = await readFile(abs, 'utf8');
	const { data } = parseFrontmatter(text);
	const rel = relative(root, abs).split(extname(abs))[0].replaceAll('\\', '/');
	const path = `${pathPrefix}/${rel}`;
	return {
		path,
		title: typeof data.title === 'string' ? data.title : rel.split('/').pop() ?? rel,
		description: typeof data.description === 'string' ? data.description : undefined,
		date: typeof data.date === 'string' ? data.date : undefined,
		tags: stringArray(data.tags),
		mimeType: 'text/markdown'
	};
}

async function listLocalPages(config: ServerConfig): Promise<MimePage[]> {
	if (!config.contentDir) return [];
	const root = config.contentDir;
	const files = await walkMarkdown(root);
	const prefix = config.pathPrefix ?? '';
	return Promise.all(files.map((f) => pageFromFile(f, root, prefix)));
}

// ------------------------------------------------------ HTTP site mode (negotiation)

async function fetchText(url: string): Promise<string | null> {
	try {
		const res = await fetch(url, {
			headers: { Accept: 'text/markdown, text/plain, */*' }
		});
		if (!res.ok) return null;
		return await res.text();
	} catch {
		return null;
	}
}

/**
 * Discover pages on a served site. Prefers a `llms.txt` index when present, then
 * falls back to a sitemap.xml, then honors an explicit path list. Each page is
 * fetched via content negotiation (`{base}{path}.md`).
 */
async function listSitePages(config: ServerConfig): Promise<MimePage[]> {
	const base = (config.baseUrl ?? '').replace(/\/+$/, '');
	const prefix = config.pathPrefix ?? '';
	const index = await fetchText(`${base}/llms.txt`);
	const paths: string[] = [];

	if (index) {
		for (const line of index.split('\n')) {
			const m = line.match(/\[[^\]]+\]\(([^)]+)\)/);
			if (m?.[1] && !paths.includes(m[1])) paths.push(m[1]);
		}
	} else {
		const sitemap = await fetchText(`${base}/sitemap.xml`);
		if (sitemap) {
			for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
				const loc = m[1]!.replace(/\/$/, '');
				if (!paths.includes(loc)) paths.push(loc);
			}
		}
	}

	// llms links are absolute URLs; keep only same-site pages under the prefix.
	const pagePaths: string[] = [];
	for (const rawPath of paths) {
		let path = rawPath;
		if (/^https?:\/\//.test(path)) {
			try {
				path = new URL(path).pathname;
			} catch {
				continue;
			}
		}
		path = path.replace(/\/+$/, '') || '/';
		if (prefix && !path.startsWith(prefix)) continue;
		if (!pagePaths.includes(path)) pagePaths.push(path);
	}

	// Preferred: a per-page Markdown endpoint (`{path}.md`) — full frontmatter fidelity.
	const pages: MimePage[] = [];
	for (const path of pagePaths) {
		const markdown = await fetchText(`${base}${path}.md`);
		if (markdown === null) continue;
		const { data } = parseFrontmatter(markdown);
		pages.push({
			path,
			title: typeof data.title === 'string' ? data.title : path.split('/').pop() ?? path,
			description: typeof data.description === 'string' ? data.description : undefined,
			date: typeof data.date === 'string' ? data.date : undefined,
			tags: stringArray(data.tags),
			mimeType: 'text/markdown'
		});
	}
	if (pages.length) return pages;

	// Fallback: most Acrolls sites ship the static AI tier (llms-full.txt) but not a `.md`
	// route per page. That file concatenates every page as `# Title` / `Source: <url>` blocks,
	// which is enough to rebuild the corpus for agent reads.
	return await pagesFromLlmsFull(base, prefix);
}

/** Split an `llms-full.txt` document into per-page entries. */
async function pagesFromLlmsFull(base: string, prefix: string): Promise<MimePage[]> {
	const full = await fetchText(`${base}/llms-full.txt`);
	if (!full) return [];
	const pages: MimePage[] = [];
	// Sections are separated by a `---` rule; each carries an H1 and a `Source:` line.
	for (const chunk of full.split(/\n---\n/)) {
		const sourceMatch = chunk.match(/^Source:\s*(\S+)\s*$/m);
		const titleMatch = chunk.match(/^#\s+(.+)$/m);
		if (!titleMatch) continue;
		let path = '';
		if (sourceMatch?.[1]) {
			const raw = sourceMatch[1];
			path = /^https?:\/\//.test(raw) ? new URL(raw).pathname : raw;
		}
		path = path.replace(/\/+$/, '');
		if (!path) continue;
		if (prefix && !path.startsWith(prefix)) continue;
		if (pages.some((p) => p.path === path)) continue;
		pages.push({
			path,
			title: titleMatch[1]!.trim(),
			tags: [],
			mimeType: 'text/markdown'
		});
	}
	return pages;
}

function listPages(config: ServerConfig): Promise<MimePage[]> {
	return config.contentDir ? listLocalPages(config) : listSitePages(config);
}

async function readPageBody(page: MimePage, config: ServerConfig): Promise<string | null> {
	if (config.contentDir) {
		const root = config.contentDir;
		const rel = page.path.replace(/^\/+/, '').replace(/^\//, '');
		// Strip pathPrefix for the relative lookup.
		const prefix = (config.pathPrefix ?? '').replace(/^\/+|\/+$/g, '');
		const relFromRoot = prefix && rel.startsWith(`${prefix}/`) ? rel.slice(prefix.length + 1) : rel;
		for (const file of await walkMarkdown(root)) {
			const fileRel = relative(root, file).replaceAll('\\', '/').split(extname(file))[0];
			if (fileRel === relFromRoot) return readFile(file, 'utf8');
		}
		return null;
	}
	const base = (config.baseUrl ?? '').replace(/\/+$/, '');
	const direct = await fetchText(`${base}${page.path}.md`);
	if (direct !== null) return direct;

	// Fallback: recover the section for this page from llms-full.txt.
	const full = await fetchText(`${base}/llms-full.txt`);
	if (!full) return null;
	for (const chunk of full.split(/\n---\n/)) {
		const sourceMatch = chunk.match(/^Source:\s*(\S+)\s*$/m);
		if (!sourceMatch?.[1]) continue;
		const raw = sourceMatch[1];
		const path = (/^https?:\/\//.test(raw) ? new URL(raw).pathname : raw).replace(/\/+$/, '');
		if (path === page.path) {
			// Drop the metadata preamble; keep the prose.
			const body = chunk.replace(/^#[^\n]*\n/, '').replace(/^Source:[^\n]*\n?/m, '').trim();
			return body;
		}
	}
	return null;
}

// ---------------------------------------------------------------- MCP protocol

type McpRequest = {
	jsonrpc: '2.0';
	id?: JsonRpcId;
	method: string;
	params?: Record<string, unknown>;
};

type McpResponse = Record<string, unknown>;

function success(id: JsonRpcId, result: unknown): string {
	return JSON.stringify({ jsonrpc: '2.0', id, result });
}

function error(id: JsonRpcId, code: number, message: string): string {
	return JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
}

function notification(method: string): string {
	return JSON.stringify({ jsonrpc: '2.0', method });
}

/**
 * Handle one inbound MCP JSON-RPC message and return the outbound wire string(s)
 * (a notification such as `notifications/initialized` needs no reply, but nothing
 * else here emits spontaneous messages, so return zero or one response).
 */
export async function handleMcpMessage(
	raw: string,
	state: { pages: MimePage[] | null },
	config: ServerConfig
): Promise<string | null> {
	let req: McpRequest;
	try {
		req = JSON.parse(raw) as McpRequest;
	} catch {
		return error(null, -32700, 'Parse error');
	}
	if (req.jsonrpc !== '2.0') return error(req.id ?? null, -32600, 'Invalid Request');

	const id = req.id ?? null;
	const { method, params = {} } = req;

	switch (method) {
		case 'initialize':
			return success(id, {
				protocolVersion: PROTOCOL_VERSION,
				capabilities: {
					resources: { subscribe: false, listChanged: false },
					tools: {}
				},
				serverInfo: { name: SERVER_NAME, version: SERVER_VERSION }
			});
		case 'notifications/initialized':
			return null;
		case 'ping':
			return success(id, {});
		case 'resources/list':
			state.pages = state.pages ?? (await listPages(config));
			return success(id, {
				resources: state.pages.map((p) => ({
					uri: `acrolls://${p.path.replace(/^\/+/, '')}`,
					name: p.title,
					mimeType: p.mimeType,
					description: p.description
				}))
			});
		case 'resources/read':
			state.pages = state.pages ?? (await listPages(config));
			{
				const uri = String(params.uri ?? '');
				const path = uri.replace(/^acrolls:\/\//, '').replace(/^\/+/, '');
				const page = state.pages.find((p) => p.path.replace(/^\/+/, '') === path);
				if (!page) return error(id, -32602, `Unknown resource: ${uri}`);
				const body = await readPageBody(page, config);
				if (body === null) return error(id, -32602, `Could not read resource: ${uri}`);
				return success(id, {
					contents: [
						{ uri, mimeType: 'text/markdown', text: stripFrontmatter(body) }
					]
				});
			}
		case 'tools/list':
			state.pages = state.pages ?? (await listPages(config));
			return success(id, { tools: tools(state.pages) });
		case 'tools/call':
			state.pages = state.pages ?? (await listPages(config));
			return runTool(id, state.pages, params, config);
		case 'shutdown':
			return success(id, null);
		default:
			return error(id, -32601, `Method not found: ${method}`);
	}
}

function stripFrontmatter(text: string): string {
	const { body } = parseFrontmatter(text);
	return body.trim();
}

type McpTool = {
	name: string;
	description: string;
	inputSchema: {
		type: 'object';
		properties: Record<string, unknown>;
		required: string[];
	};
};

function tools(pages: MimePage[]): McpTool[] {
	const pagePath = {
		type: 'string',
		description: `Page path from list_pages (e.g. ${pages[0]?.path ?? '/docs/guides/install'})`
	};
	return [
		{
			name: 'list_pages',
			description: 'List every page in this Acrolls corpus (path, title, date, tags).',
			inputSchema: { type: 'object', properties: {}, required: [] }
		},
		{
			name: 'read_page',
			description: 'Read the raw Markdown of one page by path.',
			inputSchema: { type: 'object', properties: { path: pagePath }, required: ['path'] }
		},
		{
			name: 'search_pages',
			description: 'Search the corpus by title/tags and return matching paths.',
			inputSchema: {
				type: 'object',
				properties: {
					query: { type: 'string', description: 'Substring to match against titles and tags' }
				},
				required: ['query']
			}
		},
		{
			name: 'page_paths',
			description: 'Return all known page paths as a plain list (for tool input).',
			inputSchema: {
				type: 'object',
				properties: { prefix: { type: 'string', description: 'Only paths starting with this prefix' } },
				required: []
			}
		}
	];
}

async function runTool(
	id: JsonRpcId,
	pages: MimePage[],
	params: Record<string, unknown>,
	config: ServerConfig
): Promise<string> {
	const name = String(params.name ?? '');
	const args = (params.arguments ?? {}) as Record<string, unknown>;
	const text = (value: unknown) => success(id, { content: [{ type: 'text', text: String(value) }] });

	if (name === 'list_pages') {
		return text(
			JSON.stringify(
				pages.map((p) => ({
					path: p.path,
					title: p.title,
					date: p.date,
					tags: p.tags
				})),
				null,
				2
			)
		);
	}
	if (name === 'page_paths') {
		const prefix = String(args.prefix ?? '');
		const paths = pages.map((p) => p.path).filter((p) => (prefix ? p.startsWith(prefix) : true));
		return text(JSON.stringify(paths, null, 2));
	}
	if (name === 'read_page') {
		const path = String(args.path ?? '');
		const page = pages.find((p) => p.path === path);
		if (!page) return error(id, -32602, `Unknown page path: ${path}`);
		const body = await readPageBody(page, config);
		if (body === null) return error(id, -32602, `Could not read page: ${path}`);
		return text(stripFrontmatter(body));
	}
	if (name === 'search_pages') {
		const query = String(args.query ?? '').toLowerCase();
		const hits = pages
			.filter((p) => p.title.toLowerCase().includes(query) || p.tags.some((t) => t.toLowerCase().includes(query)))
			.map((p) => ({ path: p.path, title: p.title, tags: p.tags }));
		return text(JSON.stringify(hits, null, 2));
	}
	return error(id, -32602, `Unknown tool: ${name}`);
}

// ---------------------------------------------------------------- stdio server

/**
 * Run the MCP stdio loop: read newline-delimited JSON-RPC on stdin and write one
 * line of JSON on stdout per request. A null response from the handler is silently
 * skipped (notifications). Keep the process alive for a stream.
 */
export async function runMcpStdio(config: ServerConfig): Promise<void> {
	const rl = createInterface({ input: process.stdin, terminal: false });
	const state: { pages: MimePage[] | null } = { pages: null };
	const write = (line: string | null) => {
		if (line) process.stdout.write(`${line}\n`);
	};
	for await (const rawLine of rl) {
		if (!rawLine.trim()) continue;
		const resp = await handleMcpMessage(rawLine, state, config);
		write(resp);
	}
}

export function resolveMcpConfig(args: Record<string, string | boolean>): ServerConfig {
	const contentDir =
		typeof args.content === 'string' && args.content ? resolveLocal(args.content) : undefined;
	const baseUrl = typeof args.url === 'string' && args.url ? args.url.replace(/\/+$/, '') : undefined;
	const pathPrefix =
		typeof args['path-prefix'] === 'string' && args['path-prefix'] ? `/${args['path-prefix'].replace(/^\/+|\/+$/g, '')}` : '';
	if (contentDir && baseUrl) {
		throw new Error('Provide either --content or --url for `acrolls mcp`, not both.');
	}
	if (!contentDir && !baseUrl) {
		throw new Error('`acrolls mcp` needs --content <dir> or --url <site>.');
	}
	return { contentDir, baseUrl, pathPrefix };
}

function resolveLocal(p: string): string {
	return isAbsolute(p) ? p : join(process.cwd(), p);
}

/** Convenience for tests: clean up after stdio loop ends via stdin 'end'. */
export function _flushStateForTest(state: { pages: MimePage[] | null }): void {
	state.pages = null;
}
