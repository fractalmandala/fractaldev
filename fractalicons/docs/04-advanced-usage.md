---
title: Advanced Usage
description: Icon pickers, dynamic imports, tree-shaking, and adding new icon families.
type: fractalicons
---

## Passing icons as data

Because each icon is just an `IconData` object, you can store icons in variables, arrays, maps, or props and render them dynamically:

```svelte
<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luSun, luMoon } from 'fractalicons/lucide';

	let dark = $state(false);
	const current = $derived(dark ? luMoon : luSun);
</script>

<button onclick={() => (dark = !dark)}>
	<Icon icon={current} />
	{dark ? 'Dark' : 'Light'}
</button>
```

## Building a browser / gallery

To render a whole family (for an icon picker or docs page), import the family namespace and iterate. Each icon is exported twice (prefix + alias) pointing at the same object, so dedupe by identity:

```svelte
<script lang="ts">
	import { Icon } from 'fractalicons';
	import * as lucide from 'fractalicons/lucide';

	// dedupe the prefix/alias pairs, keep the shorter name
	const entries = (() => {
		const byRef = new Map<unknown, string>();
		for (const [name, data] of Object.entries(lucide)) {
			const prev = byRef.get(data);
			if (!prev || name.length < prev.length) byRef.set(data, name);
		}
		return [...byRef].map(([data, name]) => ({ name, data }));
	})();
</script>

{#each entries as { name, data } (name)}
	<Icon icon={data} title={name} />
{/each}
```

> Namespace-importing a whole family pulls in that entire set (it opts out of tree-shaking) — great for a gallery, but for app UI prefer named imports.

## Tree-shaking

Named imports (`import { luActivity } from 'fractalicons/lucide'`) are individually tree-shakeable: each family is a single module of top-level icon declarations, so bundlers drop everything you don't reference — your bundle contains only the icons you actually import, no matter how large the family is (a single icon bundles to roughly 0.3 KB).

---

## How It Works — `IconData`

Every icon compiles to a tiny, serializable data object:

```ts
export interface IconData {
	name: string; // e.g. "activity"
	set: string; // e.g. "lucide"
	viewBox: string; // e.g. "0 0 24 24"
	body: string; // inner SVG markup, with colors normalized to currentColor
}
```

The `Icon` component wraps `body` in an `<svg>` with the right `viewBox`, size, accessibility attributes, and the `.fractalicon` class. Colors are normalized to `currentColor` at generation time and presentation attributes (stroke widths, line caps, embedded `<style>`/`@keyframes` for animated sets) are preserved.


## Local Development & Contributing

Icons are generated from raw SVG source folders under `vendor/icons/<family>/` into single-file typed modules at `src/lib/<family>.ts`. Vendor sources live outside `src/lib` so they never ship in the published package.

```sh
pnpm install
pnpm dev          # run the demo site (src/routes)
pnpm generate     # regenerate icon modules from vendor/icons/** (run when sources change)
pnpm build        # generate + build demo + package for publishing
pnpm check        # svelte-check
pnpm lint         # prettier + eslint
```

To add or update a family, drop its `.svg` files into `vendor/icons/<family>/`, add the family's short prefix to `familyPrefixMap` in `scripts/generate-icons.js`, and run `pnpm generate`. Colors are normalized to `currentColor` and export names are derived automatically.
