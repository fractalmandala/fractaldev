import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	deriveName,
	deriveTitle,
	routeSegment,
	scaffoldFiles,
	type ScaffoldOptions
} from './scaffold.js';
import { cmdCreate, generateScaffold, normalizeBaseHref } from './create.js';
import { exists } from './util.js';

const originalCwd = process.cwd();
const roots: string[] = [];

async function workspace(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'acrolls-create-'));
	roots.push(root);
	return root;
}

const baseOpts: ScaffoldOptions = {
	name: 'my-docs',
	title: 'My Docs',
	baseHref: '/docs',
	mode: 'default',
	packageManager: 'npm',
	acrollsVersion: '0.8.0'
};

const paths = (files: { path: string }[]) => files.map((file) => file.path);
const file = (files: { path: string; contents: string }[], path: string) =>
	files.find((candidate) => candidate.path === path)?.contents ?? '';
/** Strip the leading YAML frontmatter block so body invariants can be asserted. */
const body = (contents: string) => contents.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

beforeEach(() => {
	vi.spyOn(console, 'log').mockImplementation(() => undefined);
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(async () => {
	process.chdir(originalCwd);
	vi.restoreAllMocks();
	await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('scaffold name helpers', () => {
	it('slugifies a directory into a valid npm name and falls back when empty', () => {
		expect(deriveName('My Site')).toBe('my-site');
		expect(deriveName('foo_bar')).toBe('foo_bar');
		expect(deriveName('Docs.App')).toBe('docs.app');
		expect(deriveName('  --__  ')).toBe('acrolls-docs');
	});

	it('humanizes a name into a title', () => {
		expect(deriveTitle('my-docs')).toBe('My Docs');
		expect(deriveTitle('acrolls')).toBe('Acrolls');
		expect(deriveTitle('getting-started.md')).toBe('Getting Started');
		expect(deriveTitle('')).toBe('Documentation');
	});

	it('reduces a base href to a route segment', () => {
		expect(routeSegment('/docs')).toBe('docs');
		expect(routeSegment('/docs/v1')).toBe('docs/v1');
		expect(routeSegment('docs/')).toBe('docs');
		expect(routeSegment('/')).toBe('docs');
	});

	it('normalizes a base href to a single leading slash', () => {
		expect(normalizeBaseHref('docs')).toBe('/docs');
		expect(normalizeBaseHref('/docs/')).toBe('/docs');
		expect(normalizeBaseHref('/')).toBe('/docs');
		expect(normalizeBaseHref('  /handbook  ')).toBe('/handbook');
	});
});

describe('scaffoldFiles templates', () => {
	it('emits the core project tree', () => {
		const list = paths(scaffoldFiles(baseOpts));
		for (const expected of [
			'package.json',
			'tsconfig.json',
			'vite.config.ts',
			'src/app.html',
			'src/content.d.ts',
			'src/routes/+layout.svelte',
			'src/routes/+layout.ts',
			'src/routes/docs/+layout.svelte',
			'src/routes/docs/+page.ts',
			'src/routes/docs/[...slug]/+page.ts',
			'src/routes/docs/[...slug]/+page.svelte',
			'src/lib/docs/source.ts',
			'src/lib/docs/DocumentPage.svelte',
			'src/lib/docs/DocsArticleLayout.svelte',
			'src/content/index.md',
			'src/content/getting-started.md',
			'src/content/guides/index.md',
			'src/content/guides/components.md',
			'README.md'
		]) {
			expect(list).toContain(expected);
		}
	});

	it('writes a private, ESM package.json pinned to acrolls with build-time search', () => {
		const pkg = JSON.parse(file(scaffoldFiles(baseOpts), 'package.json'));
		expect(pkg.name).toBe('my-docs');
		expect(pkg.private).toBe(true);
		expect(pkg.type).toBe('module');
		expect(pkg.dependencies.acrolls).toBe('^0.8.0');
		expect(pkg.scripts.build).toBe('vite build && acrolls search-index');
		for (const dep of ['@sveltejs/kit', '@sveltejs/adapter-static', 'mdsvex', 'pagefind', 'svelte', 'valibot']) {
			expect(pkg.devDependencies).toHaveProperty(dep);
		}
	});

	it('wires the acrolls mdsvex preprocessor and a static adapter in vite.config.ts', () => {
		const cfg = file(scaffoldFiles(baseOpts), 'vite.config.ts');
		expect(cfg).toContain("from 'acrolls/sveltekit'");
		expect(cfg).toContain('createAcrollsSvelteKitMdsvexPreprocessor');
		expect(cfg).toContain('adapter-static');
		expect(cfg).toContain("docs: { mode: 'authored' }");
		expect(cfg).toContain('DocsArticleLayout.svelte');
	});

	it('imports the selected base style preset in the root layout', () => {
		expect(file(scaffoldFiles(baseOpts), 'src/routes/+layout.svelte')).toContain(
			"import 'acrolls/styles/default.css';"
		);
		expect(file(scaffoldFiles({ ...baseOpts, mode: 'foundation' }), 'src/routes/+layout.svelte')).toContain(
			"import 'acrolls/styles/foundation.css';"
		);
	});

	it('imports the shell chrome and reads the base href from the nav in the docs layout', () => {
		const layout = file(scaffoldFiles(baseOpts), 'src/routes/docs/+layout.svelte');
		expect(layout).toContain("import 'acrolls/docs/styles.css';");
		expect(layout).toContain("import { DocsShell } from 'acrolls/docs';");
		expect(layout).toContain('docs.nav.baseHref');
	});

	it('drives the route segment and import depth from the base href', () => {
		const handbook = scaffoldFiles({ ...baseOpts, baseHref: '/handbook' });
		expect(paths(handbook)).toContain('src/routes/handbook/+layout.svelte');
		expect(file(handbook, 'src/routes/handbook/+layout.svelte')).toContain("from '../../lib/docs/source'");

		const nested = scaffoldFiles({ ...baseOpts, baseHref: '/docs/v1' });
		expect(paths(nested)).toContain('src/routes/docs/v1/[...slug]/+page.ts');
		expect(file(nested, 'src/routes/docs/v1/[...slug]/+page.ts')).toContain(
			"from '../../../../lib/docs/source'"
		);
	});

	it('wires markdownGlob with a lazy body and eager metadata/facts', () => {
		const src = file(scaffoldFiles(baseOpts), 'src/lib/docs/source.ts');
		expect(src).toContain("from 'acrolls/content'");
		expect(src).toContain('markdownGlob');
		expect(src).toContain("import: 'default'");
		expect(src).toContain("import: 'metadata'");
		expect(src).toContain("import: '__acrollsDocument'");
		expect(src).toContain('defineDocsConfig');
		expect(src).toContain("mode: 'authored'");
		expect(src).toContain("title: 'My Docs'");
		expect(src).toContain("baseHref: '/docs'");
	});

	it('keeps starter content warning-free: index has no title, ordinary pages do, no leading H1', () => {
		const files = scaffoldFiles(baseOpts);
		const index = file(files, 'src/content/index.md');
		expect(index).toContain('description:');
		expect(index).not.toMatch(/^title:/m);
		expect(file(files, 'src/content/getting-started.md')).toMatch(/^title: Getting started$/m);

		for (const doc of files.filter((f) => f.path.startsWith('src/content/') && f.path.endsWith('.md'))) {
			expect(body(doc.contents).trimStart().startsWith('# ')).toBe(false);
		}
	});
});

describe('generateScaffold', () => {
	it('writes the full tree into a new directory', async () => {
		const root = await workspace();
		process.chdir(root);
		const result = await generateScaffold({ dir: 'site' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.written.length).toBe(result.files.length);
		expect(await exists(join(root, 'site', 'package.json'))).toBe(true);
		expect(await exists(join(root, 'site', 'src', 'routes', 'docs', '+layout.svelte'))).toBe(true);
		expect(await exists(join(root, 'site', 'src', 'content', 'index.md'))).toBe(true);
		const pkg = JSON.parse(await readFile(join(root, 'site', 'package.json'), 'utf8'));
		expect(pkg.dependencies.acrolls).toBe('^0.8.0');
	});

	it('dry-run reports the tree but writes nothing, not even the directory', async () => {
		const root = await workspace();
		process.chdir(root);
		const result = await generateScaffold({ dir: 'site', dryRun: true });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.dryRun).toBe(true);
		expect(result.written.length).toBeGreaterThan(0);
		expect(await exists(join(root, 'site'))).toBe(false);
	});

	it('refuses a non-empty target directory without --force, leaving it untouched', async () => {
		const root = await workspace();
		process.chdir(root);
		await mkdir(join(root, 'site'), { recursive: true });
		await writeFile(join(root, 'site', 'existing.txt'), 'keep me', 'utf8');
		const result = await generateScaffold({ dir: 'site' });
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.message).toMatch(/not empty/i);
		expect(await readFile(join(root, 'site', 'existing.txt'), 'utf8')).toBe('keep me');
		expect(await exists(join(root, 'site', 'package.json'))).toBe(false);
	});

	it('--force scaffolds into a non-empty directory, overwriting collisions but sparing others', async () => {
		const root = await workspace();
		process.chdir(root);
		await mkdir(join(root, 'site'), { recursive: true });
		await writeFile(join(root, 'site', 'package.json'), '{ "junk": true }', 'utf8');
		await writeFile(join(root, 'site', 'existing.txt'), 'keep me', 'utf8');
		const result = await generateScaffold({ dir: 'site', force: true });
		expect(result.ok).toBe(true);
		const pkg = JSON.parse(await readFile(join(root, 'site', 'package.json'), 'utf8'));
		expect(pkg.dependencies.acrolls).toBe('^0.8.0');
		expect(await readFile(join(root, 'site', 'existing.txt'), 'utf8')).toBe('keep me');
	});

	it('derives the package name and title from the directory when not given', async () => {
		const root = await workspace();
		process.chdir(root);
		await generateScaffold({ dir: 'My Docs Site' });
		const pkg = JSON.parse(await readFile(join(root, 'My Docs Site', 'package.json'), 'utf8'));
		expect(pkg.name).toBe('my-docs-site');
		const src = await readFile(join(root, 'My Docs Site', 'src', 'lib', 'docs', 'source.ts'), 'utf8');
		expect(src).toContain("title: 'My Docs Site'");
	});

	it('honors --base-href on disk', async () => {
		const root = await workspace();
		process.chdir(root);
		await generateScaffold({ dir: 'site', baseHref: '/handbook' });
		expect(await exists(join(root, 'site', 'src', 'routes', 'handbook', '+layout.svelte'))).toBe(true);
		expect(await exists(join(root, 'site', 'src', 'routes', 'docs'))).toBe(false);
	});

	it('reflects the chosen package manager in the printed next steps', async () => {
		const root = await workspace();
		process.chdir(root);
		const result = await generateScaffold({ dir: 'site', packageManager: 'pnpm' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.nextSteps).toContain('pnpm install');
		expect(result.nextSteps).toContain('pnpm dev');
	});
});

describe('cmdCreate', () => {
	it('requires a target directory (exit 2)', async () => {
		await expect(cmdCreate({ _: ['create'], flags: {} })).resolves.toBe(2);
	});

	it('rejects an invalid --mode (exit 2)', async () => {
		await expect(cmdCreate({ _: ['create', 'site'], flags: { mode: 'nope' } })).resolves.toBe(2);
	});

	it('rejects an invalid --package-manager (exit 2)', async () => {
		await expect(
			cmdCreate({ _: ['create', 'site'], flags: { 'package-manager': 'bower' } })
		).resolves.toBe(2);
	});

	it('scaffolds a project and exits 0', async () => {
		const root = await workspace();
		process.chdir(root);
		await expect(
			cmdCreate({ _: ['create', 'site'], flags: { 'package-manager': 'pnpm' } })
		).resolves.toBe(0);
		expect(await exists(join(root, 'site', 'package.json'))).toBe(true);
	});

	it('returns 1 when the target directory is non-empty', async () => {
		const root = await workspace();
		process.chdir(root);
		await mkdir(join(root, 'site'), { recursive: true });
		await writeFile(join(root, 'site', 'x.txt'), 'x', 'utf8');
		await expect(cmdCreate({ _: ['create', 'site'], flags: {} })).resolves.toBe(1);
	});
});
