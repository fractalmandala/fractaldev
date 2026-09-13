import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createAcrollsSvelteKitMdsvexPreprocessor } from 'acrolls/sveltekit';
import { fileURLToPath } from 'node:url';

const docsArticleLayout = fileURLToPath(new URL('./src/lib/docs/DocsArticleLayout.svelte', import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		vitePreprocess(),
		createAcrollsSvelteKitMdsvexPreprocessor({
			layout: { _: docsArticleLayout },
			docs: { mode: 'authored' }
		})
	],
	kit: {
		adapter: adapter(),
		prerender: {
			// Real user corpora often contain relative links to pages outside the shipped
			// sample set. Do not fail the static build — warn and continue.
			handleHttpError: 'warn',
			handleMissingId: 'warn'
		}
	}
};

export default config;
