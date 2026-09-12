import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  base: './',
  server: { port: 5273, strictPort: true },
  preview: { port: 5273, strictPort: true },
});
