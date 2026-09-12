import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { type TestContext } from 'node:test';
import * as sass from 'sass';
import postcss from 'postcss';
import { build, createServer } from 'vite';
import {
	assertCssBudget,
	buildStyles,
	compileStyles,
	extractCandidates,
	pruneCss,
	scanContent
} from './builder.ts';
import { fractutilsStyles } from './vite.ts';

async function fixture(t: TestContext) {
	const root = await mkdtemp(
		path.join(process.env.FRACTUTILS_TEST_TMP ?? tmpdir(), 'fractutils-styles-')
	);
	t.after(() => rm(root, { recursive: true, force: true }));
	await mkdir(path.join(root, 'src'));
	return root;
}

function selectors(css: string) {
	const result = new Set<string>();
	postcss.parse(css).walkRules((rule) => {
		for (const selector of rule.selectors) result.add(selector);
	});
	return result;
}

test('literal extraction handles scopes, responsive suffixes, directives and alternatives', () => {
	const found = extractCandidates(
		`<div class="box b-px:xs-gr:lg-desk" class:active={open} class={tight ? 'b-ps-gs' : 'b-pb-gl'} />`
	);
	for (const token of ['box', 'b-px:xs-gr:lg-desk', 'active', 'b-ps-gs', 'b-pb-gl'])
		assert.ok(found.has(token));
	assert.ok(!found.has('class:active'));
	assert.ok(!extractCandidates('`b-p${size}-gl`').has('b-ps-gl'));
});

test('scanner excludes outputs/tests/docs by default and permits explicit dependency dist', async (t) => {
	const root = await fixture(t);
	await mkdir(path.join(root, 'dist'));
	await mkdir(path.join(root, 'node_modules/ui/dist'), { recursive: true });
	await writeFile(path.join(root, 'src/Page.svelte'), '<div class="b-ps-gl">');
	await writeFile(path.join(root, 'src/unrelated.test.ts'), '"b-pl-gl"');
	await writeFile(path.join(root, 'src/guide.md'), '"b-pb-gb"');
	await writeFile(path.join(root, 'dist/bundle.js'), '"b-pxs-gxl"');
	await writeFile(path.join(root, 'node_modules/ui/dist/Card.svelte'), '<div class="card">');
	const result = await scanContent({
		root,
		content: ['src/**/*', 'dist/**/*', 'node_modules/ui/dist/**/*.svelte'],
		exclude: ['src/*.md'],
		safelist: ['b-pb-gl-desk']
	});
	assert.ok(result.candidates.has('b-ps-gl'));
	assert.ok(result.candidates.has('card'));
	assert.ok(result.candidates.has('b-pb-gl-desk'));
	assert.ok(!result.candidates.has('b-pl-gl'));
	assert.ok(!result.candidates.has('b-pb-gb'));
	assert.ok(!result.candidates.has('b-pxs-gxl'));
	await assert.rejects(scanContent({ root, safelist: ['two classes'] }), /complete class names/);
});

test('selector pruning preserves context, negation, tokens, state and rule order', () => {
	const css = sass.compileString(
		`:root
	--space-sm: 1rem
.used, .unused
	padding: var(--space-sm)
.row.ycenter
	align-items: center
.row.xright
	justify-content: flex-end
.used:not(.missing)
	color: red
.used:is(.active, .other)
	color: blue
.used:has(.child)
	color: green
[data-mode='dark']
	--space-sm: 2rem
@supports (display: grid)
	@media (min-width: 1000px)
		.unused
			display: grid
`,
		{ syntax: 'indented', style: 'compressed' }
	).css;
	const result = pruneCss(css, new Set(['used', 'row', 'ycenter', 'active']));
	const kept = selectors(result.css);
	assert.ok(kept.has('.used'));
	assert.ok(kept.has('.row.ycenter'));
	assert.ok(kept.has('.used:not(.missing)'));
	assert.ok(kept.has('.used:is(.active, .other)') || kept.has('.used:is(.active,.other)'));
	assert.ok(!kept.has('.unused'));
	assert.ok(!kept.has('.row.xright'));
	assert.ok(!kept.has('.used:has(.child)'));
	assert.ok(result.css.includes('--space-sm: 1rem'));
	assert.ok(!result.css.includes('@supports'));
	assert.ok(result.css.indexOf('padding:') < result.css.indexOf('color:blue'));
});

