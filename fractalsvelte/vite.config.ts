import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Pin the Vercel runtime — the local Node may be newer than the
			// adapter's auto-detected set (e.g. Homebrew node 26).
			adapter: adapter({ runtime: 'nodejs22.x' }),
			preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
			extensions: ['.svelte', '.svx', '.md']
		})
	]
});
