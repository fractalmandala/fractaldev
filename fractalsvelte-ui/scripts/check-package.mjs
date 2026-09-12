import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const tempRoot = mkdtempSync(join(tmpdir(), 'fractalsvelte-consumer-'));

try {
	execFileSync('pnpm', ['pack', '--pack-destination', tempRoot, '--silent'], { cwd: root, stdio: 'pipe' });
	const archive = join(tempRoot, `${packageJson.name}-${packageJson.version}.tgz`);
	if (!existsSync(archive)) throw new Error(`Packed archive not found: ${archive}`);
	execFileSync('tar', ['-xzf', archive, '-C', tempRoot]);
	const packageRoot = join(tempRoot, 'package');
	const packedPackageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
	if (!packedPackageJson.imports?.['#lib'] || !packedPackageJson.imports?.['#lib/*']) throw new Error('Packed package is missing its Kit 3 #lib imports map.');
	if (packedPackageJson.engines?.node !== '>=22.17.0') throw new Error('Packed package is missing the Node 22.17 engine floor.');
	const exportedFiles = [
		'src/lib/index.ts',
		'src/lib/components/index.ts',
		'src/lib/styles/index.ts',
		'src/lib/styles/token-source.json',
		'src/lib/styles/tokens.schema.ts',
		'styles/system.sass',
		'styles/global.sass'
	];
	for (const file of exportedFiles) if (!existsSync(join(packageRoot, file))) throw new Error(`Package is missing ${file}`);
	const sassPackageImporter = {
		findFileUrl(url) {
			if (url.startsWith('fractalstyler2/')) {
				const sub = url.replace('fractalstyler2/', '');
				const file = sub === 'fractals' ? '_fractals.sass' : sub === 'styles' ? 'index.sass' : sub;
				return new URL('file://' + resolve(root, 'node_modules/fractalstyler2/dist/styles', file));
			}
			if (url.startsWith('fractalthemer/')) {
				const sub = url.replace('fractalthemer/', '');
				const file = sub === 'styles' ? 'index.sass' : sub;
				return new URL('file://' + resolve(root, 'node_modules/fractalthemer/dist/styles', file));
			}
			return null;
		}
	};

	const css = sass.compile(join(packageRoot, 'styles/system.sass'), {
		style: 'expanded',
		importers: [sassPackageImporter],
		loadPaths: [resolve(root, 'node_modules')]
	}).css;
	if (!css.includes('--theme-color: #04825b') || !css.includes('--border-width: 1px')) throw new Error('Packed Sass entrypoint did not compile the public defaults.');
	const consumerNodeModules = join(tempRoot, 'consumer', 'node_modules');
	mkdirSync(consumerNodeModules, { recursive: true });
	symlinkSync(packageRoot, join(consumerNodeModules, packageJson.name), 'junction');
	const consumerCss = sass.compileString('@use "fractalsvelte/styles/system";', {
		importers: [sassPackageImporter],
		loadPaths: [consumerNodeModules, resolve(root, 'node_modules')],
		style: 'expanded'
	}).css;
	if (!consumerCss.includes('--theme-color: #04825b')) throw new Error('Consumer package subpath could not resolve the Sass system.');
	for (const [key, target] of Object.entries(packageJson.exports)) {
		const targetPath = typeof target === 'string' ? target : target.import ?? target.types ?? target.svelte;
		if (key === './package.json') continue;
		if (targetPath && !existsSync(join(packageRoot, targetPath))) throw new Error(`Export ${key} points to missing ${targetPath}`);
	}
	console.log('Package consumer smoke test passed: packed exports and Sass entrypoint are usable.');
} finally {
	rmSync(tempRoot, { recursive: true, force: true });
}
