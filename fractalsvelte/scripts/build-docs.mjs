// build-docs — extract the Props contract of every component into docs.json.
//
// Every component follows the library anatomy: a `<script lang="ts">` block
// declaring `interface Props` and a single `let { ... }: Props = $props()`
// destructure whose initializers are the prop defaults. The TypeScript
// compiler parses both, so the docs pages render a props table straight from
// the types (AGENTS rule 3) with no hand-maintained duplication.
//
// Output: src/lib/data/docs.json — sorted, deterministic.
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const COMPONENTS = path.join(ROOT, 'src/lib/components');
const OUT = path.join(ROOT, 'src/lib/data/docs.json');

function extractScript(source) {
	const match = source.match(/<script lang="ts">([\s\S]*?)<\/script>/);
	if (!match) throw new Error('no <script lang="ts"> block');
	return match[1];
}

function extractComponent(scriptPath) {
	const source = fs.readFileSync(scriptPath, 'utf8');
	const sf = ts.createSourceFile(scriptPath, extractScript(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

	let props = null;
	let types = '';
	const defaults = {};

	for (const statement of sf.statements) {
		// interface Props { ... } — one entry per property signature; index
		// signatures ([key: string]: any) carry no name and are skipped.
		if (ts.isInterfaceDeclaration(statement) && statement.name.text === 'Props') {
			types = printInterface(sf, statement);
			props = statement.members
				.filter((member) => member.name && !ts.isIndexSignatureDeclaration(member))
				.map((member) => ({
					name: member.name.text,
					type: member.type ? member.type.getText(sf) : 'unknown',
					required: !member.questionToken,
					description: docText(member),
					default: defaults[member.name.text]
				}));
		}

		// let { a = 1, b: alias = 'x', ...rest }: Props = $props()
		if (ts.isVariableStatement(statement)) {
			const decl = statement.declarationList.declarations[0];
			if (decl && ts.isObjectBindingPattern(decl.name)) {
				for (const element of decl.name.elements) {
					if (element.dotDotDotToken || !element.initializer) continue;
					const name = element.propertyName
						? element.propertyName.getText(sf).split(':')[0].trim()
						: element.name.getText(sf);
					defaults[name] = element.initializer.getText(sf);
				}
			}
		}
	}

	if (!props) throw new Error(`no interface Props in ${scriptPath}`);

	return { props, types };
}

// JSDoc above a property becomes the table's description column.
function docText(member) {
	const text = member.jsDoc?.map((doc) => doc.comment).join(' ').trim();
	return text || undefined;
}

// Strip JSDoc from the printed interface — the table already carries it.
function printInterface(sf, node) {
	const text = node.getText(sf);
	return text
		.split('\n')
		.filter((line) => !line.trim().startsWith('*') && !line.trim().startsWith('/**') && !line.trim().endsWith('*/'))
		.join('\n');
}

const components = [];
for (const entry of fs.readdirSync(COMPONENTS, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
	if (!entry.isDirectory()) continue;
	const dir = path.join(COMPONENTS, entry.name);
	for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.svelte')).sort()) {
		const name = path.basename(file, '.svelte');
		try {
			const { props, types } = extractComponent(path.join(dir, file));
			components.push({ name, slug: kebab(name), dir: entry.name, props, types });
		} catch (err) {
			console.error(`[docs] ${entry.name}/${file}: ${err.message}`);
			process.exitCode = 1;
		}
	}
}

function kebab(name) {
	return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const EXAMPLES = path.join(ROOT, 'src/lib/docs/examples');
const META = path.join(ROOT, 'src/lib/docs/meta');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ components }, null, '\t') + '\n');

// A component not documented is a component not shipped: every extracted
// component needs a live example and a meta module, or the docs gate fails.
const missing = components
	.filter((c) => !fs.existsSync(path.join(EXAMPLES, `${c.slug}.svelte`)) || !fs.existsSync(path.join(META, `${c.slug}.ts`)))
	.map((c) => c.slug);
if (missing.length > 0) {
	console.error(`[docs] missing example/meta for: ${missing.join(', ')}`);
	process.exitCode = 1;
}

console.log(`[docs] ${components.length} components, ${components.reduce((n, c) => n + c.props.length, 0)} props → ${path.relative(ROOT, OUT)}`);
