import { resolve, relative } from 'node:path';
import { stat, readFile } from 'node:fs/promises';
import { exists } from './util.js';
import type { Args } from './util.js';

/**
 * `acrolls search-index` — post-build packaging for client search.
 *
 * Acrolls' `DocsSearch` loads a Pagefind bundle from `/pagefind/pagefind.js` at
 * runtime. This command generates that bundle from a host's *already built*
 * static output, using the host's own Pagefind install (Pagefind ships native
 * per-platform binaries, so it is an optional peer, never bundled). Scoping is
 * already handled in markup: `data-pagefind-body` marks the article and
 * `data-pagefind-ignore` marks chrome, so no extra selectors are needed here.
 */

/** Minimal shape of the Pagefind Node API this command drives. Declared locally so
 * the CLI type-checks and its tests run without Pagefind installed. */
export type PagefindIndex = {
	addDirectory(opts: {
		path: string;
		glob?: string;
	}): Promise<{ errors: string[]; page_count: number }>;
	writeFiles(opts: { outputPath: string }): Promise<{ errors: string[]; outputPath: string }>;
};

export type PagefindModule = {
	createIndex(config?: Record<string, unknown>): Promise<{ errors: string[]; index?: PagefindIndex }>;
	close(): Promise<null>;
};

export type SearchIndexOptions = {
	/** Built static-site directory to index. Resolved against cwd. */
	site: string;
	/** Where to write the bundle. Defaults to `<site>/pagefind`. */
	output?: string;
	/** File glob within `site`. Defaults to all HTML files. */
	glob?: string;
	/** Verbose Pagefind logging. */
	verbose?: boolean;
	/** Test seam: a Pagefind module, or `null` to simulate "not installed". */
	pagefind?: PagefindModule | null;
};

export type SearchIndexResult =
	| { ok: true; pageCount: number; discovered: number; outputPath: string; sitePath: string }
	| { ok: false; message: string };

async function loadPagefind(
	injected: PagefindModule | null | undefined
): Promise<PagefindModule | null> {
	if (injected !== undefined) return injected;
	try {
		return (await import('pagefind')) as unknown as PagefindModule;
	} catch {
		return null;
	}
}

/** Prefer a cwd-relative path (matches `pagefind --site build`) so result URLs are
 * computed from the site root; fall back to absolute when the site is outside cwd. */
function forPagefind(abs: string): string {
	const rel = relative(process.cwd(), abs);
	return rel && !rel.startsWith('..') ? rel : abs;
}

/** Read the true indexed-page count from the written manifest, summed across
 * languages. `addDirectory` reports files *discovered*; the manifest reports pages
 * actually *indexed* after `data-pagefind-body` scoping. Falls back to `discovered`
 * if the manifest is unreadable. */
async function readIndexedPageCount(outputDir: string, discovered: number): Promise<number> {
	try {
		const entryPath = resolve(process.cwd(), outputDir, 'pagefind-entry.json');
		const entry = JSON.parse(await readFile(entryPath, 'utf8')) as {
			languages?: Record<string, { page_count?: number }>;
		};
		const summed = Object.values(entry.languages ?? {}).reduce(
			(total, lang) => total + (lang.page_count ?? 0),
			0
		);
		return summed > 0 ? summed : discovered;
	} catch {
		return discovered;
	}
}

export async function buildSearchIndex(opts: SearchIndexOptions): Promise<SearchIndexResult> {
	const siteAbs = resolve(process.cwd(), opts.site);
	if (!(await exists(siteAbs))) {
		return {
			ok: false,
			message: `Site directory not found: ${opts.site}\nBuild the site first (e.g. \`vite build\`), then re-run \`acrolls search-index\`.`
		};
	}
	if (!(await stat(siteAbs)).isDirectory()) {
		return { ok: false, message: `Not a directory: ${opts.site}` };
	}

	const pf = await loadPagefind(opts.pagefind);
	if (!pf) {
		return {
			ok: false,
			message:
				'Pagefind is not installed.\nAdd it as a dev dependency (`pnpm add -D pagefind`, or the npm/yarn/bun equivalent), then re-run.'
		};
	}

	const outputAbs = resolve(process.cwd(), opts.output ?? resolve(siteAbs, 'pagefind'));
	const glob = opts.glob ?? '**/*.{html}';
	const sitePath = forPagefind(siteAbs);
	const outputPath = forPagefind(outputAbs);

	const created = await pf.createIndex({ verbose: Boolean(opts.verbose) });
	if (created.errors?.length) return { ok: false, message: created.errors.join('\n') };
	const index = created.index;
	if (!index) return { ok: false, message: 'Pagefind did not return an index.' };

	try {
		const dirRes = await index.addDirectory({ path: sitePath, glob });
		if (dirRes.errors?.length) return { ok: false, message: dirRes.errors.join('\n') };
		const writeRes = await index.writeFiles({ outputPath });
		if (writeRes.errors?.length) return { ok: false, message: writeRes.errors.join('\n') };
		const writtenDir = writeRes.outputPath || outputPath;
		const pageCount = await readIndexedPageCount(writtenDir, dirRes.page_count);
		return {
			ok: true,
			pageCount,
			discovered: dirRes.page_count,
			outputPath: writtenDir,
			sitePath
		};
	} finally {
		// Always stop the Pagefind service so the CLI process can exit.
		await pf.close();
	}
}

export async function cmdSearchIndex(args: Args): Promise<number> {
	const site = String(args.flags.site ?? 'build');
	const output = args.flags.output !== undefined ? String(args.flags.output) : undefined;
	const glob = args.flags.glob !== undefined ? String(args.flags.glob) : undefined;
	const bundlePath = String(args.flags['bundle-path'] ?? '/pagefind/pagefind.js');
	const verbose = Boolean(args.flags.verbose);

	const result = await buildSearchIndex({ site, output, glob, verbose });
	if (!result.ok) {
		console.error(result.message);
		return 1;
	}
	const pages = `${result.pageCount} page${result.pageCount === 1 ? '' : 's'}`;
	const scanned =
		result.discovered === result.pageCount
			? ''
			: ` (${result.discovered} file${result.discovered === 1 ? '' : 's'} scanned)`;
	console.log(`Pagefind indexed ${pages} from ${result.sitePath}${scanned}`);
	console.log(`Bundle written to: ${result.outputPath}`);
	console.log(`DocsSearch loads it at: ${bundlePath}`);
	return 0;
}
