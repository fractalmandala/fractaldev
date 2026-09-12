// Build-time only: imported by vite.config.ts, never by a component.
// mdsvex hands every fenced code block here during preprocessing; we return
// the highlighted frame as a string that mdsvex injects into the compiled
// component. Copy is wired once, by delegation, in routes/docs/+layout.svelte.

import { escapeSvelte } from 'mdsvex';
import { highlight, normalizeLang } from './shiki.server.js';

/** Escape a string for safe embedding inside a double-quoted HTML attribute. */
function attr(s: string) {
	return s
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

export async function mdsvexHighlighter(code: string, lang: string | null = '') {
	const language = normalizeLang(lang);
	const shiki = await highlight(code, language);

	const frame =
		`<figure class="code-frame" data-code="${attr(code)}">` +
		`<figcaption class="code-frame__head">` +
		`<span class="code-frame__title">${attr(language)}</span>` +
		`<button type="button" class="code-frame__copy" aria-label="Copy code">` +
		`<span aria-hidden="true">copy</span></button>` +
		`</figcaption>` +
		`<div class="code-frame__body">${shiki}</div></figure>`;

	// escapeSvelte neutralises { } and backticks inside the highlighted HTML;
	// {@html} re-emits it verbatim.
	return `{@html \`${escapeSvelte(frame)}\`}`;
}
