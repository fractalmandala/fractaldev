import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicPackage = JSON.parse(
	readFileSync(join(root, 'packages/acrolls/package.json'), 'utf8')
);
const runRoot = mkdtempSync(join(tmpdir(), `acrolls-packed-consumer-${publicPackage.version}-`));
const packDirectory = join(runRoot, 'pack');
const consumerDirectory = join(runRoot, 'consumer');

mkdirSync(packDirectory);
mkdirSync(join(consumerDirectory, 'src'), { recursive: true });

const env = {
	...process.env,
	CI: 'true',
	npm_config_audit: 'false',
	npm_config_fund: 'false'
};

function run(command, args, cwd, { print = true } = {}) {
	const output = execFileSync(command, args, {
		cwd,
		env,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	});
	if (print && output) process.stdout.write(output);
	return output;
}

function parsePackResult(output) {
	const start = output.indexOf('{');
	const end = output.lastIndexOf('}');
	if (start < 0 || end < start) throw new Error('pnpm pack did not return JSON metadata');
	return JSON.parse(output.slice(start, end + 1));
}

const packResult = parsePackResult(
	run(
		'pnpm',
		[
			'--config.node-linker=hoisted',
			'--filter',
			'acrolls',
			'pack',
			'--pack-destination',
			packDirectory,
			'--json'
		],
		root,
		{ print: false }
	)
);
const tarball = packResult.filename;
if (!existsSync(tarball)) throw new Error(`Packed tarball was not created: ${tarball}`);
if (packResult.version !== publicPackage.version) {
	throw new Error(`Packed version ${packResult.version} does not match ${publicPackage.version}`);
}
const packedPaths = new Set(packResult.files.map(({ path }) => path));
for (const dependency of ['unist-util-is', 'unist-util-visit', 'unist-util-visit-parents']) {
	const packagePath = `node_modules/${dependency}/package.json`;
	if (!packedPaths.has(packagePath)) {
		throw new Error(`Bundled dependency is missing from the tarball: ${packagePath}`);
	}
}
for (const styleEntry of [
  'styles/foundation.css',
  'styles/default.css',
  'styles/docs.css',
  'styles/foundation.sass',
  'styles/default.sass',
  'styles/docs.sass',
  'styles/tokens.sass'
]) {
  if (!packedPaths.has(styleEntry)) {
    throw new Error(`Public style entrypoint is missing from the tarball: ${styleEntry}`);
  }
}

writeFileSync(
	join(consumerDirectory, 'package.json'),
	JSON.stringify(
		{
			name: 'acrolls-packed-consumer',
			private: true,
			type: 'module',
			scripts: { build: 'vite build' },
			dependencies: {
				acrolls: `file:${tarball}`,
				'@sveltejs/vite-plugin-svelte': '^6.1.3',
				svelte: '^5.38.1',
				vite: '^7.1.3'
			},
			devDependencies: {
				sass: '^1.102.0'
			}
		},
		null,
		2
	) + '\n'
);

writeFileSync(
	join(consumerDirectory, 'vite.config.js'),
	`import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { NodePackageImporter } from 'sass';
import { createAcrollsSvelteKitMdsvexPreprocessor } from 'acrolls/sveltekit';

export default defineConfig({
  css: {
    // Acrolls ships its SASS entrypoints as package subpath exports (e.g.
    // 'acrolls/docs/styles' -> styles/docs.sass) that @forward a bundled
    // @acrolls/styles nested under node_modules/acrolls/node_modules. Only an
    // exports-aware resolver that walks nested node_modules can load them, which
    // is exactly what Vite (plus the Node package importer, as the example host
    // wires) does. The raw sass CLI with --load-path cannot: it resolves neither
    // package subpath exports nor a nested bundled dependency.
    preprocessorOptions: {
      sass: { importers: [new NodePackageImporter()] }
    }
  },
  plugins: [
    svelte({
      extensions: ['.svelte', '.md'],
      preprocess: [createAcrollsSvelteKitMdsvexPreprocessor()]
    })
  ]
});
`
);

