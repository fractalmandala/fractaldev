import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { buildSearchIndex, type PagefindModule } from './search-index.js';

type Log = { calls: string[] };

function fakePagefind(log: Log, pageCount = 3): PagefindModule {
	return {
		async createIndex() {
			log.calls.push('createIndex');
			return {
				errors: [],
				index: {
					async addDirectory(opts) {
						log.calls.push(`addDirectory:${opts.path}:${opts.glob ?? ''}`);
						return { errors: [], page_count: pageCount };
					},
					async writeFiles(opts) {
						log.calls.push(`writeFiles:${opts.outputPath}`);
						return { errors: [], outputPath: opts.outputPath };
					}
				}
			};
		},
		async close() {
			log.calls.push('close');
			return null;
		}
	};
}

async function withTempSite<T>(
	build: boolean,
	fn: (dir: string) => Promise<T>
): Promise<T> {
	const dir = await mkdtemp(resolve(tmpdir(), 'acrolls-search-index-'));
	if (build) await mkdir(resolve(dir, 'build'));
	const cwd = process.cwd();
	process.chdir(dir);
	try {
		return await fn(dir);
	} finally {
		process.chdir(cwd);
		await rm(dir, { recursive: true, force: true });
	}
}

describe('buildSearchIndex', () => {
	it('fails with build guidance when the site directory is missing', async () => {
		const dir = await mkdtemp(resolve(tmpdir(), 'acrolls-search-index-'));
		const res = await buildSearchIndex({
			site: resolve(dir, 'nope'),
			pagefind: fakePagefind({ calls: [] })
		});
		expect(res.ok).toBe(false);
		if (!res.ok) expect(res.message).toMatch(/not found/i);
		await rm(dir, { recursive: true, force: true });
	});

	it('fails with install guidance when pagefind is unavailable', async () => {
		await withTempSite(true, async () => {
			const res = await buildSearchIndex({ site: 'build', pagefind: null });
			expect(res.ok).toBe(false);
			if (!res.ok) expect(res.message).toMatch(/pagefind is not installed/i);
		});
	});

	it('indexes the site, writes the bundle, and closes the service', async () => {
		await withTempSite(true, async (dir) => {
			await writeFile(resolve(dir, 'build/index.html'), '<html><body><h1>Hi</h1></body></html>');
			const log: Log = { calls: [] };
			const res = await buildSearchIndex({ site: 'build', pagefind: fakePagefind(log, 7) });
			expect(res.ok).toBe(true);
			if (res.ok) {
				expect(res.pageCount).toBe(7);
				expect(res.discovered).toBe(7);
				expect(res.outputPath).toMatch(/build[/\\]pagefind$/);
			}
			expect(log.calls[0]).toBe('createIndex');
			expect(log.calls.some((c) => c.startsWith('addDirectory:build:'))).toBe(true);
			expect(log.calls.some((c) => c.startsWith('writeFiles:'))).toBe(true);
			expect(log.calls.at(-1)).toBe('close');
		});
	});

	it('honours a custom output directory', async () => {
		await withTempSite(true, async (dir) => {
			await mkdir(resolve(dir, 'public'));
			const log: Log = { calls: [] };
			const res = await buildSearchIndex({
				site: 'build',
				output: 'public/search',
				pagefind: fakePagefind(log)
			});
			expect(res.ok).toBe(true);
			expect(log.calls.some((c) => c === 'writeFiles:public/search')).toBe(true);
		});
	});

	it('propagates pagefind errors and still closes the service', async () => {
		await withTempSite(true, async () => {
			const log: Log = { calls: [] };
			const pf: PagefindModule = {
				async createIndex() {
					return {
						errors: [],
						index: {
							async addDirectory() {
								return { errors: ['boom'], page_count: 0 };
							},
							async writeFiles(o) {
								return { errors: [], outputPath: o.outputPath };
							}
						}
					};
				},
				async close() {
					log.calls.push('close');
					return null;
				}
			};
			const res = await buildSearchIndex({ site: 'build', pagefind: pf });
			expect(res.ok).toBe(false);
			if (!res.ok) expect(res.message).toBe('boom');
			expect(log.calls).toContain('close');
		});
	});

	it('prefers the indexed count from the written manifest over files discovered', async () => {
		await withTempSite(true, async () => {
			const pf: PagefindModule = {
				async createIndex() {
					return {
						errors: [],
						index: {
							async addDirectory() {
								return { errors: [], page_count: 11 };
							},
							async writeFiles(opts) {
								const out = resolve(opts.outputPath);
								await mkdir(out, { recursive: true });
								await writeFile(
									resolve(out, 'pagefind-entry.json'),
									JSON.stringify({ languages: { en: { page_count: 8 } } })
								);
								return { errors: [], outputPath: opts.outputPath };
							}
						}
					};
				},
				async close() {
					return null;
				}
			};
			const res = await buildSearchIndex({ site: 'build', pagefind: pf });
			expect(res.ok).toBe(true);
			if (res.ok) {
				expect(res.pageCount).toBe(8);
				expect(res.discovered).toBe(11);
			}
		});
	});
});
