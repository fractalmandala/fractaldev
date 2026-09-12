import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (message) => failures.push(message);
const read = (file) => readFileSync(join(root, file), 'utf8');
const packageJson = JSON.parse(read('package.json'));

if (existsSync(join(root, 'svelte.config.js')) || existsSync(join(root, 'svelte.config.ts'))) {
	fail('SvelteKit 3 must not use a svelte.config file; configure Kit through vite.config.ts.');
}

const vite = read('vite.config.ts');
if (!vite.includes("from '@sveltejs/kit/vite'") || !vite.includes("from '@sveltejs/adapter-auto'") || !vite.includes('adapter: adapter()')) {
	fail('vite.config.ts must configure the SvelteKit plugin and adapter together.');
}

const tsconfig = JSON.parse(read('tsconfig.json'));
if (tsconfig.extends !== '$app/tsconfig') fail('tsconfig.json must extend $app/tsconfig.');
if (!Array.isArray(tsconfig.include) || !Array.isArray(tsconfig.exclude)) fail('tsconfig.json must define explicit include and exclude arrays.');

const requiredImports = ['#lib', '#lib/*'];
for (const name of requiredImports) if (!packageJson.imports?.[name]) fail(`package.json is missing the ${name} imports mapping.`);

const requiredVersions = {
	'@sveltejs/adapter-auto': '8.0.0-next.3',
	'@sveltejs/kit': '3.0.0-next.25',
	'@sveltejs/vite-plugin-svelte': '7.3.0',
	'svelte': '^5.56.4',
	'vite': '8.2.2',
	'typescript': '6.0.3'
};
for (const [name, version] of Object.entries(requiredVersions)) {
	if (packageJson.devDependencies?.[name] !== version) fail(`${name} must remain pinned to the verified SvelteKit 3 migration version (${version}).`);
}
if (packageJson.engines?.node !== '>=22.17.0') fail('package.json must declare Node >=22.17.0.');
if (packageJson.engines?.pnpm !== '>=11') fail('package.json must declare pnpm >=11.');

const sourceFiles = [];
function collect(directory) {
	for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
		const relative = join(directory, entry.name);
		if (entry.isDirectory()) collect(relative);
		else if (/\.(svelte|ts)$/.test(entry.name)) sourceFiles.push(relative);
	}
}
collect('src');

for (const file of sourceFiles) {
	const source = read(file);
	// catalogue.ts stores copy-ready imports inside template strings; those are
	// intentionally rewritten to the published package name at runtime.
	if (file !== 'src/lib/docs/catalogue.ts' && /(?:from\s+|import\(\s*)['"]\$lib(?:[/'"])/.test(source)) fail(`${file} still contains an executable $lib import.`);
	if (source.includes("'$app/stores'") || source.includes('"$app/stores"')) fail(`${file} still imports removed $app/stores.`);
	if (source.includes("'$app/environment'") || source.includes('"$app/environment"')) fail(`${file} still imports renamed $app/environment.`);
	if (source.includes("'$service-worker'") || source.includes('"$service-worker"')) fail(`${file} still imports removed $service-worker.`);
	for (const match of source.matchAll(/(?:from\s+|import\(\s*)['"](#lib[^'"]*)['"]/g)) {
		const specifier = match[1];
		if (!/\.(?:ts|svelte|sass|json)$/.test(specifier)) fail(`${file} has a #lib import without an explicit extension: ${specifier}`);
	}
}

for (const file of ['src/routes/components/[slug]/+page.server.ts', 'src/routes/guides/[slug]/+page.server.ts']) {
	if (!read(file).includes('PageServerLoad')) fail(`${file} should use the generated PageServerLoad type.`);
}

if (failures.length) {
	for (const failure of failures) console.error(`SvelteKit 3 contract: ${failure}`);
	process.exitCode = 1;
} else {
	console.log(`SvelteKit 3 contract passed: Vite-owned config, dependency floor, #lib imports, typed loads, and removed API guards.`);
}
