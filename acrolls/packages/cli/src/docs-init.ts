import { mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { exists } from './util.js';
import type { Args } from './util.js';
import { DOCS_STARTER_INDEX_MD } from './starter.js';

/**
 * `acrolls docs init` (P10, scoped by D7) — seed the docs corpus with a starter `index.md`.
 * Content only, per the D7 decision: `integrate` wires the host machine and `onboard` provides
 * the guidance, so this command writes nothing else. Writes are explicit and an existing
 * `index.md` is never overwritten.
 */
export async function cmdDocsInit(args: Args): Promise<number> {
	const dry = Boolean(args.flags['dry-run']);
	const docsDir = String(args.flags['docs-dir'] ?? 'docs');
	const root = process.cwd();
	const abs = resolve(root, docsDir);
	const index = resolve(abs, 'index.md');
	const display = relative(root, index) || 'index.md';

	if (await exists(index)) {
		console.log(`Already present, left untouched: ${display}`);
		console.log('Delete it first if you want the starter regenerated.');
		return 0;
	}

	if (dry) {
		console.log(`[dry-run] would create ${display}`);
		return 0;
	}

	await mkdir(abs, { recursive: true });
	await writeFile(index, DOCS_STARTER_INDEX_MD, 'utf8');
	console.log(`Created docs starter: ${display}`);
	console.log('Next: run `acrolls onboard` to wire the routes, source, and shell around it.');
	return 0;
}
