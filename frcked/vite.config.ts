import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from "mdsvex";
import { fractalpopHighlighter } from "@fractalpop/mdsvex";
import { defineConfig } from 'vite';


export default defineConfig({
	resolve: {
		alias: {
			'$fractalstyler': new URL('../fractalstyler/src/lib/styles', import.meta.url).pathname
		}
	},
	css: {
		preprocessorOptions: {
			sass: {
				loadPaths: [
					new URL('../fractalstyler/src/lib/styles', import.meta.url).pathname
				]
			}
		}
	},
	server: {
		fs: {
			allow: ['..']
		}
	},
	plugins: [
		sveltekit({
			compilerOptions: { experimental: { async: true } },
			extensions: [".svelte", ".svx", ".md"],
			adapter: adapter(),
			preprocess: [
				mdsvex({
					extensions: ['.svx', '.md'],
					highlight: { highlighter: fractalpopHighlighter as any }
				}),
				vitePreprocess()
			],
		})
	]
});
