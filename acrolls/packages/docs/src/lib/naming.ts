/**
 * Filename naming conventions — how a raw path segment encodes a clean slug and its sibling order.
 *
 * A convention is a small strategy object the content engine applies to every path segment: it maps
 * `02-install` → `{ slug: 'install', order: 2 }`, so URLs and titles stay clean while ordering comes
 * from the filename with no per-file frontmatter. `numbered()` (the `NN-` prefix) and `dated()` (a
 * `YYYY-MM-DD` blog prefix) ship; a host can pass its own. `verify()` checks a directory's siblings
 * and returns messages the engine surfaces as build diagnostics.
 */

/** One path segment resolved by a convention: its clean slug and, when encoded, its sibling order. */
export type DocsSegment = {
	slug: string;
	order?: number;
};

/** A pluggable filename convention. Passed to the engine as `config.naming`. */
export type DocsNamingConvention = {
	/** Map one raw segment (a directory name or a filename stem) to its slug and optional order. */
	segment(raw: string): DocsSegment;
	/**
	 * Verify one directory's raw sibling segments (as authored). Returned strings become named build
	 * diagnostics. `dir` is the clean directory path (`''` for the root).
	 */
	verify?(dir: string, segments: readonly string[]): string[];
};

/**
 * A convention that implements sibling verification. The built-in conventions return this
 * stronger type while custom host conventions may still omit `verify()`.
 */
export type VerifiedDocsNamingConvention = DocsNamingConvention & {
	verify(dir: string, segments: readonly string[]): string[];
};

/** The default convention: segments pass through untouched, nothing ordered. Preserves legacy behavior. */
export const passthroughNaming: DocsNamingConvention = {
	segment: (raw) => ({ slug: raw })
};

const NUMBER_PREFIX = /^(\d+)-(.*)$/;

export type NumberedOptions = {
	/**
	 * How to treat two siblings sharing a prefix number (`21-a`, `21-b`). `'error'` (default) fails,
	 * since a duplicate is usually a mistake; `'allow'` treats the prefix as a deliberate group key.
	 */
	duplicates?: 'error' | 'allow';
};

/**
 * The `NN-` convention: a leading `01-` orders siblings and is stripped from the slug and title.
 * `03-routing` → `{ slug: 'routing', order: 3 }`, sorted third, served at `/routing`. Its `verify`
 * flags a directory that mixes prefixed and unprefixed siblings, or repeats a prefix number.
 */
export function numbered(options: NumberedOptions = {}): VerifiedDocsNamingConvention {
	return {
		segment(raw) {
			const match = NUMBER_PREFIX.exec(raw);
			if (!match) return { slug: raw };
			return { slug: match[2] || raw, order: Number(match[1]) };
		},
		verify(dir, segments) {
			const where = dir || '(root)';
			const prefixed = segments.filter((segment) => NUMBER_PREFIX.test(segment));
			// A directory with no numbered children simply isn't using the convention — that's fine.
			if (prefixed.length === 0) return [];

			const issues: string[] = [];
			const bare = segments.filter((segment) => !NUMBER_PREFIX.test(segment));
			if (bare.length > 0) {
				const sample = bare.slice(0, 4).join(', ');
				issues.push(
					`ordering in ${where}: mixed prefixed and unprefixed siblings — prefix ${sample}${bare.length > 4 ? ', …' : ''}`
				);
			}

			if (options.duplicates !== 'allow') {
				const numbers = prefixed.map((segment) => Number(NUMBER_PREFIX.exec(segment)![1]));
				const seen = new Set<number>();
				const duplicates = new Set<number>();
				for (const value of numbers) {
					if (seen.has(value)) duplicates.add(value);
					seen.add(value);
				}
				if (duplicates.size > 0) {
					issues.push(
						`ordering in ${where}: duplicate prefix number${duplicates.size > 1 ? 's' : ''} ${[...duplicates].sort((a, b) => a - b).join(', ')} — pass numbered({ duplicates: 'allow' }) if intentional`
					);
				}
			}

			return issues;
		}
	};
}

