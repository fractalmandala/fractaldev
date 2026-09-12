# fractalicons

![npm version](https://img.shields.io/npm/v/@fractaldev/fractalicons.svg)

![license](https://img.shields.io/npm/l/fractalicons.svg)

A comprehensive, tree-shakeable icon library for **Svelte 5** featuring **27,000+ icons across 25 popular open-source icon families** with short, ergonomic import prefixes.

I built this to be able to sample and use multiple icon families through a single workflow and pipeline. Built with love on SvelteKit.

- **Svelte 5 Runes** — built specifically for Svelte 5 with native rune reactivity.
- **Tree-Shakeable** — each family compiles to a single module of `IconData` payloads; named imports shake down to just the icons you reference (~0.3 KB per icon in your bundle).
- **Prefix-cased** — fast to type (`lu` for Lucide, `ph` for Phosphor, `re` for Remix, etc.) with full-name aliases preserved.
- **Color & Stroke Preserved** — colors are normalized to `currentColor` and presentation attributes (strokes, stroke-widths, animations, fill styles) are kept intact.
- **Animated icons** — the Material Animated family plays CSS animations with a configurable `trigger` (hover, click, on-view, loop…).
- **Accessible** — automatic `role="img"`, `aria-hidden`, and `<title>` / `aria-labelledby` handling.
- **TypeScript-first** — every icon and prop is fully typed.

[Read Full Docs](https://github.com/fractalmandala/fractalicons/tree/main/docs)

## Requirements

- **Svelte 5** (`svelte@^5.0.0`, declared as a peer dependency) — the `Icon` component uses runes.
- **ESM only** — the package ships as ES modules (`"type": "module"`). Works out of the box with SvelteKit, Vite, and any modern bundler.

## Installation

```sh
pnpm add @fractaldev/fractalicons
# or
npm install @fractaldev/fractalicons
# or
yarn add @fractaldev/fractalicons
```

## Quick Start

Import the `Icon` component once, then import individual icons from any family's subpath. Icons are plain data objects — you pass them to `Icon`.

```svelte
<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luActivity, luSparkles } from 'fractalicons/lucide';
	import { phHeart, phAcorn } from 'fractalicons/phosphor';
	import { reFireLine } from 'fractalicons/remix';
	import { icAccessibilitySign } from 'fractalicons/iconoir';
	import { anAccountBook } from 'fractalicons/anticons';
	import { cuSpeedometer } from 'fractalicons/coreui';
	import { faFlameOutline } from 'fractalicons/famicons';
	import { ciCoffeeCup } from 'fractalicons/circum';
	import { tbArrowMerge } from 'fractalicons/tabler';
	import { heAcademicCap } from 'fractalicons/heroicons';
	import { feActivity } from 'fractalicons/feathericons';
	import { maaLoadingLoop } from 'fractalicons/materialanim';
</script>

<!-- Basic icon (defaults to 1em, follows font-size and color) -->
<Icon icon={luActivity} />

<!-- Custom size (number for px, or a string with units) -->
<Icon icon={phHeart} size={24} />
<Icon icon={reFireLine} size="1.5rem" />

<!-- Accessible with a title (sets role="img" + <title>) -->
<Icon icon={luActivity} title="Activity" />

<!-- Any standard SVG attribute passes through (class, style, stroke, …) -->
<Icon icon={maaLoadingLoop} size={32} class="text-blue-500" />

<!-- Animated icon with a play trigger -->
<Icon icon={maaLoadingLoop} size={32} trigger="hover" />
```

## Docs

- [Getting Started](https://github.com/fractalmandala/fractalicons/blob/main/docs/01-getting-started.md)
- [Naming, Aliases, Props](https://github.com/fractalmandala/fractalicons/blob/main/docs/02-naming-aliases-props.md)
- [Styling and Animation](https://github.com/fractalmandala/fractalicons/blob/main/docs/03-styling-animation.md)
- [Advanced](https://github.com/fractalmandala/fractalicons/blob/main/docs/04-advanced-usage.md)
- [Licenses](https://github.com/fractalmandala/fractalicons/blob/main/docs/05-licenses.md)
