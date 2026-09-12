import { fileURLToPath } from 'node:url';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { createAcrollsSvelteKitMdsvexPreprocessor } from 'acrolls/sveltekit';
import { NodePackageImporter } from 'sass';
import { defineConfig } from 'vite';

// Temporary UI composition playset (root src/ + docs/playset) — dev server only.
// Nothing here is built or published: the umbrella pack root is packages/acrolls/,
// whose `files` allowlist (bin, exports, styles, README, LICENSE) cannot see the root.

// Dev-only: resolve the @acrolls/* leaf packages to their source instead of built
// dist/, so edits under packages/*/src hot-reload here with no rebuild step.
const src = (rel: string) => fileURLToPath(new URL(`./packages/${rel}`, import.meta.url));

const devSourceAliases = [
	{ find: /^@acrolls\/svelte$/, replacement: src('svelte/src/lib/index.ts') },
	{ find: /^@acrolls\/docs$/, replacement: src('docs/src/lib/index.ts') },
	{ find: /^@acrolls\/docs\/content$/, replacement: src('docs/src/lib/content.ts') },
	{ find: /^@acrolls\/docs\/collection$/, replacement: src('docs/src/lib/collection.ts') },
	{ find: /^@acrolls\/sveltekit$/, replacement: src('sveltekit/src/index.ts') },
	{ find: /^@acrolls\/sveltekit\/content$/, replacement: src('sveltekit/src/content.ts') },
	{ find: /^@acrolls\/mdsvex$/, replacement: src('mdsvex/src/index.ts') }
];

export default defineConfig(({ command }) => ({
	// Never fail on a busy port — take the next free one.
	server: { strictPort: false },
	resolve: {
		alias: command === 'serve' ? devSourceAliases : []
	},
	css: {
		preprocessorOptions: {
			// Resolves `pkg:` URLs if any stylesheet or a future theme surface uses them.
			sass: { importers: [new NodePackageImporter()] }
		}
	},
	plugins: [
		sveltekit({
			extensions: ['.svelte', '.svx', '.md'],
			preprocess: [vitePreprocess(), createAcrollsSvelteKitMdsvexPreprocessor({})]
		})
	]
}));