writeFileSync(
	join(consumerDirectory, 'index.html'),
	`<!doctype html>
<html><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>
`
);

writeFileSync(
	join(consumerDirectory, 'src/App.svelte'),
	`<script>
  import { buildDocsCrumbs } from 'acrolls/docs';
  import Content from './content.md';

  const nav = {
    title: 'Fractalsvelte',
    baseHref: '/docs',
    sections: [{
      id: 'docs',
      title: 'Docs',
      items: [{ title: 'Docs', href: '/docs' }]
    }]
  };
  const crumbs = buildDocsCrumbs(nav, '/docs');
</script>

<main>
  <nav aria-label="Breadcrumbs">{crumbs.map((crumb) => crumb.label).join(' / ')}</nav>
  <Content />
</main>
`
);

writeFileSync(
	join(consumerDirectory, 'src/main.js'),
	`import 'acrolls/styles/default.css';
import 'acrolls/docs/styles.css';
import './styles.sass';
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });
`
);

writeFileSync(
	join(consumerDirectory, 'src/styles.sass'),
	`@use 'acrolls/styles/default'
@use 'acrolls/docs/styles'
@use 'acrolls/styles/tokens'
`
);

writeFileSync(
	join(consumerDirectory, 'src/content.md'),
	`# Packed consumer\n\nThis Markdown file exercises the public mdsvex and SvelteKit entrypoints.\n`
);

writeFileSync(
	join(consumerDirectory, 'probe.mjs'),
	`import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  createAcrollsDocsSource,
  createAcrollsSvelteKitMdsvexPreprocessor,
  defineDocsConfig
} from 'acrolls/sveltekit';

const packageEntry = fileURLToPath(import.meta.resolve('acrolls/sveltekit'));
const packageRoot = resolve(dirname(packageEntry), '..');
const { buildDocsCrumbs } = await import(
  pathToFileURL(join(packageRoot, 'node_modules/@acrolls/docs/dist/nav.js')).href
);
const nav = {
  title: 'Fractalsvelte',
  baseHref: '/docs',
  sections: [{
    id: 'docs',
    title: 'Docs',
    items: [{ title: 'Docs', href: '/docs' }]
  }]
};
const labels = buildDocsCrumbs(nav, '/docs').map((crumb) => crumb.label);
if (labels.join(' / ') !== 'Home / Fractalsvelte / Docs') {
  throw new Error('Unexpected breadcrumb labels: ' + labels.join(' / '));
}

const docs = createAcrollsDocsSource({
  modules: { '../../docs/index.md': async () => ({}) },
  metadata: { '../../docs/index.md': { title: 'Docs' } },
  contentRoot: '../../docs',
  config: defineDocsConfig({ title: 'Fractalsvelte', baseHref: '/docs' })
});
if (docs.documents.length !== 1 || docs.documents[0].slug !== '') {
  throw new Error('The public docs source did not normalize the index document');
}

const preprocessor = createAcrollsSvelteKitMdsvexPreprocessor();
const result = await preprocessor.markup({
  content: '# Packed consumer',
  filename: new URL('./src/content.md', import.meta.url).pathname
});
if (!result?.code?.includes('metadata')) throw new Error('The public mdsvex preprocessor did not compile Markdown');

console.log(JSON.stringify({ labels, documentSlug: docs.documents[0].slug, compiled: true }));
`
);

run('pnpm', ['install', '--config.node-linker=isolated', '--ignore-scripts', '--no-frozen-lockfile'], consumerDirectory);
run('node', ['probe.mjs'], consumerDirectory);
// The SASS entrypoints are compiled through Vite (via the './styles.sass' import in
// main.js), not the raw sass CLI: they are package subpath exports that forward a
// bundled @acrolls/styles, which only an exports-aware bundler resolves. This is the
// same path the example host and every real consumer use.
run('pnpm', ['exec', 'vite', 'build'], consumerDirectory);

console.log(
	JSON.stringify(
		{
			status: 'passed',
			version: packResult.version,
			tarball,
			consumerDirectory
		},
		null,
		2
	)
);
