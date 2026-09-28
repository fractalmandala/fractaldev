---
title: Getting Started
description: Install fractalicons, import the Icon component, and render icons from any family, including the four Keyline cuts.
type: fractalicons
---

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
	import { klHeart } from 'fractalicons/keylinestroke';
	import { klfHeart } from 'fractalicons/keylinefill';
	import { kldHeart } from 'fractalicons/keylineduo';
	import { klsHeart } from 'fractalicons/keylinesharp';
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

<!-- Keyline: same drawing, four cuts -->
<Icon icon={klHeart} />
<Icon icon={klfHeart} />
<Icon icon={kldHeart} />
<Icon icon={klsHeart} />
```

## Keyline Icons

Keyline is one 24×24 drawing in four families, 1,000 icons each. The file name is shared across the cuts.

| Style      | Prefix | Import                       | Drawing                                                        |
| :--------- | :----- | :--------------------------- | :------------------------------------------------------------- |
| **Stroke** | `kl`   | `fractalicons/keylinestroke` | 2px keyline, rounded caps and corners                          |
| **Fill**   | `klf`  | `fractalicons/keylinefill`   | Solid. A glyph with no interior keeps its stroke drawing       |
| **Duo**    | `kld`  | `fractalicons/keylineduo`    | The keyline over a plate at 40% opacity (`fill-opacity="0.4"`) |
| **Sharp**  | `kls`  | `fractalicons/keylinesharp`  | The stroke cut with square corners and butt caps               |

`klHeart`, `klfHeart`, `kldHeart`, and `klsHeart` are the same heart. The plate and the keyline both use `currentColor`. Prefixes for every family are in [Naming, Aliases, Props](./02-naming-aliases-props.md).

## Upgrading to 0.4.0

V0.4.0 adds 4 new icon packs from the Keyline icons set. To upgrade:

```
pnpm add fractalicons@0.4.0
```

## Migrating 0.2.x → 0.3.0

- **Per-icon deep imports are gone.** Each family is now a single module, so `fractalicons/lucide/activity` no longer resolves. Import from the family subpath instead: `import { luActivity } from 'fractalicons/lucide'`.
- **The `"./*"` wildcard export was replaced with explicit per-family subpaths.** All documented `fractalicons/<family>` imports and `fractalicons/Icon.svelte` work unchanged — use extensionless subpaths (`fractalicons/lucide`, not `fractalicons/lucide.js`) so types resolve.
- Export names, aliases, `IconData`, and the `<Icon />` API are unchanged.
