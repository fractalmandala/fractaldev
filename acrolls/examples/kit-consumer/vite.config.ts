import adapter from '@sveltejs/adapter-static';
import { fileURLToPath } from 'node:url';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { createAcrollsSvelteKitMdsvexPreprocessor } from 'acrolls/sveltekit';
import { NodePackageImporter } from 'sass';
import { defineConfig } from 'vite';

const docsArticleLayout = fileURLToPath(new URL('./src/lib/docs/DocsArticleLayout.svelte', import.meta.url));

// Dev-only: resolve the `@acrolls/*` leaf packages to their source instead of
// their built `dist/`, so editing anything under `packages/*/src` is picked up
// by Vite HMR with no rebuild step. Gated to `serve` so `pnpm build` still
// exercises the real published `dist/` output.
const src = (rel: string) => fileURLToPath(new URL(`../../packages/${rel}`, import.meta.url));

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
  // Never fail on a busy port — take the next free one (5174, 5175, …).
  server: { strictPort: false },
  preview: { strictPort: false },
  build: {
    // Mermaid's renderer is a lazy optional feature and fractalthemer's catalog is
    // intentionally shipped as a vendor chunk. Keep a 700 kB budget for those
    // async-only dependencies while still warning if application code grows past it.
    chunkSizeWarningLimit: 700
  },
  resolve: {
    alias: command === 'serve' ? devSourceAliases : []
  },
  css: {
    // Acrolls' theme surface forwards fractalthemer via `pkg:` URLs; the Node
    // package importer resolves them from node_modules (exports-aware).
    preprocessorOptions: {
      sass: { importers: [new NodePackageImporter()] }
    }
  },
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx', '.md'],
      preprocess: [
        vitePreprocess(),
		createAcrollsSvelteKitMdsvexPreprocessor({
			layout: { _: docsArticleLayout },
			docs: { mode: 'authored' }
		})
      ],
      adapter: adapter()
    })
  ]
}));
