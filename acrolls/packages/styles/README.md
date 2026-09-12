# acrolls/styles

Canonical CSS and indented Sass styles for Acrolls.

## Modes

```js
import 'acrolls/styles/foundation.css'; // mechanics only
import 'acrolls/styles/default.css';    // foundation + editorial scale
import 'acrolls/styles/colors.css';     // lean light/dark colors (no fractalthemer)
import 'acrolls/styles/theme.css';      // full theme builder (fractalthemer)
```

## Sass

```sass
@use 'acrolls/styles/default'
@use 'acrolls/styles/tokens' as *
@include acrolls-tokens()
```

Import the Sass preset from a Svelte layout script as `import 'acrolls/styles/default.sass'`.
In a host-authored global Sass entry, use `@use 'acrolls/styles/default'`. Do not also import the
matching CSS preset.

## Theming kit

Two tiers. **Lean:** `acrolls/styles/colors` — self-contained light/dark, no fractalthemer.
**Full:** `acrolls/styles/theme` forwards [fractalthemer](https://www.npmjs.com/package/fractalthemer)
(40+ light/dark themes, aura backgrounds, theme picker) over the same baseline. `fractalthemer` is
an **optional peer dependency** — install it explicitly (`pnpm add fractalthemer`) to use `theme`.

```sass
@use 'acrolls/styles/theme'
```

The Sass surface resolves fractalthemer through `pkg:` URLs, so a Node package importer must be
registered (e.g. Vite `css.preprocessorOptions.sass.importers: [new NodePackageImporter()]`). The
precompiled `acrolls/styles/theme.css` needs no importer. Select a theme with fractalthemer's
`<html>` markers (`class="theme-*"`, `data-theme`, `data-mode`).

## Tokens

Set `--acrolls-*` (or host fallbacks like `--foreground`, `--accent`) on `.acrolls` or an ancestor.
