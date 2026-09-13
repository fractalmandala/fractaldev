# fractalpop (core)

`fractalpop` is the engine. It highlights a string of source code and returns
an HTML string - no DOM, no runtime dependencies. Use it directly on any
platform, or through one of the adapter packages.

## Install

```sh
npm install fractalpop
```

## Quick start

Call `highlight()` with your code and a language. The result is a string of
nested `<span>` elements that you drop into a `<pre><code>` block.

```ts
import { highlight } from 'fractalpop'

const html = highlight('const ready = true', { lang: 'ts' })
// <span class="fp__line"><span class="fp__token--keyword" style="color:var(--fp-keyword)">const</span> …
```

The output is HTML-encoded, so it is safe to inject with `innerHTML`,
`{@html}`, or `dangerouslySetInnerHTML`.

## `highlight(code, options)`

`highlight` takes the source string and an options object. It returns an HTML
string.

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `lang` | `string` | `'typescript'` | Language id, extension, or alias (see [Languages](#languages)). |
| `cx` | `Partial<Record<TokenType, string>>` | - | Extra class name to add per token type. |
| `mark` | `(token: MarkToken) => void` | - | Mutate a single token before it renders. |
| `markLine` | `(line: MarkLine) => void` | - | Mutate a whole line before it renders. |

`cx`, `mark`, and `markLine` are the only customization hooks, and they control
performance. When you pass **none** of them, `render` takes a fast path: it
concatenates strings with no per-token object allocation. Passing any hook
switches to the slower path that builds mutable token and line objects so the
hooks can run. If you do not need customization, pass no hooks.

### Emphasis with `cx`

`cx` appends a class to every token of a given type. This is the Tailwind-
friendly way to emphasize tokens without writing selectors.

```ts
highlight(code, {
  lang: 'sass',
  cx: { keyword: 'font-bold', comment: 'italic opacity-70' },
})
```

### Line highlighting with `markLine`

Each line exposes its zero-based `index`. Add a class when the line is one you
want to highlight.

```ts
const active = new Set([2, 3]) // 1-based line numbers

highlight(code, {
  lang: 'ts',
  markLine(line) {
    if (active.has(line.index + 1)) line.className += ' fp__line--highlighted'
  },
})
```

## Theming

fractalpop does not ship colors. Every token renders with
`class="fp__token--<type>"` and an inline `style="color:var(--fp-<type>)"`, so a
theme is a block of CSS variables you set on any ancestor.

```css
:root {
  --fp-identifier: #354150;
  --fp-keyword: #f47067;
  --fp-string: #00a99a;
  --fp-class: #8d85ff;
  --fp-property: #4e8fdf;
  --fp-entity: #665ac7;
  --fp-jsxliterals: #bf7db6;
  --fp-sign: #8996a3;
  --fp-comment: #a19595;
}

.fp__line--highlighted {
  background: #fff8c5;
}
```

For dark mode, redefine the same variables under a selector or media query - for
example `:root[data-theme='dark']` or `@media (prefers-color-scheme: dark)`.

### Token types

Token types are a small, fixed list. Keeping it stable keeps themes portable.

| Type | CSS variable | Typical meaning |
| --- | --- | --- |
| `identifier` | `--fp-identifier` | Plain identifiers and default text. |
| `keyword` | `--fp-keyword` | Language keywords. |
| `string` | `--fp-string` | Strings, regex literals, template text. |
| `class` | `--fp-class` | Capitalized names, numbers, `null`, types. |
| `property` | `--fp-property` | Object/CSS properties, Sass `$variables`. |
| `entity` | `--fp-entity` | Function and mixin names. |
| `jsxliterals` | `--fp-jsxliterals` | JSX text between tags. |
| `sign` | `--fp-sign` | Punctuation and operators. |
| `comment` | `--fp-comment` | Comments. |

Two more types, `break` (newlines) and `space` (horizontal whitespace), are
preserved for faithful output but carry no color.

## Languages

fractalpop ships metadata and configs for **32 languages**, but the default
entry only **registers** TypeScript and plaintext — the rest stay tree-
shakeable. Register what you need yourself, or import `fractalpop/full` to
register all 32 up front. Resolve a name, file extension, or alias to a
canonical id with `lang()`.

```ts
import { lang, findLanguage, allLanguages } from 'fractalpop/lang'

lang('tsx')     // 'typescript'
lang('.scss')   // 'scss'  (metadata is known; register the config to highlight)
lang('yml')     // 'yaml'
lang('nope')    // undefined
```

The four languages built with the most care are the ones fractalpop exists for:

- `sass` - indented Sass (no braces, no semicolons).
- `scss` - the brace dialect, sharing Sass's value coloring.
- `svelte` - the composite: `<script lang="ts">` + markup + `<style lang="sass">`.
- `typescript` / `javascript` - a full JS/JSX/TS runtime (regex literals,
  template interpolation, JSX, and the TS-generic-vs-JSX distinction).

The rest is the general pack: `css`, `html`, `markdown`, `diff`, `plaintext`,
`c`, `cpp`, `csharp`, `go`, `java`, `rust`, `json`, `shell`, `sql`, `yaml`,
`toml`, `python`, `ruby`, `php`, `kotlin`, `swift`, `lua`, `graphql`, `hcl`,
`dockerfile`, `powershell`, `zig`.

## Subpath exports

The package exposes several entries so you only bundle what you need.

| Import | Exposes |
| --- | --- |
| `fractalpop` | `highlight`, registry utilities, and the option/token types. **Only TypeScript and plaintext are registered by default.** |
| `fractalpop/full` | Everything from `fractalpop`, with all 32 languages registered. |
| `fractalpop/core` | `parse`, `tokenize`, `render` (→ string), `generate` (→ AST). |
| `fractalpop/lang` | `lang`, `findLanguage`, `allLanguages`. |
| `fractalpop/lang/<id>` | A single language config (tree-shakeable). |
| `fractalpop/gpu` | Async WebGPU highlighting via optional peer `gpu-lexer`. |

`generate` returns a hast-like AST, which is what a unified/rehype pipeline
consumes. `render` returns the HTML string that `highlight` wraps.

```ts
import { parse, generate } from 'fractalpop/core'
import { lang, getLanguageConfig } from 'fractalpop/full'

const parsed = parse(code, getLanguageConfig(lang('sass')!))
const tree = generate(parsed) // element/text nodes, one per line and token
```

## Registry utilities

The default `fractalpop` entry only registers TypeScript and plaintext. Use
these utilities to control which languages are available at runtime.

The registry is a single module-level singleton shared by every entry point
(`fractalpop/full` re-exports and mutates the same core as `fractalpop`), so a
registration made through one import path is visible to all others in the same
app.

```ts
import {
  registerLanguage,
  setDefaults,
  importDefaults,
  canonicalizeLang,
  getRegisteredLanguages,
} from 'fractalpop'

registerLanguage({ id: 'python', extension: 'py', aliases: ['python3'] }, pythonConfig)
setDefaults({ python: pythonConfig, rust: rustConfig })
await importDefaults(['python', 'rust'])
canonicalizeLang('tsx') // 'typescript'
```

| Function | Purpose |
| --- | --- |
| `registerLanguage(language, config?)` | Register one language, optionally with its parse config. |
| `setDefaults(languagesOrConfigs)` | Replace the default set. Accepts `Language[]` or `Record<string, ParseOptions>`. |
| `importDefaults(ids)` | Asynchronously import and register languages by id. |
| `canonicalizeLang(name)` | Resolve a name/alias/extension to the canonical id. |
| `getRegisteredLanguages()` | List currently registered languages. |

### Migration from 0.1.0

If you previously used `import { highlight } from 'fractalpop'` with non-
TypeScript languages, switch to `fractalpop/full`:

```ts
// before
import { highlight } from 'fractalpop'

// after
import { highlight } from 'fractalpop/full'
```

Or register only the languages you need to keep bundles small.

## Adding a language

Languages live in `packages/core/src/lang/`. Most are a keyword config; a few
are custom tokenizers.

1. Create `packages/core/src/lang/<id>.ts`. For a keyword language, use the
   shared base:

   ```ts
   import { keywordLang } from '../presets/bases.js'
   import type { ParseOptions } from '../core.js'

   export const config: ParseOptions = keywordLang({
     keywords: ['if', 'else', 'return'],
     comments: { line: ['//'], block: true },
   })
   ```

   For a language that needs structural rules, export a `tokenize(code)` that
   runs the general lexer and post-processes the tokens. `lang/css.ts` and
   `lang/sass.ts` are the reference examples.

2. Add the metadata entry to `allLanguages` in `packages/core/src/lang-registry.ts`
   (`id`, `extension`, `aliases`) and add the config import to
   `packages/core/src/presets/all-languages.ts` (via `presets/configs.ts`). The
   registry throws on alias collisions, so keep names unique.

3. Add a fixture test under `packages/core/test/`.

## Next steps

- Highlight inside Svelte components: [`@fractalpop/svelte`](./svelte.md)
- Highlight Markdown and MDX: [`@fractalpop/remark`](./remark.md)
