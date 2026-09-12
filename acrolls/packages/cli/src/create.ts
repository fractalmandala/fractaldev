import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { dirname, resolve, relative, join } from 'node:path';
import { exists } from './util.js';
import type { Args } from './util.js';
import {
	scaffoldFiles,
	deriveName,
	deriveTitle,
	packageManagerCommands,
	type PackageManager,
	type ScaffoldFile,
	type ScaffoldOptions
} from './scaffold.js';

/**
 * `acrolls create` — scaffold a minimal, pre-wired Acrolls SvelteKit docs project.
 *
 * Separation of concerns: `scaffold.ts` owns the file templates (pure, unit-testable); this module
 * owns the filesystem orchestration and the CLI surface. Safety follows the create-* convention the
 * other commands share — a populated target directory is refused unless `--force`, so a scaffold can
 * never silently mix with an unrelated project. `--dry-run` reports the tree without touching disk.
 *
 * The scaffold is deliberately minimal and CSS-first (no preprocessor, no theme coupling): a root
 * landing route, a `<base-href>` docs route driven by `DocsShell`, a single-corpus `source.ts`, and
 * four warning-free starter Markdown files. It mirrors the verified `examples/kit-consumer` host.
 */

// The umbrella package injects the published version; direct workspace runs keep the fallback.
const VERSION = process.env.ACROLLS_VERSION ?? '0.8.0';

const PACKAGE_MANAGERS: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

export type CreateOptions = {
	/** Target directory, resolved against cwd. Scaffolded if it does not exist. */
	dir: string;
	/** npm package name; derived from the directory when omitted. */
	name?: string;
	/** Human-facing site/docs title; humanized from the name when omitted. */
	title?: string;
	/** Public docs base href, e.g. `/docs`; normalized and defaulted to `/docs`. */
	baseHref?: string;
	/** Base style preset imported by the root layout. */
	mode?: 'foundation' | 'default';
	/** Package manager used for the printed next steps and the README. */
	packageManager?: PackageManager;
	/** Range for the `acrolls` dependency; defaults to the running CLI version. */
	acrollsVersion?: string;
	/** Scaffold into a non-empty directory, overwriting colliding files. */
	force?: boolean;
	/** Report the tree without writing anything. */
	dryRun?: boolean;
};

export type CreateResult =
	| {
			ok: true;
			dir: string;
			files: ScaffoldFile[];
			written: string[];
			nextSteps: string[];
			dryRun: boolean;
	  }
	| { ok: false; message: string };

/** `docs` → `/docs`; `/docs/` → `/docs`; empty/`/` → `/docs`. */
export function normalizeBaseHref(input: string): string {
	const trimmed = input.trim();
	const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
	const noTrailing = withLeading.replace(/\/+$/, '');
	return noTrailing || '/docs';
}

function rel(root: string, abs: string): string {
	const r = relative(root, abs);
	if (!r) return '.';
	// A target outside cwd would render as a `../../..` chain — show the absolute path instead.
	return r.startsWith('..') ? abs : r;
}

async function isNonEmptyDir(dir: string): Promise<boolean> {
	if (!(await exists(dir))) return false;
	const entries = await readdir(dir);
	return entries.length > 0;
}

/**
 * Resolve options, generate the file tree, and (unless `dryRun`) write it. Pure enough to unit-test
 * against a temp cwd: every path is derived from `process.cwd()` and the resolved options.
 */
export async function generateScaffold(opts: CreateOptions): Promise<CreateResult> {
	const root = process.cwd();
	const absDir = resolve(root, opts.dir);
	const force = Boolean(opts.force);
	const dryRun = Boolean(opts.dryRun);

	const baseHref = normalizeBaseHref(opts.baseHref ?? '/docs');
	const name = deriveName(opts.name ?? opts.dir);
	const title = opts.title?.trim() || deriveTitle(name);
	const packageManager = opts.packageManager ?? 'npm';

	const scaffoldOpts: ScaffoldOptions = {
		name,
		title,
		baseHref,
		mode: opts.mode ?? 'default',
		packageManager,
		acrollsVersion: opts.acrollsVersion ?? VERSION
	};
	const files = scaffoldFiles(scaffoldOpts);

	// Refuse a populated directory unless forced — never scatter scaffold files into an existing
	// project. An empty or missing directory is always safe to write into.
	if (!force && (await isNonEmptyDir(absDir))) {
		return {
			ok: false,
			message:
				`Target directory is not empty: ${rel(root, absDir)}\n` +
				'Re-run with --force to scaffold into it anyway (colliding files are overwritten).'
		};
	}

	const written: string[] = [];
	for (const file of files) {
		const target = join(absDir, file.path);
		if (!dryRun) {
			await mkdir(dirname(target), { recursive: true });
			await writeFile(target, file.contents, 'utf8');
		}
		written.push(file.path);
	}

	const cmds = packageManagerCommands(packageManager);
	const label = rel(root, absDir);
	const nextSteps = [`cd ${label}`, cmds.install, cmds.dev, '', `Build the site + search index: ${cmds.build}`];

	return { ok: true, dir: label, files, written, nextSteps, dryRun };
}

export async function cmdCreate(args: Args): Promise<number> {
	const dir = args._[1];
	if (!dir) {
		console.error(
			'Usage: acrolls create <dir> [--name <pkg>] [--title <name>] [--base-href <path>] [--mode foundation|default] [--package-manager npm|pnpm|yarn|bun] [--force] [--dry-run]'
		);
		return 2;
	}

	const modeFlag = args.flags.mode !== undefined ? String(args.flags.mode) : undefined;
	if (modeFlag !== undefined && modeFlag !== 'foundation' && modeFlag !== 'default') {
		console.error('Invalid --mode. Use foundation or default.');
		return 2;
	}

	const pmFlag =
		args.flags['package-manager'] !== undefined ? String(args.flags['package-manager']) : undefined;
	if (pmFlag !== undefined && !PACKAGE_MANAGERS.includes(pmFlag as PackageManager)) {
		console.error(`Invalid --package-manager. Use ${PACKAGE_MANAGERS.join(', ')}.`);
		return 2;
	}

	const dryRun = Boolean(args.flags['dry-run']);
	const result = await generateScaffold({
		dir,
		name: args.flags.name !== undefined ? String(args.flags.name) : undefined,
		title: args.flags.title !== undefined ? String(args.flags.title) : undefined,
		baseHref: args.flags['base-href'] !== undefined ? String(args.flags['base-href']) : undefined,
		mode: modeFlag as 'foundation' | 'default' | undefined,
		packageManager: pmFlag as PackageManager | undefined,
		force: Boolean(args.flags.force),
		dryRun
	});

	if (!result.ok) {
		console.error(result.message);
		return 1;
	}

	const prefix = dryRun ? '[dry-run] ' : '';
	for (const path of result.written) console.log(`${prefix}${path}`);

	const noun = `${result.written.length} file${result.written.length === 1 ? '' : 's'}`;
	if (dryRun) {
		console.log(`[dry-run] would scaffold ${noun} into ${result.dir}`);
		return 0;
	}

	console.log(`\nScaffolded ${noun} into ${result.dir}`);
	console.log('\nNext steps:');
	for (const step of result.nextSteps) console.log(step ? `  ${step}` : '');
	return 0;
}
