# Fractalsvelte UI

An accessible SvelteKit component library with a live documentation site. It uses Svelte 5 runes and a tab-indented Sass styling architecture: no `.scss` or `.css` sources are used.

The documentation app is migrated to the SvelteKit 3 prerelease toolchain. The verified floor is Node 22.17, Svelte 5.56.4, Vite 8.2.2, TypeScript 6.0.3, and the pinned Kit/plugin versions in `package.json`. Stable Kit 3 is not yet published in the registry; use the latest stable Kit 2 release for production hosts until the Kit 3 release you target is available. See [`docs/guides/23-sveltekit-3-migration.md`](docs/guides/23-sveltekit-3-migration.md) for the full migration contract.

## Start the documentation app

```sh
pnpm install
pnpm dev
```

Open the local URL shown by Vite. The introduction is at `/`; every documented component is available at `/components/<name>`.
Cross-project adoption and maintenance guides are available at `/guides` and in [`docs/guides`](docs/guides).

Guide fences and component usage examples are syntax-highlighted server-side with Shiki and automatically follow the documentation app’s light/dark mode.

## Install the library in another project

The repository currently ships a source-oriented package and is not published to a registry. In a pnpm workspace, add the checkout as a workspace dependency:

```sh
pnpm add ../fractalcodex
```

Then import the public entrypoints. Use the package name shown in the consuming project's lockfile if you have renamed the package:

```svelte
<script lang="ts">
	import { Button, Card } from 'fractalsvelte/components';
	import 'fractalsvelte/styles/system.sass';
</script>

<Card><Button>Continue</Button></Card>
```

The supported subpaths are `fractalsvelte/components`, `fractalsvelte/styles`, `fractalsvelte/styles/system.sass`, `fractalsvelte/styles/global.sass`, and `fractalsvelte/tokens`. `system.sass` is the portable library stylesheet; `global.sass` also includes the documentation application styles.

## Publish

Version `0.5.0` is prepared for npm publication. From this directory, run the checks and inspect the packed files before publishing:

```sh
pnpm verify
pnpm build
npm pack --dry-run
npm login
npm whoami
npm publish
```

The package is unscoped, so `npm publish` publishes it publicly by default. This repository intentionally does not run `npm login` or `npm publish` for you. Choose and add the project license before publishing if your organization requires one.

## Library

Import components from the central library entry point:

```svelte
<script>
	import { Button, Card } from 'fractalsvelte/components';
</script>

<Card>
	<Button>Continue</Button>
</Card>
```

## Motion

The library includes `AnimatedButton`, `AnimatedCard`, `Reveal`, `MotionList`, and `Presence`, powered by [Svelte Motion](https://motion.svelte.page/). Motion defaults respect `prefers-reduced-motion`; shared timings are defined in `src/lib/motion/presets.ts`.

## Styling system

Styles live in `src/lib/styles/`; `token-source.json` is the authoritative value source and `_tokens.sass` is generated from it:

- `token-source.json` defines the raw scale, palette, and mode overrides; `_tokens.sass` is generated from it.
- `_foundations.sass` supplies low-opinion typography and accessibility defaults.
- `_primitives.sass` provides opt-in Container, Stack, Cluster, Grid, Sidebar, Center, and Cover layouts.
- `_contracts.sass` exposes component-level overrides such as `--ui-control-radius`.
- `_mixins.sass` provides shared focus, surface, and form-control recipes.
- `_components.sass` contains every component’s external styles.
- `_docs.sass` styles the documentation application.

Components consume only the supplied raw colour tokens, such as `--theme-color`, `--bg-surface`, and `--border`, so replacing them rethemes the library consistently. Component state and variants use `data-state` and `data-variant` attributes rather than modifier classes. The complete public styling API is documented in [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md).

## Themes

The library is intentionally unopinionated: the supplied raw token schema is its public styling API. Override it globally in your own Sass, or scope a theme to a subtree with `Theme`:

```svelte
<script>
	import { Theme } from 'fractalsvelte/components';

	const tokens = {
		'--theme-color': '#0f766e',
		'--radius-6': '1.5rem'
	};
</script>

<Theme theme="light" {tokens}>
	<!-- any Ember UI components -->
</Theme>
```

The supported token categories cover colors, foreground colors, typography, spacing, border widths, radii, focus rings, and elevation. See `docs/DESIGN-SYSTEM.md` and the live `/components/theme` page for the full contract.

## Verification

```sh
pnpm check
pnpm build
pnpm verify
```
