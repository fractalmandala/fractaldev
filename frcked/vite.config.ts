import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	resolve: {
		alias: {
			'$fractalstyler': new URL('../fractalstyler/src/lib/styles', import.meta.url).pathname,
			'#lib': new URL('./src/lib', import.meta.url).pathname
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
		sveltekit()
	]
});
