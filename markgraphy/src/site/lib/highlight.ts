// Shiki highlighting for the docs site. Server-only: imported from
// +page.server.ts loads and the vite config (mdsvex), never from client
// components — highlighted HTML is prerendered, so no JS ships to highlight.
// Theme colors are CSS variables, so the accent picker re-themes code the
// same way it re-themes graphs: fg for structure, muted for the base,
// the one accent for literals.

import { escapeSvelte } from 'mdsvex';
import { createHighlighter, type Highlighter, type ThemeRegistrationRaw } from 'shiki';

const ACCENT = 'var(--graph-accent, oklch(0.78 0.17 155))';
const MUTED = 'var(--text-secondary)';
const FG = 'var(--text-primary)';

export const codeTheme: ThemeRegistrationRaw = {
	name: 'markgraphy',
	type: 'dark',
	colors: {
		'editor.background': 'transparent',
		'editor.foreground': MUTED
	},
	settings: [
		{
			scope: ['comment'],
			settings: { foreground: 'color-mix(in oklab, var(--text-secondary) 65%, transparent)' }
		},
		{
			scope: ['string', 'constant.numeric', 'constant.language', 'constant.character.escape'],
			settings: { foreground: ACCENT }
		},
		{ scope: ['keyword', 'storage'], settings: { foreground: FG } },
		{ scope: ['entity.name.tag', 'support.class.component'], settings: { foreground: FG } },
		{ scope: ['entity.name.function', 'support.function'], settings: { foreground: FG } },
		{ scope: ['markup.heading'], settings: { foreground: FG, fontStyle: 'bold' } },
		{
			scope: ['entity.other.attribute-name', 'meta.property-name'],
			settings: { foreground: FG }
		}
	]
};

let singleton: Promise<Highlighter> | undefined;

function getHighlighter() {
	singleton ??= createHighlighter({
		themes: [codeTheme],
		langs: ['svelte', 'typescript', 'bash', 'css', 'json', 'markdown']
	});
	return singleton;
}

/** Highlighted HTML for a code string. Falls back to plain text on unknown languages. */
export async function highlight(code: string, lang = 'svelte'): Promise<string> {
	const highlighter = await getHighlighter();
	try {
		return highlighter.codeToHtml(code, { lang, theme: 'markgraphy' });
	} catch {
		return highlighter.codeToHtml(code, { lang: 'text', theme: 'markgraphy' });
	}
}

/** Escape a string for safe embedding inside a double-quoted HTML attribute. */
function escapeAttr(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Wrap Shiki output with a copyable box styled like the examples page:
 * a header row showing the language and a "copy" button that writes the
 * raw code (not the highlighted HTML) to the clipboard. The button uses
 * event delegation (wired up once in docs/+layout.svelte) — no inline JS,
 * no CSP headaches.
 */
function wrapWithCopy(shikiHtml: string, code: string, lang: string): string {
	const label = lang === 'svelte' ? 'copy svelte' : `copy ${lang}`;
	return (
		`<div class="code-block" data-code="${escapeAttr(code)}">` +
		`<header class="code-block-head">` +
		`<span class="code-block-lang">${escapeAttr(lang || 'text')}</span>` +
		`<button type="button" class="code-block-copy" data-label="${escapeAttr(label)}" aria-label="${escapeAttr(label)}">` +
		`<span class="code-block-copy-state">${escapeAttr(label)}</span>` +
		`</button></header>` +
		`<div class="code-block-body">${shikiHtml}</div>` +
		`</div>`
	);
}

/** mdsvex `highlight.highlighter`: returns the string injected into the document. */
export async function mdsvexHighlighter(code: string, lang: string | null = ''): Promise<string> {
	const language = lang?.trim() ? lang.trim().toLowerCase() : 'text';
	const html = await highlight(code, language);
	const wrapped = wrapWithCopy(html, code, language);
	return `{@html \`${escapeSvelte(wrapped)}\`}`;
}
