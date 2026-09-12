import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (message) => failures.push(message);
const read = (file) => readFileSync(join(root, file), 'utf8');
const packageJson = JSON.parse(read('package.json'));

if (!packageJson.devDependencies?.shiki) fail('package.json must declare Shiki as a documentation dependency.');
const shiki = read('src/lib/docs/shiki.server.ts');
const markdown = read('src/lib/docs/markdown.server.ts');
const componentLoader = read('src/routes/components/[slug]/+page.server.ts');
const guideLoader = read('src/routes/guides/[slug]/+page.server.ts');
const componentPage = read('src/routes/components/[slug]/+page.svelte');
const docsStyles = read('src/lib/styles/_11_own.sass');

for (const [source, checks] of [
	[shiki, [['createHighlighter', 'server highlighter factory'], ['defaultColor: false', 'paired light/dark token output'], ["light: 'github-light'", 'light syntax theme'], ["dark: 'github-dark'", 'dark syntax theme']]],
	[markdown, [['await highlightCode', 'Markdown fence highlighting']]],
	[componentLoader, [['PageServerLoad', 'typed component server loader'], ['usageHtml', 'highlighted component usage payload'], ['highlightCode', 'component usage highlighting']]],
	[guideLoader, [['PageServerLoad', 'typed guide server loader'], ['renderMarkdown', 'highlighted guide payload']]],
	[componentPage, [['{@html data.usageHtml}', 'highlighted usage rendering']]],
	[docsStyles, [['--shiki-dark', 'dark syntax variables for the dark terminal surface']]]
]) {
	for (const [needle, label] of checks) if (!source.includes(needle)) fail(`Shiki contract is missing ${label}.`);
}

const supported = new Set(['svelte', 'sass', 'sh', 'ts', 'html', 'js', 'css', 'json', 'yaml', 'markdown', 'md', 'text', 'plaintext']);
const markdownFiles = ['README.md'];
function collect(directory) {
	for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
		const relative = join(directory, entry.name);
		if (entry.isDirectory()) collect(relative);
		else if (entry.name.endsWith('.md')) markdownFiles.push(relative);
	}
}
collect('docs');
for (const file of markdownFiles) {
	const source = read(file);
	for (const match of source.matchAll(/^```([^\s`]*)/gm)) {
		const language = match[1] || 'text';
		if (!supported.has(language.toLowerCase())) fail(`${file} uses an unsupported code-fence language: ${language}`);
	}
}

if (!existsSync(join(root, 'src/lib/docs/shiki.server.ts'))) fail('server Shiki module is missing.');
if (failures.length) {
	for (const failure of failures) console.error(`Shiki contract: ${failure}`);
	process.exitCode = 1;
} else {
	console.log(`Shiki contract passed: ${markdownFiles.length} Markdown sources, server guide/component highlighting, paired themes, and Sass mode mapping.`);
}
