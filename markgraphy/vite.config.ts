import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { mdsvexHighlighter } from './src/site/lib/highlight.ts';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			// SvelteKit options
			adapter: adapter({ runtime: 'nodejs22.x' }),
			alias: {
				$site: 'src/site'
			},
			// Treat .svx (mdsvex) files as Svelte components so imports of
			// .svx pages are compiled by the same pipeline as .svelte files.
			extensions: ['.svelte', '.svx', '.md'],
			// vite-plugin-svelte options
			// Build-time shiki highlighting for fenced code in .svx markdown.
			preprocess: [mdsvex({ extensions: ['.svx', '.md'], highlight: { highlighter: mdsvexHighlighter } })],
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			}
		})
	]
});
