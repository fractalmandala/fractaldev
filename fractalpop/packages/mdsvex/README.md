# @fractalpop/mdsvex

`@fractalpop/mdsvex` highlights fenced code in `.svx` files. It plugs into
mdsvex's `highlight.highlighter` hook and returns an HTML string with
Svelte-significant characters escaped, so highlighted code is never reparsed as
Svelte markup.

## Install

```sh
npm install -D @fractalpop/mdsvex mdsvex
npm install fractalpop
```

`mdsvex` and `svelte` are optional peer dependencies — you already have them in
a SvelteKit project that uses mdsvex.

## Setup

Pass `fractalpopHighlighter` to mdsvex's `highlight.highlighter` option in your
Svelte config. mdsvex can process `.svx` **and** `.md` files — list both in its
`extensions` (and in the top-level `extensions`) to highlight code in either.

```js
// svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import { fractalpopHighlighter } from '@fractalpop/mdsvex'

const mdsvexConfig = {
  extensions: ['.svx', '.md'],
  highlight: { highlighter: fractalpopHighlighter },
}

export default {
  extensions: ['.svelte', '.svx', '.md'],
  // Run mdsvex before vitePreprocess (see the note below).
  preprocess: [mdsvex(mdsvexConfig), vitePreprocess()],
}
```

Now every fenced code block in a `.svx` or `.md` file is highlighted at build
time.

> **Note — preprocess order.** If you also use `vitePreprocess`, put `mdsvex`
> **first**. Otherwise `vitePreprocess` scans the raw Markdown before mdsvex
> converts it, and a `<style lang="sass">` shown inside a code fence is mistaken
> for a real Sass block — which fails unless you have a Sass compiler installed.
> Running mdsvex first escapes the fence, so the false match never happens.

```md
```sass {2,4}
$brand: hsl(212, 90%, 55%)
.card
  color: $brand
  &:hover
    background: darken($brand, 8%)
```
```

The `{2,4}` after the language marks those 1-based lines with
`fp__line--highlighted`. Ranges work too: `{2,4-6}`.

## Styling the output

The highlighter emits `<pre class="fp fp-lang--<lang>"><code>…</code></pre>` with
the usual `fp__token--<type>` classes. Style it with the `--fp-*` variables. Add a rule for highlighted lines:

```css
.fp__line--highlighted {
  background: #fff8c5;
}
```

## API

The package exports the highlighter plus two helpers, in case you build your own
pipeline.

### `fractalpopHighlighter(code, lang?, meta?)`

Returns a `<pre><code>` HTML string. This is the function mdsvex calls per code
block.

- `code` — the raw source of the fence.
- `lang` — the fence language (for example `sass`).
- `meta` — the text after the language (for example `{2,4}`).

### `escapeSvelte(html)`

Escapes `{`, `}`, and `` ` `` so highlighted output is safe inside Svelte
markup. `fractalpopHighlighter` applies this for you.

### `parseHighlightMeta(meta?)`

Parses `{1,3-5}` into a `Set` of 1-based line numbers.

## Related Packages

- [fractalpop](https://www.npmjs.com/package/fractalpop) — Core highlighter engine
- [@fractalpop/svelte](https://www.npmjs.com/package/@fractalpop/svelte) — Svelte 5 components and action
- [@fractalpop/remark](https://www.npmjs.com/package/@fractalpop/remark) — Remark plugin for Markdown & MDX