test('real Sass outputs only requested compounds with unchanged declarations and media', async () => {
	const full = await compileStyles();
	const used = new Set(['box', 'b-ps-gl', 'b-px:xs-gr:lg-desk']);
	const result = pruneCss(full.css, used);
	const kept = selectors(result.css);
	assert.ok(kept.has('.b-ps-gl'));
	assert.ok(kept.has('.b-px\\:xs-gr\\:lg-desk'));
	assert.ok(!kept.has('.pad-sm'));
	assert.ok(!kept.has('.b-pl-gxl'));
	const declarations: string[] = [];
	postcss.parse(result.css).walkRules((rule) => {
		if (rule.selector === '.b-ps-gl')
			declarations.push(...rule.nodes.map((node) => node.toString()));
		if (rule.selector === '.b-px\\:xs-gr\\:lg-desk') {
			assert.equal((rule.parent as postcss.AtRule).params, 'all and (min-width: 768px)');
		}
	});
	assert.deepEqual(declarations, [
		'gap:calc(var(--space-lg)*var(--gap-scale, 1))',
		'padding:calc(var(--space-sm)*var(--pad-scale, 1))',
		'border:1px solid var(--border)'
	]);
	assert.ok(Buffer.byteLength(result.css) < 20_000);
	assert.ok(result.selectorsAfter < result.selectorsBefore / 100);
	assert.throws(() => assertCssBudget(full.css), /exceeding maxCssBytes/);
	assertCssBudget(result.css);
	assert.throws(() => assertCssBudget(result.css, 1), /exceeding maxCssBytes/);
	assert.throws(() => assertCssBudget('', Infinity), /positive integer/);
});

test('standalone builder honors custom Sass wrappers, safelists and budget', async (t) => {
	const root = await fixture(t);
	await writeFile(
		path.join(root, 'custom.sass'),
		'.used\n\tpadding: 1rem\n.unused\n\tpadding: 2rem\n'
	);
	const result = await buildStyles({
		root,
		content: [],
		styleEntry: 'custom.sass',
		safelist: ['used']
	});
	assert.deepEqual([...selectors(result.css)], ['.used']);
	await assert.rejects(
		buildStyles({
			root,
			content: [],
			styleEntry: 'custom.sass',
			safelist: ['used'],
			maxCssBytes: 1
		}),
		/exceeding/
	);
});

