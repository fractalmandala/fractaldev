import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import * as sass from 'sass';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(readFileSync(resolve(root, 'src/lib/styles/token-source.json'), 'utf8'));
const sassSource = readFileSync(resolve(root, 'src/lib/styles/_00_tokens.sass'), 'utf8');
const styleFiles = ['_00_tokens.sass', '_01_config.sass', '_02_fonts.sass', '_03_responsive.sass', '_04_atoms.sass', '_05_molecules.sass', '_06_recipes.sass', '_07_base.sass', '_08_blocks.sass', '_09_utilities.sass', '_10_layouts.sass', '_11_own.sass', 'index.sass', 'global.sass']
	.map((file) => readFileSync(resolve(root, 'src/lib/styles', file), 'utf8'))
	.join('\n');

const missingDefaults = Object.entries(source.defaults)
	.filter(([name, value]) => !sassSource.includes(`${name}: ${value}`));
const missingDark = Object.entries(source.dark)
	.filter(([name, value]) => !sassSource.includes(`${name}: ${value}`));
const forbiddenColourAliases = styleFiles.match(/--(?:color|surface|canvas|foreground|background)-[a-z0-9-]+/gi) ?? [];
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

const compiled = sass.compile(resolve(root, 'styles/system.sass'), {
	style: 'expanded',
	importers: [sassPackageImporter],
	loadPaths: [resolve(root, 'node_modules')]
}).css;

if (missingDefaults.length || missingDark.length || forbiddenColourAliases.length) {
	if (missingDefaults.length) console.error(`Missing generated defaults: ${missingDefaults.map(([name]) => name).join(', ')}`);
	if (missingDark.length) console.error(`Missing generated dark values: ${missingDark.map(([name]) => name).join(', ')}`);
	if (forbiddenColourAliases.length) console.error(`Forbidden colour aliases found: ${[...new Set(forbiddenColourAliases)].join(', ')}`);
	process.exitCode = 1;
}

for (const required of ['--border-width: 1px', '--border-emphasis-width: 3px', '--focus-ring-width: 2px']) {
	if (!compiled.includes(required)) {
		console.error(`Compiled Sass is missing ${required}`);
		process.exitCode = 1;
	}
}

if (!compiled.includes('.ui-theme[data-theme=dark]') || !compiled.includes('.ui-theme[data-theme=light]')) {
	console.error('Compiled Sass is missing explicit scoped light/dark selectors.');
	process.exitCode = 1;
}

if (!process.exitCode) console.log('Style contract passed: source, generated Sass, forbidden aliases, and compilation are consistent.');
