import type { Scheme } from './scheme-types';
import { parseSchemeFrontmatter } from './scheme-parser';

/**
 * Eager registry of every `designs/*.md` scheme. Static glob = all files
 * bundled at build — the /demos page stays fully prerenderable (the project
 * sets `export const prerender = true`).
 */

const modules = import.meta.glob('./designs/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export const SCHEMES: Scheme[] = Object.entries(modules)
	.map(([path, raw]) => {
		const id = path
			.split('/')
			.pop()
			?.replace(/\.md$/, '');
		return parseSchemeFrontmatter(raw, id ?? path);
	})
	.sort((a, b) => a.name.localeCompare(b.name));

/** Convenience lookup. */
export function schemeById(id: string): Scheme | undefined {
	return SCHEMES.find((s) => s.id === id);
}
