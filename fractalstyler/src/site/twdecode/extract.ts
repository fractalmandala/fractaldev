// twdecode/extract.ts — Pebble 1: point at component code, get Tailwind tokens.
// Site-only (src/site is never packaged). Pure functions, shared by client + server.

export interface ClassBlock {
	/** index of the class attribute in the pasted source */
	index: number;
	/** which syntax caught it: class / className / svelte:class / vue :class */
	attr: string;
	/** raw string inside the quotes */
	raw: string;
	/** individual tokens, in order, deduped per block */
	tokens: string[];
}

const ATTR_RE =
	/(?:class|className|:class|class:class)\s*=\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`|\{["'`]([^"'`]+)["'`]\})/g;

const CN_RE = /(?:cn|clsx|twMerge|cva)\(\s*([^)]+)\)/g;
const STR_RE = /["'`]([^"'`]+)["'`]/g;

/** Extract every class="..." / className="..." block from pasted component code. */
export function extractBlocks(code: string): ClassBlock[] {
	const blocks: ClassBlock[] = [];
	let m: RegExpExecArray | null;
	ATTR_RE.lastIndex = 0;
	while ((m = ATTR_RE.exec(code)) !== null) {
		const raw = m.slice(1).find(Boolean) ?? '';
		const attr = m[0].split('=')[0].trim();
		const tokens = tokenize(raw);
		if (tokens.length > 0) blocks.push({ index: blocks.length, attr, raw, tokens });
	}
	// cn("px-4", cond && "flex") style helpers — pick up string literals inside them
	CN_RE.lastIndex = 0;
	while ((m = CN_RE.exec(code)) !== null) {
		const inner = m[1];
		let s: RegExpExecArray | null;
		STR_RE.lastIndex = 0;
		while ((s = STR_RE.exec(inner)) !== null) {
			const raw = s[1];
			// skip non-class strings (heuristic: must contain a letter and - or : or be a known utility)
			if (!/[a-z]/i.test(raw) || raw.includes('${')) continue;
			const tokens = tokenize(raw);
			if (tokens.length > 0 && looksLikeClasses(raw)) {
				blocks.push({ index: blocks.length, attr: 'cn()', raw, tokens });
			}
		}
	}
	return blocks;
}

/** Split a class string into tokens. Keeps variants (hover:), negatives (-mt-2), arbitrary (p-[17px]). */
export function tokenize(raw: string): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const part of raw.split(/\s+/)) {
		const t = part.trim();
		if (!t || t.includes('${') || seen.has(t)) continue;
		seen.add(t);
		out.push(t);
	}
	return out;
}

/** All unique tokens across blocks, in first-seen order. */
export function uniqueTokens(blocks: ClassBlock[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const b of blocks)
		for (const t of b.tokens)
			if (!seen.has(t)) {
				seen.add(t);
				out.push(t);
			}
	return out;
}

/** Split `hover:bg-slate-700` -> { variant: 'hover', core: 'bg-slate-700' }. */
export function splitVariant(token: string): { variant: string | null; core: string } {
	const idx = token.lastIndexOf(':');
	if (idx <= 0 || token.startsWith('[')) return { variant: null, core: token };
	// arbitrary variants like [&>p]:mt-2 keep everything before last : as variant
	return { variant: token.slice(0, idx), core: token.slice(idx + 1) };
}

function looksLikeClasses(raw: string): boolean {
	// at least one token with a dash, colon, or known bare utility
	return raw
		.split(/\s+/)
		.some(
			(t) =>
				t.includes('-') ||
				t.includes(':') ||
				/^(flex|grid|block|hidden|relative|absolute|truncate|transition|border|shadow|ring|outline)$/.test(
					t
				)
		);
}
