import type { PreprocessorGroup } from 'svelte/compiler';

/**
 * mdsvex 0.12.8 emits frontmatter as `<script context="module">`, which Svelte 5
 * deprecated in favour of the `module` attribute (script_context_deprecated) —
 * so every .svx with frontmatter warns, through no fault of the source file.
 *
 * Runs AFTER mdsvex in the preprocess array and rewrites that tag. Drop this
 * once mdsvex emits the modern attribute itself.
 */
export function mdsvexModuleScript(): PreprocessorGroup {
	return {
		name: 'mdsvex-module-script',
		markup({ content, filename }) {
			if (!filename || !/\.(svx|md)$/.test(filename)) return;
			if (!content.includes('<script context="module">')) return;
			return { code: content.replaceAll('<script context="module">', '<script module>') };
		}
	};
}
