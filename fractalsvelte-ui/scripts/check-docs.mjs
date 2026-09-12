import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { components } from '../src/lib/docs/catalogue.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (message) => failures.push(message);
const slugs = new Set(components.map((component) => component.slug));

if (slugs.size !== components.length) fail('catalogue contains duplicate component slugs');
for (const component of components) {
	if (!component.description.trim()) fail(`${component.slug} is missing a description`);
	if (!component.props.length) fail(`${component.slug} is missing a prop table`);
	if (!component.usage.trim()) fail(`${component.slug} is missing a usage example`);
}

const toKebab = (name) => name
	.replace(/([a-zA-Z])(\d+)/g, '$1-$2')
	.replace(/([a-z])([A-Z])/g, '$1-$2')
	.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
	.toLowerCase();

const componentIndex = readFileSync(join(root, 'src/lib/components/index.ts'), 'utf8');
for (const [, name] of componentIndex.matchAll(/export \{ default as (\w+) \}/g)) {
	const slug = toKebab(name);
	if (!slugs.has(slug)) fail(`exported component ${name} has no catalogue page (${slug})`);
}

const bitsIndex = readFileSync(join(root, 'src/lib/components/svelte-bits.ts'), 'utf8');
for (const [, name] of bitsIndex.matchAll(/export \{ default as (\w+) \}/g)) {
	const slug = toKebab(name);
	if (!slugs.has(slug)) fail(`SvelteBits alias ${name} has no catalogue page (${slug})`);
}

const guideRoot = join(root, 'docs/guides');
const guideFiles = readdirSync(guideRoot).filter((file) => file.endsWith('.md'));
if (!guideFiles.includes('22-troubleshooting.md')) fail('troubleshooting guide is missing');
if (!guideFiles.includes('23-sveltekit-3-migration.md')) fail('SvelteKit 3 migration guide is missing');
const docsReadme = readFileSync(join(root, 'docs/README.md'), 'utf8');
for (const guide of guideFiles) if (!docsReadme.includes(`guides/${guide}`)) fail(`docs/README.md does not list ${guide}`);

for (const file of [join(root, 'docs/README.md'), join(root, 'docs/DESIGN-SYSTEM.md'), ...guideFiles.map((name) => join(guideRoot, name))]) {
	const markdown = readFileSync(file, 'utf8');
	for (const [, href] of markdown.matchAll(/\]\(([^)#]+)\)/g)) {
		if (!href.endsWith('.md') || href.startsWith('http')) continue;
		const target = resolve(dirname(file), href);
		if (!existsSync(target)) fail(`${file.replace(`${root}/`, '')} links to missing ${href}`);
	}
}

const tokenSource = JSON.parse(readFileSync(join(root, 'src/lib/styles/token-source.json'), 'utf8'));
const tokenGuide = readFileSync(join(guideRoot, '09-token-reference.md'), 'utf8');
for (const name of Object.keys(tokenSource.defaults)) if (!tokenGuide.includes(`\`${name}\``)) fail(`token guide omits ${name}`);

const contractGuide = readFileSync(join(guideRoot, '16-component-contracts.md'), 'utf8');
for (const name of [...readFileSync(join(root, 'src/lib/styles/_08_blocks.sass'), 'utf8').matchAll(/^\t*(--[a-z0-9-]+):/gm)].map((match) => match[1])) {
	if (!contractGuide.includes(`\`${name}\``)) continue;
}

if (failures.length) {
	for (const failure of failures) console.error(`Documentation contract: ${failure}`);
	process.exitCode = 1;
} else {
	console.log(`Documentation contract passed: ${components.length} catalogue pages, ${guideFiles.length} guides, links, tokens, and contracts are covered.`);
}
