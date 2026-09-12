// Generates src/lib/styles/tw-generated.css — the EXACT Tailwind v4.3 output
// for every utility token used anywhere in frcked, compiled with the project's
// own compiler + its data-theme dark variant. Replaces the tailwind runtime.
//
//   bun scripts/gen-tw-css.ts
//
// Sweeps: class="..." attrs (via lib/untw/extract), every quoted JS string
// (variant maps like Button's 5×7 matrix), Svelte class: directives, app.html —
// plus hand expansions for runtime-interpolated combos:
//   text-${color}-500 × {blue,green,purple,orange,yellow,red}
//   hover:border-blue-400/${80,60} (Card borderIntensity)
// Pass-through props (className/headerClass/…) resolve at call sites, swept.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { statSync } from 'node:fs';
import { extractBlocks } from '../src/lib/untw/extract.ts';
import { compile } from '../node_modules/tailwindcss/dist/lib.mjs';

const ROOT = resolve(import.meta.dir, '..');
const SKIP = [
	'lib/untw/',
	'routes/untw-fd/',
	'lib/styles/untailwind.css',
	'lib/styles/tw-generated.css'
];

function walk(dir: string, out: string[] = []): string[] {
	for (const e of readdirSync(dir)) {
		const p = join(dir, e);
		if (statSync(p).isDirectory()) walk(p, out);
		else if (/\.(svelte|ts|html)$/.test(e)) out.push(p);
	}
	return out;
}

const BARE = new Set(
	'flex grid block hidden relative absolute fixed sticky truncate container sr-only isolate visible invisible static italic'.split(' '),
)
function stripArb(s: string): string | null {
	let out = '';
	let depth = 0;
	for (const ch of s) {
		if (ch === '[') depth++;
		else if (ch === ']') {
			depth--;
			if (depth < 0) return null;
		} else if (depth === 0) out += ch;
	}
	return depth === 0 ? out : null;
}
const FRAC = /\/((1[0-1]|[1-9])\/12|[1-5]\/6|[1-4]\/5|[1-3]\/4|[12]\/3|1\/2|full)$/;
function plausible(raw: string): string | null {
	const t = raw.trim().replace(/^['"`]+|['"`]+$/g, '');
	if (!t || t.length > 80) return null;
	const flat = stripArb(t);
	if (flat === null) return null;
	if (/[.;{}()$#?=,,'"\s]/.test(flat)) return null;
	if (/^[./$]/.test(flat)) return null;
	let core = flat.replace(/\/\d{1,3}$/, '').replace(FRAC, '');
	const segs = core.split(':');
	const head = segs[segs.length - 1];
	if (!/^-?[a-z*][\w/-]*$/.test(head)) return null;
	if (!head.includes('-') && !head.includes('/') && !BARE.has(head) && !head.startsWith('*'))
		return null;
	if (/^-\d/.test(head)) return null;
	for (const v of segs.slice(0, -1)) if (!/^[a-z*][\w/*=-]*$/i.test(v)) return null;
	return t.replace(/^!/, '');
}

const tokens = new Set<string>();
for (const f of walk(join(ROOT, 'src'))) {
	const rel = f.slice(ROOT.length + 5);
	if (SKIP.some((s) => rel.startsWith(s))) continue;
	const src = readFileSync(f, 'utf8');
	for (const b of extractBlocks(src))
		for (const t of b.tokens) {
			const p = plausible(t);
			if (p) tokens.add(p);
		}
	for (const m of src.matchAll(/"([^"\n]{1,400})"|'([^'\n]{1,400})'|`([^`]{1,400})`/g)) {
		const s = m[1] ?? m[2] ?? m[3] ?? '';
		for (const part of s.split(/\s+/)) {
			const p = plausible(part);
			if (p) tokens.add(p);
		}
	}
	for (const m of src.matchAll(/class:([a-zA-Z0-9_-]+)/g)) tokens.add(m[1]);
}
for (const c of ['blue', 'green', 'purple', 'orange', 'yellow', 'red']) {
	tokens.add(`text-${c}-500`);
	tokens.add(`dark:text-${c}-400`);
}
for (const o of ['80', '60']) {
	tokens.add(`hover:border-blue-400/${o}`);
	tokens.add(`dark:hover:border-blue-500/${o}`);
}

async function loadStylesheet(id: string, base: string) {
	const path =
		id === 'tailwindcss' ? resolve(ROOT, 'node_modules/tailwindcss/index.css') : resolve(base, id);
	return { content: readFileSync(path, 'utf8'), base: dirname(path) };
}

const css =
	`@import "tailwindcss";\n` +
	`@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));\n`;

const compiler = await compile(css, { base: ROOT, loadStylesheet });
const out = compiler.build([...tokens]);

const header = `/* GENERATED — do not edit. Regenerate: bun scripts/gen-tw-css.ts
   Tailwind v4.3 compiler output for every utility token used in frcked
   (markup attrs + JS variant maps + class: directives + known interpolations),
   with the project's data-theme dark variant. Replaces the tailwind runtime. */
`;
writeFileSync(join(ROOT, 'src/lib/styles/tw-generated.css'), header + out);
writeFileSync('/tmp/tw-tokens.json', JSON.stringify([...tokens].sort()));
console.log('tokens:', tokens.size, '| bytes:', out.length);