export type DatedOptions = {
	/** Date-prefix format built from `YYYY`/`MM`/`DD` plus literal separators. Default `YYYY-MM-DD`. */
	format?: string;
};

/**
 * The dated convention: a `YYYY-MM-DD-` prefix orders siblings chronologically (order = days since
 * the epoch, so oldest sorts first — a blog index reverses it) and is stripped from the slug, so a
 * post lives at `/release`, not `/2026-08-13-release`. Undated siblings pass through unordered.
 * Recover the date for display with {@link dateOf} on the entry's source key.
 */
export function dated(options: DatedOptions = {}): VerifiedDocsNamingConvention {
	const format = options.format ?? 'YYYY-MM-DD';
	const { matcher } = compileDateFormat(format);
	return {
		segment(raw) {
			const parts = parseDatePrefix(raw, format);
			if (!parts) return { slug: raw };
			return {
				slug: parts.rest || raw,
				order: Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 86_400_000)
			};
		},
		verify(dir, segments) {
			const where = dir || '(root)';
			const issues: string[] = [];
			for (const segment of segments) {
				// A segment that looks dated but parses to an impossible date is a real mistake.
				if (matcher.test(segment) && !parseDatePrefix(segment, format)) {
					issues.push(`dated ordering in ${where}: '${segment}' has an impossible date prefix`);
				}
			}
			return issues;
		}
	};
}

/** Read the date prefix off a segment as ISO `YYYY-MM-DD`, or `null` when it is not date-prefixed. */
export function dateOf(segment: string, format = 'YYYY-MM-DD'): string | null {
	const parts = parseDatePrefix(segment, format);
	if (!parts) return null;
	const pad = (value: number, width: number) => String(value).padStart(width, '0');
	return `${pad(parts.year, 4)}-${pad(parts.month, 2)}-${pad(parts.day, 2)}`;
}

type CompiledDateFormat = { pattern: RegExp; matcher: RegExp; order: Array<'Y' | 'M' | 'D'> };

const compiledFormats = new Map<string, CompiledDateFormat>();

function compileDateFormat(format: string): CompiledDateFormat {
	const cached = compiledFormats.get(format);
	if (cached) return cached;

	let source = '';
	const order: Array<'Y' | 'M' | 'D'> = [];
	for (let index = 0; index < format.length; ) {
		if (format.startsWith('YYYY', index)) {
			source += '(\\d{4})';
			order.push('Y');
			index += 4;
		} else if (format.startsWith('MM', index)) {
			source += '(\\d{2})';
			order.push('M');
			index += 2;
		} else if (format.startsWith('DD', index)) {
			source += '(\\d{2})';
			order.push('D');
			index += 2;
		} else {
			source += format[index].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			index += 1;
		}
	}
	if (order.length !== 3 || !(order.includes('Y') && order.includes('M') && order.includes('D'))) {
		throw new Error(`[acrolls] dated(): format '${format}' must contain YYYY, MM and DD exactly once`);
	}

	const compiled: CompiledDateFormat = {
		pattern: new RegExp(`^${source}-(.+)$`),
		matcher: new RegExp(`^${source}-`),
		order
	};
	compiledFormats.set(format, compiled);
	return compiled;
}

function parseDatePrefix(
	segment: string,
	format: string
): { year: number; month: number; day: number; rest: string } | null {
	const { pattern, order } = compileDateFormat(format);
	const match = pattern.exec(segment);
	if (!match) return null;
	const parts = { Y: 0, M: 0, D: 0 };
	order.forEach((key, index) => (parts[key] = Number(match[index + 1])));
	if (parts.M < 1 || parts.M > 12 || parts.D < 1 || parts.D > 31) return null;
	return { year: parts.Y, month: parts.M, day: parts.D, rest: match[order.length + 1] };
}