test('Vite production delivery extracts pruned CSS even with package sideEffects false', async (t) => {
	const root = await fixture(t);
	await writeFile(path.join(root, 'package.json'), '{"type":"module","sideEffects":false}');
	await writeFile(
		path.join(root, 'index.html'),
		'<html><head></head><body class="used"><script type="module" src="/src/main.js"></script></body></html>'
	);
	await writeFile(path.join(root, 'src/main.js'), "import 'virtual:fractutils.css';");
	await writeFile(
		path.join(root, 'custom.sass'),
		'.used\n\tpadding: 1rem\n.unused\n\tpadding: 2rem\n'
	);
	const result = await build({
		root,
		configFile: false,
		plugins: [fractutilsStyles({ styleEntry: 'custom.sass' })],
		logLevel: 'silent',
		build: { write: false }
	});
	assert.ok('output' in result);
	const css = result.output.filter(
		(chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
	);
	assert.equal(css.length, 1);
	assert.ok(css[0].type === 'asset');
	assert.ok(String(css[0].source).includes('.used'));
	assert.ok(!String(css[0].source).includes('.unused'));
	const html = result.output.find(
		(chunk) => chunk.type === 'asset' && chunk.fileName === 'index.html'
	);
	assert.ok(html?.type === 'asset');
	assert.ok(String(html.source).includes('rel="stylesheet"'));
});

test('Vite dev refreshes used CSS on add/change/unlink without resetting unrelated SSR modules', async (t) => {
	const root = await fixture(t);
	await writeFile(path.join(root, 'index.html'), '<html></html>');
	await writeFile(path.join(root, 'src/runtime.js'), 'export const identity = {};');
	await writeFile(path.join(root, 'src/entry.js'), "import 'virtual:fractutils.css';");
	await writeFile(path.join(root, 'src/Page.svelte'), '<div class="old">');
	await writeFile(
		path.join(root, 'custom.sass'),
		'.old\n\tpadding: 1rem\n.new\n\tpadding: 2rem\n.extra\n\tpadding: 3rem\n'
	);
	const server = await createServer({
		root,
		configFile: false,
		plugins: [
			fractutilsStyles({
				styleEntry: 'custom.sass',
				content: ['index.html', 'src/**/*.{svelte,js,fragment}']
			})
		],
		logLevel: 'silent',
		server: { host: '127.0.0.1', port: 0 }
	});
	t.after(() => server.close());
	await server.listen();
	// Mirror SvelteKit's pre-paint traversal: resolve the CSS URL from the SSR
	// transform's deps, then load that same URL with ?inline. Null virtual IDs
	// previously made getModuleByUrl return undefined, silently dropping styles.
	await server.ssrLoadModule('/src/entry.js');
	const graph = server.environments.ssr.moduleGraph;
	const entry = await graph.getModuleByUrl('/src/entry.js');
	const cssUrl = entry?.transformResult?.deps?.find((url: string) => url.endsWith('.css'));
	assert.ok(cssUrl);
	const styleModule = await graph.getModuleByUrl(cssUrl);
	assert.ok(styleModule, 'Stylesheet must be discoverable for SSR first-paint inlining');
	assert.ok(
		![...styleModule.importedModules].some((module) => module.file?.endsWith('.sass')),
		'Watched Sass files must not become dependencies that SSR can inline without pruning'
	);
	assert.ok((await server.ssrLoadModule(`${styleModule.url}?inline`)).default.includes('.old'));
	const load = async () =>
		(await server.ssrLoadModule('virtual:fractutils.css?inline')).default as string;
	assert.ok((await load()).includes('.old'));
	const runtime = await server.ssrLoadModule('/src/runtime.js');
	const send = t.mock.method(server.ws, 'send');
	const reloads = () =>
		send.mock.calls.filter((call) => {
			const payload: unknown = call.arguments[0];
			return (
				typeof payload === 'object' &&
				payload !== null &&
				'type' in payload &&
				payload.type === 'full-reload'
			);
		}).length;
	async function changed(
		file: string,
		event: 'add' | 'change' | 'unlink',
		expected: string,
		absent: string
	) {
		const before = reloads();
		server.watcher.emit(event, file);
		for (let i = 0; reloads() === before && i < 100; i++)
			await new Promise((resolve) => setTimeout(resolve, 30));
		assert.ok(reloads() > before, `${event} did not refresh CSS`);
		const css = await load();
		assert.ok(css.includes(expected), css);
		assert.ok(!css.includes(absent), css);
		assert.equal((await server.ssrLoadModule('/src/runtime.js')).identity, runtime.identity);
	}
	const page = path.join(root, 'src/Page.svelte');
	await writeFile(page, '<div class="new">');
	await changed(page, 'change', '.new', '.old');
	const added = path.join(root, 'src/Added.fragment');
	await writeFile(added, '<div class="extra">');
	await changed(added, 'add', '.extra', '.old');
	await rm(added);
	await changed(added, 'unlink', '.new', '.extra');
	const style = path.join(root, 'custom.sass');
	await writeFile(style, '.new\n\tpadding: 4rem\n');
	await changed(style, 'change', 'padding:4rem', 'padding:2rem');
});
