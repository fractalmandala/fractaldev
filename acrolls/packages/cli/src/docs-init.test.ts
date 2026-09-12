import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cmdDocsInit } from './docs-init.js';
import { DOCS_STARTER_INDEX_MD } from './starter.js';
import { exists } from './util.js';

const originalCwd = process.cwd();
const roots: string[] = [];

async function workspace(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'acrolls-docs-init-'));
	roots.push(root);
	return root;
}

const run = (flags: Record<string, string | boolean> = {}) => cmdDocsInit({ _: ['docs', 'init'], flags });

describe('docs init', () => {
	beforeEach(() => {
		vi.spyOn(console, 'log').mockImplementation(() => undefined);
	});

	afterEach(async () => {
		process.chdir(originalCwd);
		vi.restoreAllMocks();
		await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
	});

	it('creates the starter index.md in the default docs directory', async () => {
		const root = await workspace();
		process.chdir(root);
		await expect(run()).resolves.toBe(0);
		expect(await readFile(join(root, 'docs', 'index.md'), 'utf8')).toBe(DOCS_STARTER_INDEX_MD);
	});

	it('honors --docs-dir', async () => {
		const root = await workspace();
		process.chdir(root);
		await expect(run({ 'docs-dir': 'handbook' })).resolves.toBe(0);
		expect(await readFile(join(root, 'handbook', 'index.md'), 'utf8')).toBe(DOCS_STARTER_INDEX_MD);
	});

	it('dry-run writes nothing, not even the directory', async () => {
		const root = await workspace();
		process.chdir(root);
		await expect(run({ 'dry-run': true })).resolves.toBe(0);
		expect(await exists(join(root, 'docs'))).toBe(false);
	});

	it('never overwrites an existing index.md', async () => {
		const root = await workspace();
		process.chdir(root);
		await mkdir(join(root, 'docs'), { recursive: true });
		await writeFile(join(root, 'docs', 'index.md'), '# Mine', 'utf8');
		await expect(run()).resolves.toBe(0);
		expect(await readFile(join(root, 'docs', 'index.md'), 'utf8')).toBe('# Mine');
	});

	it('pins the starter contract shared with onboarding', () => {
		// The constant is the drift guard between `onboard`'s displayed snippet and the file
		// `docs init` writes; changing its shape is a deliberate act (and a plan-version bump).
		expect(DOCS_STARTER_INDEX_MD).toBe(
			'---\ntitle: Documentation\ndescription: The documentation home\n---\n\n# Documentation\n\nYour first Acrolls documentation page.\n'
		);
	});
});
