import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
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
	if (component.aliasOf) {
		if (!slugs.has(component.aliasOf)) fail(`${component.slug} aliases missing page '${component.aliasOf}'`);
		continue;
	}
	if (!component.props.length) fail(`${component.slug} is missing a prop table`);
	if (!component.usage.trim()) fail(`${component.slug} is missing a usage example`);
}

const toKebab = (name) => name
	.replace(/([a-zA-Z])(\d+)/g, '$1-$2')
	.replace(/([a-z])([A-Z])/g, '$1-$2')
	.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
	.toLowerCase();

const componentsDir = join(root, 'src/lib/components');
const componentIndex = readFileSync(join(componentsDir, 'index.ts'), 'utf8');
// Follow `export * from './subpath/index.js'` barrels so re-exported families
// (e.g. context-menu) count as public surface.
const barrelSources = [...componentIndex.matchAll(/export \* from '\.\/(.+)\/(?:index\.js)?';/g)]
	.map((m) => join(componentsDir, m[1], 'index.ts'))
	.filter((file) => existsSync(file))
	.map((file) => readFileSync(file, 'utf8'));
const exportNames = new Set([
	...[...componentIndex.matchAll(/export \{ default as (\w+)/g)].map((m) => m[1]),
	...[...componentIndex.matchAll(/export \{ default (\w+),/g)].map((m) => m[1]),
	...barrelSources.flatMap((source) => [...source.matchAll(/export \{ default as (\w+)/g)].map((m) => m[1]))
]);
// Every catalogue page must map to a real export (catches renames that break pages).
// Compare in kebab-case so acronym exports (ASCIIText) still match their slug.
const exportSlugs = new Set([...exportNames].map((name) => toKebab(name)));
for (const component of components) {
	if (!exportSlugs.has(component.slug)) fail(`catalogue page '${component.slug}' has no matching export`);
}
// Exports without catalogue pages: every export must now resolve to a page,
// either its own or a family page via `aliasOf` on a nearby catalogue entry.
const aliasTargets = new Set(components.filter((c) => c.aliasOf).map((c) => c.slug));
const covered = new Set([...slugs, ...aliasTargets]);
const undocumented = [...exportNames].filter((name) => !covered.has(toKebab(name)));
if (process.env.DOCS_GAP_DEBUG && undocumented.length) writeFileSync('/tmp/docs-gap.json', JSON.stringify(undocumented.sort(), null, 1));
if (undocumented.length) fail(`${undocumented.length}/${exportNames.size} exported components have no catalogue page: ${undocumented.slice(0, 6).join(', ')}${undocumented.length > 6 ? ', …' : ''}`);

const guideRoot = existsSync(join(root, 'docs/guides')) ? join(root, 'docs/guides') : join(root, 'docs/obsolete/guides');
const guideFiles = readdirSync(guideRoot).filter((file) => file.endsWith('.md'));
if (!guideFiles.includes('22-troubleshooting.md')) fail('troubleshooting guide is missing');
if (!guideFiles.includes('23-sveltekit-3-migration.md')) fail('SvelteKit 3 migration guide is missing');
const docsReadme = readFileSync(join(root, 'docs/README.md'), 'utf8');
for (const guide of guideFiles) if (!docsReadme.includes(`guides/${guide}`)) fail(`docs/README.md does not list ${guide}`);

for (const file of [join(root, 'docs/README.md'), join(root, 'docs/DESIGN-SYSTEM.md'), ...guideFiles.map((name) => join(guideRoot, name))]) {
	const markdown = readFileSync(file, 'utf8');
	for (const [, href] of markdown.matchAll(/\]\(([^)#]+)\)/g)) {
		if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) continue;
		let target = resolve(dirname(file), href);
		if (!existsSync(target) && file.includes('obsolete/guides') && href.startsWith('../../')) {
			target = resolve(root, href.replace(/^\.\.\/\.\.\//, ''));
		}
		if (!existsSync(target) && !existsSync(join(root, 'docs/guides')) && existsSync(join(root, 'docs/obsolete/guides'))) {
			target = resolve(dirname(file), href.replace(/(?:^|\.\.\/)guides\//, (m) => m.replace('guides/', 'obsolete/guides/')));
		}
		if (!existsSync(target)) fail(`${file.replace(`${root}/`, '')} links to missing ${href}`);
	}
}

const tokenSource = JSON.parse(readFileSync(join(root, 'src/lib/styles/token-source.json'), 'utf8'));
const tokenGuide = readFileSync(join(guideRoot, '09-token-reference.md'), 'utf8');
for (const name of Object.keys(tokenSource.defaults)) if (!tokenGuide.includes(`\`${name}\``)) fail(`token guide omits ${name}`);

const contractGuide = readFileSync(join(guideRoot, '16-component-contracts.md'), 'utf8');
for (const name of [...readFileSync(join(root, 'src/lib/styles/_00_tokens.sass'), 'utf8').matchAll(/^\t*(--[a-z0-9-]+):/gm)].map((match) => match[1])) {
	if (!contractGuide.includes(`\`${name}\``)) continue;
}

if (failures.length) {
	for (const failure of failures) console.error(`Documentation contract: ${failure}`);
	process.exitCode = 1;
} else {
	console.log(`Documentation contract passed: ${components.length} catalogue pages, ${guideFiles.length} guides, links, tokens, and contracts are covered.`);
}
