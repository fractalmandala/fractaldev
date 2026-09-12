import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Fresh-consumer case study (D12).
//
// Where `verify-packed-consumer.mjs` hand-writes a consumer and proves install + entrypoints +
// Vite build, this script proves the CLI *adoption funnel* end-to-end from a pristine host that
// obtains Acrolls exactly the way an external consumer would — a single package install — and then
// drives the real `acrolls` binary: `--version`, `create`, and `validate`. A best-effort scaffold
// build (the one piece the packed-consumer already proves elsewhere) runs last and never fails the
// funnel, so a transient registry hiccup cannot mask a good result.
//
// It is deliberately NOT wired into CI (a full SvelteKit scaffold install is slow and network
// dependent); run it locally before a release: `pnpm verify:fresh-consumer`.

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicPackage = JSON.parse(readFileSync(join(root, 'packages/acrolls/package.json'), 'utf8'));
const keep = process.env.ACROLLS_KEEP_STUDY === '1';

const studyRoot = mkdtempSync(join(tmpdir(), `acrolls-fresh-consumer-${publicPackage.version}-`));
const packDirectory = join(studyRoot, 'pack');
const hostDirectory = join(studyRoot, 'host');
mkdirSync(packDirectory);
mkdirSync(hostDirectory);

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
	return output ?? '';
}

function parsePackResult(output) {
	const start = output.indexOf('{');
	const end = output.lastIndexOf('}');
	if (start < 0 || end < start) throw new Error('pnpm pack did not return JSON metadata');
	return JSON.parse(output.slice(start, end + 1));
}

const checks = [];
function record(name, detail) {
	checks.push({ name, detail });
	console.log(`\n\u2713 ${name}: ${detail}`);
}

try {
	// 1. Pack the public package exactly as a release would.
	const packResult = parsePackResult(
		run(
			'pnpm',
			['--config.node-linker=hoisted', '--filter', 'acrolls', 'pack', '--pack-destination', packDirectory, '--json'],
			root,
			{ print: false }
		)
	);
	const tarball = packResult.filename;
	if (!existsSync(tarball)) throw new Error(`Packed tarball was not created: ${tarball}`);
	if (packResult.version !== publicPackage.version) {
		throw new Error(`Packed version ${packResult.version} != ${publicPackage.version}`);
	}
	record('pack', `${tarball} @ ${packResult.version}`);

	// 2. A pristine host installs ONLY the packed tarball — no workspace, no file: to sources.
	writeFileSync(
		join(hostDirectory, 'package.json'),
		JSON.stringify(
			{ name: 'acrolls-fresh-host', private: true, type: 'module', dependencies: { acrolls: `file:${tarball}` } },
			null,
			2
		) + '\n'
	);
	run('pnpm', ['install', '--config.node-linker=isolated', '--ignore-scripts', '--no-frozen-lockfile'], hostDirectory, {
		print: false
	});
	const bin = join(hostDirectory, 'node_modules', '.bin', 'acrolls');
	if (!existsSync(bin)) throw new Error('The installed package did not expose an `acrolls` bin.');
	record('install', 'node_modules/.bin/acrolls present from the tarball alone');

	// 3. The bin reports the release version. (Run the .bin shim directly — it is a shebang'd
	//    script, exactly what `pnpm exec acrolls` / `npx acrolls` invoke; do NOT `node` it.)
	const versionOut = run(bin, ['--version'], hostDirectory, { print: false }).trim();
	if (!versionOut.includes(publicPackage.version)) {
		throw new Error(`Unexpected --version from installed bin: "${versionOut}"`);
	}
	record('--version', versionOut);

	// 4. `create` scaffolds a fresh docs site from the installed CLI.
	run(
		bin,
		['create', 'site', '--package-manager', 'pnpm', '--title', 'Fresh Consumer', '--base-href', '/docs'],
		hostDirectory,
		{ print: false }
	);
	const siteDirectory = join(hostDirectory, 'site');
	const tree = readdirSync(siteDirectory);
	for (const required of ['package.json', 'vite.config.ts', 'src', 'static']) {
		if (!tree.includes(required)) throw new Error(`Scaffold is missing ${required}`);
	}
	const requiredFiles = [
		'src/content/index.md',
		'src/content/getting-started.md',
		'src/lib/docs/source.ts',
		'src/lib/docs/DocsArticleLayout.svelte',
		'src/routes/docs/+layout.svelte',
		'README.md'
	];
	for (const file of requiredFiles) {
		if (!existsSync(join(siteDirectory, file))) throw new Error(`Scaffold is missing ${file}`);
	}
	record('create', `scaffolded ${tree.length} top-level entries incl. routes + content`);

	// 5. `validate` checks the scaffolded corpus through the installed CLI.
	const validateOut = run(bin, ['validate', 'src/content'], siteDirectory, { print: false });
	record('validate', validateOut.trim().split('\n').slice(-1)[0] || 'clean report');

	// 6. Best-effort: install the scaffold's own deps + build (vite + search-index). The scaffold's
	//    `acrolls` range points at the unpublished release, so repoint it at the local tarball first.
	let build = 'skipped';
	try {
		const siteManifest = JSON.parse(readFileSync(join(siteDirectory, 'package.json'), 'utf8'));
		siteManifest.dependencies.acrolls = `file:${tarball}`;
		writeFileSync(join(siteDirectory, 'package.json'), JSON.stringify(siteManifest, null, 2) + '\n');
		run('pnpm', ['install', '--config.node-linker=isolated', '--ignore-scripts', '--no-frozen-lockfile'], siteDirectory, {
			print: false
		});
		run('pnpm', ['run', 'build'], siteDirectory, { print: false });
		const hasSite = existsSync(join(siteDirectory, 'build', 'index.html'));
		const hasSearch = existsSync(join(siteDirectory, 'build', 'pagefind', 'pagefind.js'));
		build = hasSite && hasSearch ? 'passed (build/ + pagefind)' : hasSite ? 'built, no search index' : 'no build output';
		record('build (best-effort)', build);
	} catch (error) {
		build = 'failed (best-effort): ' + String(error?.stderr || error?.message || error).split('\n')[0];
		record('build (best-effort)', build);
	}

	console.log(
		'\n' +
			JSON.stringify(
				{ status: 'passed', version: versionOut, build, studyRoot: keep ? studyRoot : '(removed)', checks },
				null,
				2
			)
	);
} finally {
	if (!keep && existsSync(studyRoot)) rmSync(studyRoot, { recursive: true, force: true });
}
