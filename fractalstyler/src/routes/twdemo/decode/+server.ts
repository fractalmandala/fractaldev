// POST /twdemo/decode — v1 Tailwind decoder. Real Tailwind v4 compiler, default theme
// plus optional project `@theme` CSS for custom tokens (shadcn colors, custom animations).
// Body: { code: string, themeCss?: string } -> { blocks, tokens, summary, meta }
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { compile } from 'tailwindcss';
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import { extractBlocks, uniqueTokens, splitVariant } from '$site/twdecode/extract';
import { categorize } from '$site/twdecode/categories';
import { suggestFractal, spacingPx } from '$site/twdecode/fractal-map';

const MAX_CODE = 60_000;
const MAX_THEME = 20_000;
const MAX_TOKENS = 250;

const compilers = new Map<string, Promise<{ build: (candidates: string[]) => string }>>();

function getCompiler(themeCss: string) {
	const hit = compilers.get(themeCss);
	if (hit) return hit;
	const pending = (async () => {
		const base = process.cwd();
		const loadStylesheet = async (id: string, b: string) => {
			const p =
				id === 'tailwindcss'
					? path.join(base, 'node_modules', 'tailwindcss', 'index.css')
					: path.resolve(b, id);
			return { path: p, base: path.dirname(p), content: fs.readFileSync(p, 'utf8') };
		};
		const loadModule = async (id: string, b: string) => ({ path: id, base: b, module: {} });
		const { build } = await compile(`@import "tailwindcss";\n${themeCss}`, {
			base,
			loadStylesheet,
			loadModule
		});
		return { build: build as (candidates: string[]) => string };
	})();
	// bound the cache: distinct theme pastes shouldn't grow memory unbounded
	if (compilers.size >= 10) compilers.delete(compilers.keys().next().value as string);
	compilers.set(themeCss, pending);
	return pending;
}

/**
 * Normalised selector match. Tailwind appends things after the escaped token:
 * - pseudo: `.hover\:shadow-md:hover` for `hover:shadow-md`
 * - attribute: `.data-open\:animate-in[data-open]`
 * - descendant: `.\[\&_a\]\:underline a`
 * - :is() wrapping for `*`/`**` variants: `:is(.focus\:\*\*\:underline:focus *)`
 * The token must appear dot-prefixed with a boundary after it; a `-` after means
 * a LONGER utility (border vs border-slate-200) → reject that occurrence.
 */
function selectorMatchesToken(selector: string, token: string): boolean {
	for (const part of selector.split(',')) {
		const s = part.trim().replace(/\\/g, '');
		const needle = '.' + token;
		let i = -1;
		while ((i = s.indexOf(needle, i + 1)) !== -1) {
			const next = s[i + needle.length] ?? '';
			if ([':', ' ', '[', '.', '>', '+', '~', ')', ',', ''].includes(next)) return true;
		}
	}
	return false;
}

export const POST: RequestHandler = async ({ request }) => {
	let code = '';
	let themeCss = '';
	try {
		const body = await request.json();
		code = typeof body?.code === 'string' ? body.code : '';
		themeCss = typeof body?.themeCss === 'string' ? body.themeCss.trim() : '';
	} catch {
		return json({ error: 'Expected JSON body { code: string }.' }, { status: 400 });
	}
	if (!code.trim()) return json({ error: 'Paste component code first.' }, { status: 400 });
	if (code.length > MAX_CODE)
		return json(
			{ error: `Code too long (${code.length} chars, max ${MAX_CODE}).` },
			{ status: 413 }
		);
	if (themeCss.length > MAX_THEME)
		return json(
			{ error: `Theme CSS too long (${themeCss.length} chars, max ${MAX_THEME}).` },
			{ status: 413 }
		);

	const blocks = extractBlocks(code);
	if (blocks.length === 0)
		return json(
			{ error: 'No class="..." / className="..." strings found. Paste JSX, Vue, Svelte or HTML.' },
			{ status: 422 }
		);
	const all = uniqueTokens(blocks).slice(0, MAX_TOKENS);

	let css = '';
	let themed = false;
	try {
		const { build } = await getCompiler(themeCss);
		css = build(all);
		themed = themeCss.length > 0;
	} catch (e) {
		return json({ error: `Tailwind compile failed: ${(e as Error).message}` }, { status: 500 });
	}

	// selector -> declarations. Tailwind nests the real value inside
	// `@supports (color: color-mix(...))` with a plain-var fallback outside
	// (opacity modifiers on theme colors). The supports branch wins in modern
	// browsers, so merge it over the fallback.
	const declText = (nodes: unknown) =>
		((nodes as Array<{ type: string; prop: string; value: string }> | undefined) ?? [])
			.filter((n) => n.type === 'decl')
			.map((n) => `${n.prop}: ${n.value}`)
			.join('; ');
	const mergeDecls = (base: string, over: string) => {
		const map = new Map<string, string>();
		for (const d of base.split('; ').filter(Boolean)) {
			const i = d.indexOf(': ');
			if (i > 0) map.set(d.slice(0, i), d.slice(i + 2));
		}
		for (const d of over.split('; ').filter(Boolean)) {
			const i = d.indexOf(': ');
			if (i > 0) map.set(d.slice(0, i), d.slice(i + 2));
		}
		return [...map.entries()].map(([k, v]) => `${k}: ${v}`).join('; ');
	};
	const rules: Array<{ selector: string; decls: string; fallback: string | null }> = [];
	const root = postcss.parse(css);
	root.walkRules((rule) => {
		if (!rule.selector) return;
		const base = declText(
			(rule.nodes ?? []).filter((n) => (n as { type: string }).type !== 'atrule')
		);
		let over = '';
		for (const n of (rule.nodes ?? []) as Array<{ type: string; name?: string; nodes?: unknown }>) {
			if (n.type === 'atrule' && n.name === 'supports') over = declText(n.nodes);
		}
		if (!base && !over) return;
		rules.push({
			selector: rule.selector,
			decls: over ? mergeDecls(base, over) : base,
			fallback: over && over !== base ? base || null : null
		});
	});

	const tokens = all.map((token) => {
		const { variant, core } = splitVariant(token);
		const hit = rules.find((r) => selectorMatchesToken(r.selector, token));
		const px = spacingPx(core);
		const human = hit
			? (px !== null ? `${hit.decls}  /* ≈ ${px}px */` : hit.decls) +
				(hit.fallback ? `  /* pre-color-mix fallback: ${hit.fallback} */` : '')
			: null;
		return {
			token,
			variant,
			core,
			css: hit?.decls ?? null,
			px,
			human,
			category: variant && !hit ? 'State' : categorize(core),
			fractal: suggestFractal(core),
			unknown: !hit
		};
	});

	const summary: Record<string, string[]> = {};
	for (const t of tokens) {
		(summary[t.category] ??= []).push(t.token);
	}

	return json({
		blocks: blocks.map((b) => ({ attr: b.attr, raw: b.raw, tokens: b.tokens })),
		tokens,
		summary,
		meta: {
			tailwind: themed ? 'v4 + pasted @theme' : 'v4 default theme',
			themed,
			blockCount: blocks.length,
			tokenCount: tokens.length,
			unknownCount: tokens.filter((t) => t.unknown).length,
			truncated: uniqueTokens(blocks).length > MAX_TOKENS
		}
	});
};
