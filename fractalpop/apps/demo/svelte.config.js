import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import { fractalpopHighlighter } from '@fractalpop/mdsvex'

/** mdsvex processes .svx and .md files; fractalpop highlights their code fences. */
const mdsvexConfig = {
  extensions: ['.svx', '.md'],
  highlight: { highlighter: fractalpopHighlighter },
}

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.svx', '.md'],
  // mdsvex first: it converts markdown (escaping fenced <script>/<style>) before
  // vitePreprocess runs, so a `<style lang="sass">` shown inside a code fence
  // isn't mistaken for a real Sass style block.
  preprocess: [mdsvex(mdsvexConfig), vitePreprocess()],
  kit: { adapter: adapter() },
}
