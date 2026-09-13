# @fractalpop/remark

`@fractalpop/remark` is a remark plugin that highlights fenced code in Markdown
and MDX. One plugin serves both: MDX code fences are the same mdast `code` nodes
as Markdown, so there is no separate MDX package.

The plugin walks the tree, highlights each code node with fractalpop's
`generate()`, and replaces it with a `<pre><code>` subtree. It runs anywhere
unified/remark runs — Astro, Next MDX, Docusaurus, or a plain remark pipeline.

## Install

```sh
npm install @fractalpop/remark fractalpop
```

## Usage

Add the plugin to your remark pipeline before the stage that turns the tree into
HTML.

```js
import { remark } from 'remark'
import html from 'remark-html'
import remarkFractalpop from '@fractalpop/remark'

const output = await remark()
  .use(remarkFractalpop, { cx: { keyword: 'font-bold' } })
  .use(html, { sanitize: false })
  .process(markdown)
```

> **Note.** Pass `{ sanitize: false }` to `remark-html` (or configure
> `rehype-sanitize` to allow the classes and inline styles). Sanitizers strip
> the `fp__token--*` classes and the inline `color` styles by default.

The demo app runs exactly this pipeline in a SvelteKit `load` function and
renders the result — see
[`/remark`](<../apps/demo/src/routes/(docs)/remark/+page.ts>).

### Line highlighting

Use one-based ranges in a fence's meta to mark lines. Single lines and ranges
both work.

````md
```ts {2,4-6}
const ready = true
```
````

Those lines get the class `fp__line--highlighted`.

### Language aliases

Fence languages are resolved through fractalpop's registry, so aliases work:
`bash` uses `shell`, `jsonc` uses `json`, `tf` uses `hcl`, and `jsx`/`tsx` map to
`javascript`/`typescript`.

## Options

The plugin accepts the same display options as `highlight`.

| Option | Type | Purpose |
| --- | --- | --- |
| `cx` | `Partial<Record<TokenType, string>>` | Extra class per token type. |
| `mark` | `(token) => void` | Mutate a single token. |
| `markLine` | `(line) => void` | Mutate a whole line. |

The named `highlight` export is the same transformer, for integrations that
prefer named imports:

```js
import { highlight } from '@fractalpop/remark'
```

## Output and styling

Each code block becomes
`<pre class="fp-lang--<lang>"><code class="fp-lang--<lang>" data-fp-language="<lang>">…</code></pre>`
with `fp__token--<type>` tokens. Style it with the `--fp-*` variables from the
[core theming docs](./core.md#theming), and add a rule for highlighted lines:

```css
.fp__line--highlighted {
  background: #fff8c5;
}
```

## Next steps

- Highlight `.svx` files in SvelteKit: [`@fractalpop/mdsvex`](./mdsvex.md)
- Understand token types and theming: [`fractalpop`](./core.md)
