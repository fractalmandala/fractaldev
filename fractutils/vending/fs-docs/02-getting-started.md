---
title: Getting Started
description: Installation and setup.
---

## Option A: Plain CSS

If you have no SASS toolchain — which is most projects — take the compiled
stylesheet. One file, no build step, nothing to configure:

```bash
npx fractalstyler2 init --css
```

That scaffolds `fractalstyler.css` (and a minified twin) plus
`canonical-markups.md` into `src/styles`. Link it and start composing:

```html
<link rel="stylesheet" href="/src/styles/fractalstyler.css" />
```

Or, if you have a bundler and the package installed:

```js
import 'fractalstyler2/css';       // expanded
import 'fractalstyler2/css/min';   // minified
```

Themes and the four preset axes work with no JavaScript at all — they are
plain classes and attributes:

```html
<html class="theme-night-dark" data-mode="dark" data-shape="sharp">
```

To let people change them at runtime, and to stamp the saved choice before
first paint so there is no flash of the wrong theme, there is a framework-free
runtime at `fractalstyler2/presets`:

```js
import { initPresets, setPreset, cyclePreset, getPresetScript } from 'fractalstyler2/presets';

initPresets();                  // apply what was saved
setPreset('shape', 'sharp');    // change one axis
cyclePreset('motion');          // step to the next value
```

You lose nothing structural by taking this path. The only thing SASS buys is
the ability to retune the generators — the literal ladder and the responsive
seam — before compiling.

---

## Option B: Editable SASS

SASS is amazing! I know the systemic and ecosystem reasons that inhibited its wider adoption, but I personally can never go back to styling with curly braces and semi-colons. 

Scaffold the complete, editable SASS design system into your project's `src/lib/styles`:

```bash
# npm
npx fractalstyler2 init

# or pnpm
pnpm --package=fractalstyler2 dlx fractalstyler2 init
```

Only this path needs the preprocessor. Install `sass` as a dev dependency:

```bash
pnpm add -D sass
# or
npm install -D sass
```

## Option C: Direct Package Dependency

If you prefer to import from `node_modules` without scaffolding files:

```bash
pnpm add fractalstyler2
```

```js
import 'fractalstyler2/css';       // compiled — nothing else needed
import 'fractalstyler2/css/min';   // minified
```

Or the SASS entry, which additionally needs `pnpm add -D sass`:

```js
import 'fractalstyler2/styles';
```

---

## Option D: Install as an Agent Plugin (Codex, Claude, Gemini, OpenCode)

Fractalstyler2 implements the [agent-plugins.org](https://agent-plugins.org/specification) standard. You can install it directly into your AI coding agent or design tool to enable design token queries, live SASS compilation, and automated component generation:

### OpenCode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "fractalstyler2": {
      "type": "local",
      "command": ["npx", "-y", "fractalstyler2-mcp"],
      "enabled": true
    }
  }
}
```

### Gemini / Antigravity

Run the one-command installer:

```bash
npx fractalstyler2 mcp:install
```

### Claude Desktop / Claude Code

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fractalstyler2": {
      "command": "npx",
      "args": ["-y", "fractalstyler2-mcp"]
    }
  }
}
```

### Codex

Add to your Codex configuration:

```json
{
  "mcpServers": {
    "fractalstyler2": {
      "command": "npx",
      "args": ["-y", "fractalstyler2-mcp"]
    }
  }
}
```

---

## Wire into SvelteKit

**1. Enable the SASS preprocessor.** In `vite.config.ts` (or `svelte.config.js`
if your setup uses one), add `vitePreprocess`:

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({ preprocess: vitePreprocess() })]
});
```

**2. Emit the stylesheet once, globally.** In `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
	// If scaffolded via CLI:
	import '$lib/styles/index.sass';

	// Or if using node_modules package:
	// import 'fractalstyler2/styles';

	let { children } = $props();
</script>

{@render children()}
```

That import compiles the full system (tokens, reset, utility classes, blocks,
layouts) and injects it as global CSS. You only do it once.

## Your First Markup

If you are able to use 3 classes well - .box, .row, and .grid, you're pretty much equipped to begin making layouts and pages. 
In the file `_03_containers.sass`, see .box and .row. If you're familiar with Every Layout, these are the same as stack and cluster. Flexboxes column and row, respectively. 

Modular and fractal. In your markup, use `class="box gap-xl"` for xl sized gap between the box's children items. Add `radius-lg` if you're tastes are more rounded elements.  Align items left? Add in `xleft`. 
`box gap-sm` and `row ycenter gap-sm` are likely to be your most used classes. You can use them on cards, sidebars, shells - anything. 

A decision that is left to you is whether some things are "bloat" or "scoped efficieny".
Should you use a class `sidebar-left` which you define as a flex in column direction, or should you just throw in `box gap-lg` in the markup?


## Display Mode and Themes

**76 palettes ship with the system** — 38 light, 38 dark, every one paired with
its counterpart in the opposite mode. They are plain classes
on `<html>`, so the simplest version needs no JavaScript at all:

```html
<html class="theme-night-dark" data-mode="dark">
```

Always pair the class with its `data-mode`. The colour preset's dark variants
key off `prefers-color-scheme`, so a palette applied without its mode can end up
tuned against the OS preference rather than against itself.

### Switching at runtime

```js
import { setTheme, getTheme, themes, initPresets } from 'fractalstyler2/presets';

themes;                          // [{ id: 'theme-night-dark', mode: 'dark' }, …]
setTheme('theme-himalaya-light'); // swaps the class, sets data-mode, persists
getTheme();                       // the active id, or null
setTheme(null);                   // back to the plain mode defaults
```

`initPresets()` restores the saved palette and preset axes on load. For
zero-flicker — no flash of the default palette before hydration — inject the
inline head script, which reads the same storage synchronously before first
paint:

```svelte
<svelte:head>
  {@html `<script>${getPresetScript()}<\/script>`}
</svelte:head>
```

This is the framework-free runtime; it works the same in a plain HTML page.

[Next - Structure](./03-structure.md)