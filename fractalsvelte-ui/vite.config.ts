import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

export default defineConfig({
	resolve: {
		dedupe: ['svelte'],
		alias: {
			'fractalsvelte/components': '/src/lib/components/index.ts',
			'fractalsvelte/ported': '/src/lib/ported/index.ts',
			'fractalsvelte/styles': '/src/lib/styles/index.ts',
			fractalsvelte: '/src/lib/index.ts',
			$site: 'src/site'
		}
	},
	ssr: {
		noExternal: ['@humanspeak/svelte-motion']
	},
	plugins: [
		sveltekit({
			extensions: ['.svelte', '.svx', '.md'],
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			preprocess: [
				mdsvex({ extensions: ['.svx', '.md'] }),
				vitePreprocess()
			]
		})
	]
});
