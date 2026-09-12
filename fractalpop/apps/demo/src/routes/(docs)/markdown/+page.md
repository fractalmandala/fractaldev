<script>
  let { data } = $props()
</script>

# Markdown

This page **is** a `.md` file. mdsvex compiles it to a Svelte component and
`@fractalpop/mdsvex` highlights every fenced block at build time — nothing here
runs client-side. Further down, `@fractalpop/remark` produces the same tokens
outside Svelte altogether.

## Setup

mdsvex is configured for both `.svx` and `.md`, so one option covers every
markdown route:

```ts
import { fractalpopHighlighter } from '@fractalpop/mdsvex'

// svelte.config.js
mdsvex({ highlight: { highlighter: fractalpopHighlighter } })
```

## Fences

JavaScript, with template strings and comments:

```js
export function greet(name) {
  // template strings and comments are highlighted
  return `Hi ${name}`
}
```

Python:

```python
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Fence meta `{2,3}` marks those lines — indented Sass, coloured by indentation
rather than braces:

```sass {2,3}
$brand: hsl(212, 90%, 55%)
.card
  color: $brand
  &:hover
    background: darken($brand, 8%) !important
```

SCSS, with line 3 marked:

```scss {3}
$brand: #cd6799;
.card {
  color: $brand;
  &:hover { color: darken($brand, 10%); }
}
```

## remark — `.md` and `.mdx` anywhere

`@fractalpop/remark` is a standard remark plugin, so it works in any framework —
Astro, Next MDX, plain unified, or a SvelteKit `load` function. One plugin covers
`.md` and `.mdx`.

```ts
import { remark } from 'remark'
import html from 'remark-html'
import remarkFractalpop from '@fractalpop/remark'

const file = await remark()
  .use(remarkFractalpop)
  .use(html, { sanitize: false })
  .process(markdown)
```

<div class="remark-out">

{@html data.html}

</div>

<details class="source inspector-panel">
<summary class="inspector-summary">
  <span class="inspector-badge">INSPECTOR</span>
  <span>The Markdown source behind that block</span>
</summary>

<div class="blueprint-box inspector-body">
  <span class="blueprint-box-corner-tr">+</span>
  <span class="blueprint-box-corner-bl">+</span>
  <div class="blueprint-box-badge">RAW INPUT PAYLOAD (MARKDOWN)</div>
  <pre class="fp fp-lang--markdown"><code>{@html data.sourceHtml ?? data.source}</code></pre>
</div>

</details>

Same engine, same tokens, same theme variables — whether the source is
`.svelte`, `.svx`, or `.md`.
