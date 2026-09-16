import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

export default defineConfig({
	// Keep routine 200/304 request lines quiet; warnings and errors remain visible.
	logLevel: 'warn',
	resolve: {
		dedupe: ['svelte'],
		// Demo code examples refer to the published package name. Map those back
		// to the local source so the docs app can run before anything is published.
		alias: {
			'fractalsvelte/components': '/src/lib/components/index.ts',
			'fractalsvelte/ported': '/src/lib/ported/index.ts',
			'fractalsvelte/styles/system': '/styles/system.sass',
			'fractalsvelte/styles/global': '/styles/global.sass',
			'fractalsvelte/styles': '/src/lib/styles/index.ts',
			fractalsvelte: '/src/lib/index.ts'
		}
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
