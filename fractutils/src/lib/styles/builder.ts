import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import * as sass from 'sass';

export const defaultContent = [
	'index.html',
	'src/**/*.{svelte,html,js,ts,jsx,tsx,mjs,svx}',
	'src/routes/**/*.md'
];

const defaultExclude = [
	'**/.git/**',
	'**/.svelte-kit/**',
	'**/.vercel/**',
	'dist/**',
	'build/**',
	'**/*.test.*',
	'**/*.spec.*'
];
const toolingDirectory = fileURLToPath(new URL('.', import.meta.url));

export interface ContentOptions {
	/** Paths/globs relative to root. Include dependency component sources explicitly. */
	content?: string[];
	/** Additional paths/globs to exclude. Build output and test files are always excluded. */
	exclude?: string[];
	/** Complete class names only. No regular expressions or wildcard expansion. */
	safelist?: string[];
	root?: string;
}

export interface StylesOptions extends ContentOptions {
	/** Optional application-owned .sass wrapper that configures and loads styles/index. */
	styleEntry?: string;
	sass?: Omit<sass.Options<'async'>, 'style' | 'sourceMap'>;
	/** Uncompressed delivery budget; defaults to 128 KiB. Throws rather than shipping bulk. */
	maxCssBytes?: number;
}

/** Conservative literal discovery, not evaluation of templates or JavaScript. */
export function extractCandidates(source: string): Set<string> {
	const candidates = new Set<string>();
	for (const match of source.matchAll(/[A-Za-z_][A-Za-z0-9_:-]*/g)) {
		let token = match[0];
		if (token.startsWith('class:')) token = token.slice(6);
		token = token.replace(/:+$/, '');
		if (token) candidates.add(token);
	}
	return candidates;
}

export async function scanContent(options: ContentOptions = {}) {
	const root = path.resolve(options.root ?? process.cwd());
	const content = options.content ?? defaultContent;
	// No blanket node_modules exclusion: explicitly requested published dist
	// component sources must work. Only the application's own dist/build is ignored.
	const files = (
		await fg(content, {
			cwd: root,
			absolute: true,
			onlyFiles: true,
			unique: true,
			ignore: [...defaultExclude, ...(options.exclude ?? [])]
		})
	).filter((file) => !file.startsWith(toolingDirectory));
	const selected = files.sort();
	const candidates = new Set<string>();
	for (const name of options.safelist ?? []) {
		if (typeof name !== 'string' || !name || /\s/.test(name)) {
			throw new Error('fractutils safelist entries must be non-empty, complete class names.');
		}
		candidates.add(name);
	}
	await Promise.all(
		selected.map(async (file) => {
			try {
				for (const token of extractCandidates(await readFile(file, 'utf8'))) candidates.add(token);
			} catch (error) {
				// An editor can delete/rename a source between globbing and reading it.
				if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
			}
		})
	);
	const watchRoots = fg
		.generateTasks(content, { cwd: root })
		.map((task) => path.resolve(root, task.base));
	return { candidates, files: selected, watchRoots: [...new Set(watchRoots)] };
}

function possible(node: selectorParser.Node, candidates: ReadonlySet<string>): boolean {
	if (node.type === 'class') return candidates.has(node.value);
	if (node.type === 'selector' || node.type === 'root') {
		return node.nodes.every((child) => possible(child, candidates));
	}
	if (node.type === 'pseudo' && [':is', ':where', ':has'].includes(node.value)) {
		return node.nodes.some((alternative) => possible(alternative, candidates));
	}
	// Negation is not a positive requirement. Preserve :not(), unknown functional
	// pseudos, attributes, element selectors, and runtime state pseudo-classes.
	return true;
}

/** Filter selectors in place: declarations, specificity and rule order survive. */
export function pruneCss(css: string, candidates: ReadonlySet<string>) {
	const root = postcss.parse(css);
	let selectorsBefore = 0;
	let selectorsAfter = 0;
	root.walkRules((rule) => {
		const selectors = selectorParser().astSync(rule.selector);
		selectorsBefore += selectors.nodes.length;
		for (const selector of [...selectors.nodes]) {
			if (!possible(selector, candidates)) selector.remove();
		}
		selectorsAfter += selectors.nodes.length;
		if (selectors.nodes.length) rule.selector = selectors.toString();
		else rule.remove();
	});
	// Retain layer-order declarations, keyframes, fonts, and custom properties.
	const conditionalRules: postcss.AtRule[] = [];
	root.walkAtRules((rule) => {
		conditionalRules.push(rule);
	});
	for (const rule of conditionalRules.reverse()) {
		if (['media', 'supports', 'container'].includes(rule.name) && rule.nodes?.length === 0)
			rule.remove();
	}
	return { css: root.toString(), selectorsBefore, selectorsAfter };
}

export async function compileStyles(options: StylesOptions = {}) {
	const entry = options.styleEntry
		? path.resolve(options.root ?? process.cwd(), options.styleEntry)
		: fileURLToPath(new URL('./index.sass', import.meta.url));
	const result = await sass.compileAsync(entry, {
		...options.sass,
		importers: [
			new sass.NodePackageImporter(options.root ?? process.cwd()),
			...(options.sass?.importers ?? [])
		],
		style: 'compressed',
		sourceMap: false
	});
	return {
		css: result.css,
		files: result.loadedUrls
			.filter((url) => url.protocol === 'file:')
			.map((url) => fileURLToPath(url))
	};
}

export function assertCssBudget(css: string, maxCssBytes = 128 * 1024): void {
	if (!Number.isSafeInteger(maxCssBytes) || maxCssBytes <= 0) {
		throw new Error('fractutils maxCssBytes must be a positive integer.');
	}
	const bytes = Buffer.byteLength(css);
	if (bytes > maxCssBytes) {
		throw new Error(
			`fractutils CSS is ${bytes} bytes, exceeding maxCssBytes=${maxCssBytes}. Check content globs and safelist before increasing the budget.`
		);
	}
}

/** Framework-independent entry point for other build systems. No file writes. */
export async function buildStyles(options: StylesOptions = {}) {
	const [compiled, content] = await Promise.all([compileStyles(options), scanContent(options)]);
	const result = pruneCss(compiled.css, content.candidates);
	assertCssBudget(result.css, options.maxCssBytes);
	return {
		...result,
		files: [...new Set([...compiled.files, ...content.files])]
	};
}
