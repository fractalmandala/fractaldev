# Installation and setup

Fractalsvelte UI is a source-oriented package with public component, token, and Sass exports. This repository is the installable source until a registry release is published, so choose the repository/workspace path below or substitute the published package version when one is available.

## Workspace setup

Use pnpm 11 and Node.js 22.17 or newer. SvelteKit 3 also requires Svelte 5.56.4 or newer. From the repository root:

```sh
pnpm install
pnpm check
pnpm dev
```

The documentation application runs at the URL printed by Vite.

The documentation shell uses SvelteKit's `tap` data-preload policy. Routes are prefetched after an intentional link activation rather than on pointer hover, so large component indexes do not flood the dev server with requests for every page. Set `data-sveltekit-preload-data="hover"` on a smaller subtree only when hover preloading is useful there.

This checkout tracks the SvelteKit 3 prerelease while Kit 3 is being finalized. The verified toolchain is pinned in `package.json`: `@sveltejs/kit` `3.0.0-next.25`, `@sveltejs/vite-plugin-svelte` `7.3.0`, Vite `8.2.2`, and TypeScript `6.0.3`. Use the same floors in a host application, or stay on the latest stable SvelteKit 2 release until Kit 3 is stable.

## Add the package to a consuming project

From another pnpm workspace, link the checkout with a relative path. This creates a normal package dependency and lets the consumer use the same public exports as a registry install:

```sh
pnpm add ../fractalcodex
```

If the consumer is not a workspace, use the absolute checkout path instead:

```sh
pnpm add file:/Users/you/projects/fractalcodex
```

The package name is `fractalsvelte`. If your workspace aliases it, use the alias in the imports below.

## Required runtime dependencies

The component source uses Svelte 5, Sass, and Svelte Motion. The canvas catalogue also uses OGL and MediaPipe Tasks Vision. Install the dependencies in the consuming workspace, or keep them available through the workspace package:

```sh
pnpm add svelte @humanspeak/svelte-motion ogl @mediapipe/tasks-vision
pnpm add -D sass
```

`svelte` is a peer dependency. `@humanspeak/svelte-motion` is required by the motion components, and `ogl` plus `@mediapipe/tasks-vision` are required by the canvas catalogue/effect paths. Use only the components your application needs if you want to avoid loading browser-only effects. You still need `sass` anywhere you compile the Sass entrypoint.

## Import the Sass system

Import the library entry point once from the consuming app’s global Sass entry:

```sass
@use 'fractalsvelte/styles/system'
```

The package also exposes `fractalsvelte/components`, `fractalsvelte/tokens`, and `fractalsvelte/styles` for modern package-aware tooling. The Sass subpaths `fractalsvelte/styles/system.sass` and `fractalsvelte/styles/global.sass` are also available. The entrypoints are explicit so consumers do not depend on private partial filenames.

If your bundler imports Sass from JavaScript instead of an app-level Sass file, import the same entrypoint once from the root layout:

```svelte
<script lang="ts">
	import 'fractalsvelte/styles/system.sass';
</script>
```

Do not import both forms in the same application; duplicate imports are unnecessary.

The current source workspace uses:

```sass
@use 'system'
@use 'docs'
```

Do not import `_components.sass` directly. `system.sass` establishes tokens, foundations, primitives, contracts, mixins, and component styles in the supported order.

## SvelteKit integration

Import the system stylesheet once from the root layout before rendering library components. If the application also owns documentation-only styles, use `global.sass` instead; it includes the system plus the docs surface. If you persist appearance preferences, add the pre-hydration bootstrap described in [Light and dark mode](11-light-dark-mode.md).

The library does not require a SvelteKit adapter, a router, or a provider. `ThemeSetter` is an optional reference UI; ordinary components only need the Sass system and the component package.

### SvelteKit 3 host configuration

Kit 3 owns its configuration in the SvelteKit Vite plugin. Do not add `svelte.config.js` or `svelte.config.ts`; configure the adapter in `vite.config.ts`:

```ts
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({ adapter: adapter() })]
});
```

Kit 3 replaces the `$lib` source alias with the package `imports` map. In this repository, internal source modules use `#lib` with explicit file extensions; consuming applications should use the published `fractalsvelte/*` exports. See [SvelteKit 3 migration](23-sveltekit-3-migration.md) for the complete host audit.

## Confirm the installation

Render one semantic control and one themed surface before adding application code:

```svelte
<script lang="ts">
	import { Button, Card } from 'fractalsvelte/components';
</script>

<Card>
	<h1>Fractalsvelte UI is connected</h1>
	<Button>Continue</Button>
</Card>
```

If this renders without an unresolved Sass import or missing peer dependency, continue with [Quick start](02-quick-start.md). If it fails, see [Troubleshooting](22-troubleshooting.md).
