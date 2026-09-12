import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvexHighlighter } from './src/lib/utils/mdsvex-highlight.js';
import { mdsvexModuleScript } from './src/lib/utils/mdsvex-module-script.js';

export default defineConfig({
	// Exactly one svelte exists on disk, but Vite's optimiser was emitting the
	// runtime into more than one dep chunk. The hydration cursor is module-level
	// state, so two instances desync and fractalicons' Icon dies on
	// `get_first_child(undefined)`. Pin every import to the same copy.
	resolve: {
		dedupe: ['svelte']
	},
	plugins: [
		// Used-only delivery: compiles the full vocabulary internally, then serves
		// ONLY the selectors found in `content`. styleEntry is REQUIRED here —
		// builder.ts resolves its default entry relative to its own file, and it
		// lives in utils/, not beside index.sass.
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			alias: {
				$site: 'src/site'
			},
			preprocess: [
				mdsvex({
					extensions: ['.svx', '.md'],
					highlight: { highlighter: mdsvexHighlighter }
				}),
				mdsvexModuleScript(),
				vitePreprocess()
			],
			extensions: ['.svelte', '.svx', '.md']
		})
	]
});
