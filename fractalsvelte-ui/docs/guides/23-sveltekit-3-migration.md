# SvelteKit 3 migration

This repository’s documentation application is configured for the SvelteKit 3 prerelease contract. The component package remains framework-light: its public Svelte components, Sass entrypoints, token schema, themer, and motion wrappers can be consumed by a Svelte application or a SvelteKit host without adding a Kit adapter.

## Release status and version floor

At the time this migration was implemented, the npm registry did not expose a stable `@sveltejs/kit@3` release. The verified branch therefore pins the prerelease toolchain below:

| Package | Version |
| --- | --- |
| `@sveltejs/kit` | `3.0.0-next.25` |
| `@sveltejs/adapter-auto` | `8.0.0-next.3` |
| `@sveltejs/vite-plugin-svelte` | `7.3.0` |
| `svelte` | `^5.56.4` |
| `vite` | `8.2.2` |
| `typescript` | `6.0.3` |
| Node.js | `>=22.17.0` |

When adopting a stable Kit 3 release, update these pins together, read its release notes, and rerun every verification command. If your host must stay on stable Kit 2, consume the published component package from a Kit 2 application and do not copy this repository’s Kit 3 Vite configuration into that host.

## What changed

The migration follows the [official SvelteKit 3 migration guide](https://next.svelte.dev/docs/kit/migrating-to-sveltekit-3):

- Kit is configured through `sveltekit({ adapter: adapter() })` in `vite.config.ts`.
- `svelte.config.js` and `svelte.config.ts` are not used.
- Internal source imports use the package `imports` map: `#lib` and `#lib/*`, with explicit `.ts`, `.svelte`, `.sass`, or `.json` extensions.
- `tsconfig.json` extends `$app/tsconfig` and declares explicit include/exclude arrays.
- Server route loaders use generated `PageServerLoad` types from each route’s `$types` module; guide and component code highlighting therefore stays out of the browser bundle.
- The codebase contains no `$app/stores`, `$service-worker`, or executable `$lib` imports.
- The Sass-first token, foundation, semantic, layout, component-contract, theme, and motion layers remain unchanged and are still imported through `src/lib/styles/system.sass`.
- Shiki highlights guide fences and component usage examples on the server with paired light/dark token variables; the browser receives already-highlighted, escaped HTML.

The `$lib` text in catalogue usage snippets is a documentation placeholder only. `ComponentPreview` rewrites it to `fractalsvelte/components` before rendering the copy-ready example; it is not an application import.

## Host configuration

Use the following minimal Vite configuration in a Kit 3 application:

```ts
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({ adapter: adapter() })]
});
```

Do not create a second `svelte.config` file. Select a deployment adapter explicitly for production when `adapter-auto` cannot infer the target. The package itself does not choose or install a host adapter.

## Imports and TypeScript

Inside this repository, write internal imports like:

```ts
import { componentBySlug } from '#lib/docs/catalogue.ts';
import type { PageLoad } from './$types';
```

In a consuming project, use the public package exports instead:

```ts
import { Button, Theme } from 'fractalsvelte/components';
import 'fractalsvelte/styles/system.sass';
```

The `#lib` map is private to this package and is included so Kit 3 can resolve this source-oriented documentation application. It is not a replacement for the public `fractalsvelte/*` package exports.

## Code highlighting

The documentation app uses the server-only `src/lib/docs/shiki.server.ts` highlighter. Guide Markdown is parsed by `markdown.server.ts`, which preserves the declared fence language (`svelte`, `ts`, `sass`, `sh`, and the supported aliases) and passes each block to Shiki. Component usage examples use the same highlighter with the `svelte` grammar. Unknown languages remain safe escaped text instead of failing a page render.

Shiki emits paired `--shiki-light` and `--shiki-dark` values. The documentation code surface intentionally uses `--bg-terminal`, a dark terminal surface in both appearance modes, so `_docs.sass` selects the dark Shiki token set in both `data-mode` values for reliable contrast. The surface itself continues to use `--bg-terminal`, `--text-inverse`, and the normal border tokens. Do not hard-code a second syntax-colour palette in a component or Markdown page.

## Themer, SSR, and browser safety

Keep the existing pre-hydration appearance bootstrap in `src/app.html`. It sets the saved mode, theme family, background identifier, and `color-scheme` on `<html>` and mirrors the values to `<body>` before hydration. The hydrated `ThemeSetter` may then update local storage and the document safely from `onMount`/effects.

Do not read `window`, `document`, `localStorage`, `matchMedia`, `performance`, `requestAnimationFrame`, WebGL, or MediaPipe during module evaluation or server rendering. The library’s theme setter, counter, text loop, canvas wrappers, and OGL/MediaPipe effects already keep those reads in browser-only lifecycle code. Preserve that boundary when adding components.

## Sass and package compatibility

Continue importing one public Sass entrypoint from the host root layout or global Sass file:

```sass
@use 'fractalsvelte/styles/system'
```

Do not import private Sass partials. The package’s `exports` map remains the source of truth for components, tokens, styles, and the system/global Sass entrypoints. The package uses only the documented raw palette and `--ui-*` geometry contract, so Kit migration does not change theme customization.

## Verification sequence

Run this sequence from the repository root after every Kit or Vite upgrade:

```sh
pnpm install
pnpm check
pnpm kit3:check
pnpm verify:style
pnpm a11y:check
pnpm docs:check
pnpm package:check
pnpm build
```

`pnpm verify` runs the complete sequence except the final standalone build. `pnpm kit3:check` is a static guard for the config shape, version floor, imports map, typed route loads, and removed APIs. `pnpm package:check` packs the source-oriented package into a temporary external consumer and compiles its Sass entrypoint.

For a host application, also test SSR and browser behavior in both modes: saved light/dark mode before hydration, `ThemeSetter` drawer and background tabs, scoped `Theme`, reduced motion, keyboard focus, and every browser-only canvas/effect fallback.

## Rollback

If the target deployment cannot use Kit 3 yet, create a separate compatibility branch from the pre-migration commit, restore the matching stable Kit 2 dependencies and `svelte.config.js`, and keep the component package exports unchanged. Do not partially roll back only Vite or only TypeScript: the Kit, Vite plugin, Vite, TypeScript, Node, config ownership, alias policy, and route typing changes form one versioned contract.
