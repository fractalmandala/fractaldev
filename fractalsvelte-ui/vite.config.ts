import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

export default defineConfig({
	// Keep routine 200/304 request lines quiet; warnings and errors remain visible.
	logLevel: 'warn',
	resolve: {
		dedupe: ['svelte']
	},
	ssr: {
		noExternal: ['@humanspeak/svelte-motion']
	},
	plugins: [
		sveltekit({
			adapter: adapter(),
			// Ported-component docs pages are authored as .svx (markdown + live
			// components). No svelte.config file — Kit 3 owns config here.
			extensions: ['.svelte', '.svx'],
			preprocess: [mdsvex({ extensions: ['.svx'] })]
		})
	]
});
