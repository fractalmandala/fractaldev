import { createHighlighter } from 'shiki';

const themes = {
	light: 'github-light',
	dark: 'github-dark'
} as const;

const languageAliases: Record<string, string> = {
	sh: 'bash',
	shell: 'bash',
	shellscript: 'bash',
	ts: 'typescript',
	js: 'javascript',
	jsx: 'javascript',
	scss: 'css',
	md: 'markdown',
	text: 'text',
	plaintext: 'text'
};

const supportedLanguages = new Set(['svelte', 'typescript', 'javascript', 'sass', 'css', 'bash', 'html', 'markdown', 'json', 'yaml']);
const highlighterPromise = createHighlighter({
	themes: Object.values(themes),
	langs: [...supportedLanguages]
});
const cache = new Map<string, string>();

function escapeHtml(value: string) {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function normalizeLanguage(language: string) {
	const name = language.trim().toLowerCase().split(/\s+/)[0] ?? 'text';
	return languageAliases[name] ?? name;
}

function fallback(code: string, language: string) {
	return `<pre class="code-block" data-language="${escapeHtml(language)}" tabindex="0"><code>${escapeHtml(code)}</code></pre>`;
}

export async function highlightCode(code: string, language = 'text') {
	const normalized = normalizeLanguage(language);
	const key = `${normalized}\u0000${code}`;
	const existing = cache.get(key);
	if (existing) return existing;
	if (!supportedLanguages.has(normalized)) return fallback(code, normalized);

	try {
		const highlighter = await highlighterPromise;
		const html = highlighter.codeToHtml(code, {
			lang: normalized,
			themes,
			defaultColor: false
		});
		const result = html.replace('<pre ', `<pre data-language="${normalized}" `);
		cache.set(key, result);
		return result;
	} catch {
		return fallback(code, normalized);
	}
}
