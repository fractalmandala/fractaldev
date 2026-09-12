/** Shared path normalize. */
export function normalizePath(path: string): string {
	if (!path) return '/';
	const bare = path.split('#')[0]!.split('?')[0]!;
	if (bare.length > 1 && bare.endsWith('/')) return bare.slice(0, -1);
	return bare || '/';
}

function normalizeSlug(value: string): string {
	return value
		// camelCase word boundaries survive slugging: 'packageA' → 'package-a', never 'packagea'.
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Slugify for storage keys and bounded public-facing auto ids. */
export function slugify(value: string): string {
	return normalizeSlug(value).slice(0, 64);
}

/** Full-length deterministic identity for navigation nodes and persistence keys. */
export function stableId(value: string): string {
	const normalized = value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '');
	const identity = [...normalized]
		.map((character) => /[a-z0-9]/.test(character)
			? character
			: `-${character.codePointAt(0)!.toString(36)}-`)
		.join('');
	return identity || 'item';
}
