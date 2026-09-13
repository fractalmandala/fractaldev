import { describe, expect, it, beforeAll } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { handleMcpMessage, resolveMcpConfig } from './mcp.js';

let root: string;

beforeAll(async () => {
	root = await mkdtemp(join(tmpdir(), 'acrolls-mcp-'));
	await mkdir(join(root, 'guides'), { recursive: true });
	await writeFile(
		join(root, 'guides', 'install.md'),
		'---\ntitle: Install\ndescription: Add Acrolls.\n---\n\n# Install\n\nRun pnpm add acrolls.\n'
	);
	await writeFile(
		join(root, '2025-01-01-post.md'),
		'---\ntitle: First post\ndate: 2025-01-01\ntags:\n  - announce\n---\n\nHello.\n'
	);
});

const state = () => ({ pages: null as null | Record<string, unknown>[] });

async function call(method: string, params: Record<string, unknown> = {}, id = 1) {
	const raw = JSON.stringify({ jsonrpc: '2.0', id, method, params });
	const out = await handleMcpMessage(raw, state() as never, { contentDir: root, pathPrefix: '/docs' });
	return out ? JSON.parse(out) : null;
}

describe('acrolls mcp', () => {
	it('initialize advertises the protocol version and capabilities', async () => {
		const res = await call('initialize');
		expect(res.result.protocolVersion).toBeTruthy();
		expect(res.result.serverInfo.name).toBe('acrolls');
		expect(res.result.capabilities.tools).toBeDefined();
		expect(res.result.capabilities.resources).toBeDefined();
	});

	it('notifications/initialized needs no response', async () => {
		const res = await call('notifications/initialized');
		expect(res).toBeNull();
	});

	it('lists pages as resources with path + title', async () => {
		const res = await call('resources/list');
		const paths = res.result.resources.map((r: { uri: string }) => r.uri);
		expect(paths).toContain('acrolls://docs/guides/install');
		expect(paths.some((p: string) => p.includes('post'))).toBe(true);
	});

	it('reads a page as raw Markdown without frontmatter', async () => {
		const res = await call('resources/read', { uri: 'acrolls://docs/guides/install' });
		expect(res.result.contents[0].mimeType).toBe('text/markdown');
		expect(res.result.contents[0].text).toContain('pnpm add acrolls');
		expect(res.result.contents[0].text.startsWith('---')).toBe(false);
	});

	it('exposes tools and runs list_pages / read_page / search_pages', async () => {
		const tools = await call('tools/list');
		const names = tools.result.tools.map((t: { name: string }) => t.name);
		expect(names).toEqual(
			expect.arrayContaining(['list_pages', 'read_page', 'search_pages', 'page_paths'])
		);

		const listed = await call('tools/call', { name: 'list_pages', arguments: {} });
		const pages = JSON.parse(listed.result.content[0].text);
		expect(pages.map((p: { title: string }) => p.title)).toEqual(
			expect.arrayContaining(['Install', 'First post'])
		);

		const read = await call('tools/call', {
			name: 'read_page',
			arguments: { path: '/docs/guides/install' }
		});
		expect(read.result.content[0].text).toContain('pnpm add acrolls');

		const search = await call('tools/call', {
			name: 'search_pages',
			arguments: { query: 'announce' }
		});
		const hits = JSON.parse(search.result.content[0].text);
		expect(hits.some((h: { title: string }) => h.title === 'First post')).toBe(true);
	});

	it('returns a JSON-RPC error for an unknown method', async () => {
		const res = await call('does/not/exist');
		expect(res.error.code).toBe(-32601);
	});

	it('rejects ambiguous or missing mcp config', () => {
		expect(() => resolveMcpConfig({})).toThrow(/--content|--url/);
		expect(() => resolveMcpConfig({ content: 'docs', url: 'https://x.dev' })).toThrow(/not both/);
	});
});
