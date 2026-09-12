import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, 'src/lib/styles/token-source.json');
const outputPath = resolve(root, 'src/lib/styles/_00_tokens.sass');
const legacyPath = resolve(root, 'src/lib/styles/_tokens.sass');
const source = JSON.parse(readFileSync(sourcePath, 'utf8'));

function appendBlock(lines, selector, values, indent = '') {
	lines.push(`${indent}${selector}`);
	for (const [name, value] of Object.entries(values)) lines.push(`${indent}\t${name}: ${value}`);
}

const lines = ['// Generated from token-source.json. Run pnpm tokens:generate after changing the token source.'];
lines.push('');
lines.push('=light-theme-tokens');
for (const [name, value] of Object.entries(source.defaults)) {
	if (name.startsWith('--bg') || name.startsWith('--text') || name.startsWith('--state') || name.startsWith('--border') || name.startsWith('--theme') || name.startsWith('--success') || name.startsWith('--warning') || name.startsWith('--danger') || name.startsWith('--info') || name.startsWith('--feedback') || name.startsWith('--ring')) {
		lines.push(`\t${name}: ${value}`);
	}
}
lines.push('');
lines.push('=dark-theme-tokens');
for (const [name, value] of Object.entries(source.dark)) {
	lines.push(`\t${name}: ${value}`);
}
lines.push('');
appendBlock(lines, ':root', source.defaults);
lines.push('');
appendBlock(lines, ":root[data-theme='dark'], :root[data-mode='dark'], .ui-theme[data-theme='dark']", source.dark);
lines.push('');
appendBlock(lines, ".ui-theme[data-theme='light']", Object.fromEntries(Object.keys(source.dark).map((name) => [name, source.defaults[name]])));
lines.push('');
lines.push('@media (prefers-color-scheme: dark)');
lines.push('\t:root:not([data-theme]):not([data-mode])');
for (const [name, value] of Object.entries(source.dark)) lines.push(`\t\t${name}: ${value}`);
lines.push('');
lines.push('.ui-theme');
lines.push('\tdisplay: contents');

const generated = `${lines.join('\n')}\n`;
if (process.argv.includes('--check')) {
	const current = readFileSync(outputPath, 'utf8');
	if (current !== generated) {
		console.error('Token Sass is out of date. Run pnpm tokens:generate.');
		process.exitCode = 1;
	}
} else {
	writeFileSync(outputPath, generated);
	writeFileSync(legacyPath, "@forward '00_tokens'\n");
}
