# Troubleshooting and FAQ

Use this guide when installation, Sass compilation, hydration, theming, or an effect does not behave as expected. Start by running `pnpm verify`; it identifies token drift, forbidden color aliases, accessibility-contract regressions, package-export failures, and SvelteKit 3 migration-contract failures.

## The package cannot be found

This repository is not currently a registry release. Link the checkout from the consuming project:

```sh
pnpm add ../fractalcodex
```

Then import from `fractalsvelte/components` and `fractalsvelte/styles/system`. If you installed a published package under a different name, replace `fractalsvelte` in both imports with that package name.

## Sass cannot resolve the system entrypoint

Import the public entrypoint, not a private partial:

```sass
@use 'fractalsvelte/styles/system'
```

Make sure `sass` is installed in the consuming project and that the package was linked with pnpm rather than copied without its `styles/` directory. Do not import `_tokens.sass`, `_components.sass`, or another partial directly; the supported order is defined by `system.sass`.

## Components render without their styles

Import the system once from the root layout or global Sass file. A component import alone does not inject CSS:

```svelte
<script lang="ts">
	import 'fractalsvelte/styles/system.sass';
	import { Button } from 'fractalsvelte/components';
</script>
```

Do not import `global.sass` in a product application unless you also want the documentation UI styles.

## A custom color or radius has no effect

Set the source token, not a removed alias. The permitted palette includes `--bg-*`, `--text-*`, `--state-*`, `--border`, `--border-subtle`, `--theme-color`, `--theme-color-alt`, `--theme-color`, `--theme-color-alt`, and `--ring`. For example:

```sass
:root
	--theme-color: #7c3aed
	--theme-color-alt: #6d28d9
	--radius-6: 12px
```

For one subtree, pass the same names to `Theme`. Component geometry belongs in the documented `--ui-*` contract variables; do not invent a second color-token vocabulary.

## Dark mode changes the root but not a scoped area

Set `theme="light"` or `theme="dark"` only when the scope must be explicit. Use `theme="system"` to inherit the nearest document or operating-system mode. The wrapper uses `display: contents`, so it does not add a layout box. Verify that the mode is set on `<html>` before hydration and mirrored to `<body>` if body selectors or native controls depend on it.

## The page flashes the wrong mode on load

Read the stored mode in the pre-hydration script in `src/app.html`, set `data-theme`, `data-mode`, and `color-scheme` on `<html>`, and mirror those values to `<body>` as soon as the body exists. The hydrated setter may update storage afterward; it must not be the first place the mode is applied.

## The theme setter does not show a background

The drawer lazy-loads Aura, Gradient, and Pattern data when their tab opens. Keep the tab open until its loading state finishes. A persisted background is only an ID selection, so remove an invalid `fractalsvelte.background` value from storage or select **Plain** to reset it.

## An Aura, Gradient, or Pattern is too low contrast

Background classification only controls the default filter. It does not guarantee contrast. Select **All modes**, then check text, controls, borders, and focus against the final background. Provide a readable foreground token or choose a different background when the effect is decorative.

## Motion or canvas effects do not animate

Check `prefers-reduced-motion`, the `MotionConfig reducedMotion="user"` boundary, and whether the effect is mounted in a browser-safe lifecycle. WebGL effects also require a measurable container and a browser WebGL context. Keep the semantic content useful when motion or WebGL is unavailable.

## What should be reported as a bug?

Include the package version or checkout revision, Node and pnpm versions, the component and props, the active mode/theme/background, and the output of `pnpm verify`. For visual issues, include a reduced reproduction that imports only `system.sass` and the affected component.

## Next steps

Return to [Installation and setup](01-installation-and-setup.md), [Token reference](09-token-reference.md), [Light and dark mode](11-light-dark-mode.md), [SvelteKit 3 migration](23-sveltekit-3-migration.md), or [Accessibility](19-accessibility.md) for the full contract behind the fix.
