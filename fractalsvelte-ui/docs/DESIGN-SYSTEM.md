# Fractalsvelte UI Design System

Fractalsvelte UI is a SvelteKit component library with an unopinionated raw-token styling contract. Its documentation application is the primary component reference: start the dev server and open `/components/<component-name>` for a live, interactive preview, a prop table, and a copy-ready usage example for every catalogue entry. Cross-project adoption guides are available at `/guides` and in `docs/guides`.

## Style architecture

All authored styles use tab-indented Sass; the project intentionally has no authored `.css` or `.scss` files.

| Layer | Source | Responsibility |
| --- | --- | --- |
| Token schema | `src/lib/styles/tokens.schema.ts` | Typed inventory of the public CSS-property vocabulary |
| Raw tokens | `src/lib/styles/token-source.json`, generated `_tokens.sass` | Authoritative token defaults and generated runtime Sass |
| Foundation | `src/lib/styles/_base.sass`, `_foundations.sass` | Reset, native-control defaults, typography, media, and reduced motion |
| Layout primitives | `src/lib/styles/_primitives.sass` | Opt-in Container, Stack, Cluster, Grid, Sidebar, Center, and Cover layouts |
| Component contracts | `src/lib/styles/_contracts.sass` | Stable `--ui-*` component override variables |
| Recipes | `src/lib/styles/_mixins.sass` | Shared `focus-ring`, `control`, and `surface` behavior |
| Components | `src/lib/styles/_components.sass` | Component classes and attribute-based states |
| Documentation UI | `src/lib/styles/_docs.sass` | Docs shell, examples, code blocks, and prop tables |

`src/lib/styles/system.sass` is the portable library entry point; `global.sass` imports it for the documentation application. Individual `.svelte` files contain no component style blocks. The package exposes source-oriented component, token, and Sass exports; see [`docs/guides/01-installation-and-setup.md`](guides/01-installation-and-setup.md) for workspace and release usage. Documentation code fences and component usage examples are highlighted server-side by Shiki and rendered with paired light/dark token variables.

### Public package surface

| Import | Contents | Use it for |
| --- | --- | --- |
| `fractalsvelte` | Root re-export of components and styles | A single package import in a typed consumer. |
| `fractalsvelte/components` | All Svelte components and `ThemeTokens` | Component imports. |
| `fractalsvelte/styles` | Typed style exports | Token metadata and style helpers. |
| `fractalsvelte/styles/system.sass` | Portable Sass system | Product applications. |
| `fractalsvelte/styles/global.sass` | System plus documentation UI styles | This repository’s docs surface only. |
| `fractalsvelte/tokens` | Token names, defaults, metadata, and guards | Typed theme editors and validation. |

The local package is source-oriented: Vite/SvelteKit compiles the shipped TypeScript and Sass files. A registry consumer should use the published version when one exists and keep the same subpaths.

## Tokens

### Raw layer

The supplied custom-property names are the public token schema. Their shipped values are defaults only: consuming projects own their visual language by replacing values, not component source. `token-source.json` is authoritative; run `pnpm tokens:generate` after changing it and use `pnpm verify:style` to detect drift.

- Fonts: `--font-sans`, `--font-mono`
- Type scale: `--text-xs` through `--text-4xl`
- Space scale: `--space-3xs`, `--space-2xs`, `--space-xs`, `--space-s`, `--space-m`, `--space-l`, `--space-xl`, `--space-2xl`, `--space-3xl`
- Radius scale: `--radius-0`, `--radius-2`, `--radius-3`, `--radius-4`, `--radius-6`, `--radius-8`, `--radius-12`, `--radius-16`, `--radius-24`, `--radius-full`
- Controls and elevation: `--control-h-s`, `--control-h-m`, `--control-h-l`, `--shadow-s`, `--shadow-m`, `--shadow-l`
- Layering and layout: `--z-base`, `--z-raised`, `--z-sticky`, `--z-modal`, `--z-toast`, `--header-height`, `--footer-height`, `--measure`
- Structure: `--border-width`, `--border-emphasis-width`, `--focus-ring-width`
- Raw palette: supplied `--bg-*`, `--text-*`, `--state-*`, `--border*`, `--theme-color*`, and `--ring` variables

Spacing runs two parallel systems: the named scale (`3xs`–`3xl`) and direct pixel values — unitless mixin numbers are pixels (`+gap(16)` = `16px`) and numeric utility classes (`gap-4` … `gap-48`) cover the common steps. Dark-mode values are selected by explicit `data-theme` attributes, with `prefers-color-scheme` as the no-explicit-mode fallback. Components never need a separate dark-mode branch.

### Colour contract

The raw palette is the only permitted colour-token contract. Components use `--bg-*` for surfaces, `--text-*` for foregrounds, `--border*` for boundaries, `--state-*` for interaction states, `--theme-color` / `--theme-color-alt` for emphasis, and `--ring` for visible focus. Component styles do not depend on `--color-*` aliases.

Theme Fractalsvelte UI by overriding the supplied values in your application, for example:

```sass
:root
	--theme-color: #0f766e
	--theme-color-alt: #115e59
```

### Scoped themes

Use the `Theme` component to confine a token set to a subtree without adding visual layout of its own. Its `tokens` prop accepts any CSS custom property, so users can replace colors, font stacks, spacing, borders, radii, or elevation on only the components they choose.

```svelte
<script>
	import { Theme } from 'fractalsvelte/components';

	const campaignTheme = {
		'--theme-color': '#b45309',
		'--theme-color-alt': '#92400e',
		'--radius-6': '0',
		'--ui-card-shadow': 'none'
	};
</script>

<Theme theme="dark" tokens={campaignTheme}>
	<!-- Fractalsvelte UI components inherit these values -->
</Theme>
```

`theme` can be `system`, `light`, or `dark`; explicit values take precedence over the operating-system preference. The listed raw palette is the stable public contract.

### Theme setter interface

The documentation shell includes a global light/dark switch in the header and a responsive right-side Theme setter. Presets are normalised into light/dark families: native pairs are retained and a coordinated surface counterpart is generated for any one-sided source theme while preserving its accent pair. The drawer composes a family, a preset-or-custom `--theme-color` / `--theme-color-alt` pair, and one background selection. Aura selections use their explicit `dark` flag; gradient and pattern backgrounds are classified from their supplied colour values and default to the active mode, with an All modes option always available. Aura selections render every supplied layer independently with its blend mode, opacity, and responsive blur. Gradients apply their `css` value as `background`; patterns preserve their supported `background*` declarations, including `backgroundImage` and `backgroundSize`.

The large Aura, Gradient, and Pattern catalogues are loaded only when their corresponding tab is opened, so the documentation home page does not eagerly download preview-only data.

## Typed token schema

`src/lib/styles/tokens.schema.ts` exports `tokenGroups`, `TokenName`, `ThemeTokenName`, `TokenValueKind`, `tokenDefaults`, `darkTokenDefaults`, `publicTokenNames`, `tokenMetadata`, `tokenMetadataByName`, and public-name guards. `ThemeTokenName` covers the supplied raw vocabulary plus every `--ui-*` component contract variable, so scoped themes can be checked without preventing deliberate component extensions.

```ts
import type { ThemeTokens } from 'fractalsvelte/components';

const tokens: ThemeTokens = {
	'--theme-color': 'rebeccapurple',
	'--radius-6': '0',
	'--ui-control-height': '44px'
};
```

## Layout primitives

The layout layer is opt-in and has no colour or component styling. Every measurement is a local custom-property override.

```svelte
<section class="ui-container ui-stack" style="--stack-space: var(--space-xl)">
	<header class="ui-cluster" style="--cluster-justify: space-between">
		<slot name="title" />
		<slot name="actions" />
	</header>
	<div class="ui-grid" style="--grid-min: 18rem">
		<slot />
	</div>
</section>
```

| Primitive | Local overrides |
| --- | --- |
| `.ui-container` | `--container-gutter`, `--container-measure` |
| `.ui-stack` | `--stack-space` |
| `.ui-cluster` | `--cluster-space`, `--cluster-align`, `--cluster-justify` |
| `.ui-grid` | `--grid-min`, `--grid-gap` |
| `.ui-sidebar` | `--sidebar-size`, `--sidebar-gap`, `--sidebar-align` |
| `.ui-center` | `--center-place`, `--center-min-block-size` |
| `.ui-cover` | `--cover-min-block-size`, `--cover-padding` |

### Documentation shell layout

The documentation application uses a separate responsive shell in `src/lib/styles/_docs.sass`. `.site-body` is a full-width grid with `280px` navigation and a fluid content track, using `32px` inline padding. On component and guide detail pages, `.site-main` becomes a nested article/TOC grid: `.site-article` is the fluid article track and `.site-toc` is a sticky `280px` right rail at widths of `1281px` and above. From `1280px` down, the TOC becomes a top disclosure; below `1025px`, `.site-sidebar` is hidden and the header's `.mobile-nav` provides the navigation. `.component-doc` and `.guide-doc` retain a centered `650px` reading measure inside the article track.

## Component contract layer

`--ui-*` variables are stable implementation seams. Set them on a `Theme`, a parent, or an individual component to tune density and shape without selector overrides.

```svelte
<Theme tokens={{
	'--ui-control-height': '44px',
	'--ui-control-radius': '0',
	'--ui-card-radius': '0',
	'--ui-card-shadow': 'none'
}}>
	<!-- components inherit the contract -->
</Theme>
```

The contract includes control geometry and transitions, field padding, button and badge geometry, alert and form indicators, switch and avatar sizing, progress and stepper geometry, card and popover surfaces, focus geometry, and overlay stacking. See `docs/guides/16-component-contracts.md` for the complete list. Colour continues to come only from the raw palette.

## Component state contract

Visual variants use semantic attributes, never modifier classes. This keeps markup state readable and keeps selectors flat:

```svelte
<Button data-variant="primary">Save</Button>
<button class="ui-tabs__tab" data-state="active">Overview</button>
```

The public Svelte API exposes these states as props, such as `<Button variant="primary">` and `<Tabs bind:active>`. The attributes above show the underlying styling contract.

## Component registry

| Group | Components |
| --- | --- |
| Actions | Button |
| Inputs | Input, Textarea, Checkbox, Switch, Select |
| Feedback | Badge, Alert, Progress, Skeleton, Toast |
| Layout | Avatar, Card, Accordion, Tabs, Separator |
| Overlay | Dialog, Tooltip |
| Motion | Animated Button, Animated Card, Reveal, Motion List, Presence, Magnetic, Text Loop, Marquee, Counter, Bits Effect |
| Foundation | Theme, Theme Setter |
| Additional layout | Carousel, Stepper |

All components are exported from `src/lib/components/index.ts`. The canonical documentation metadata is in `src/lib/docs/catalogue.ts`; its one entry per component provides the description, all documented props, and usage example used at runtime by `/components/[slug]`.

## Accessibility baseline

- Button, input, select, textarea, checkbox, switch, details, dialog, and progress use their appropriate native semantics.
- Keyboard-visible focus treatment is supplied by the shared `focus-ring` mixin.
- Dialog uses a native `<dialog>`, gives its title an `aria-labelledby` relationship, and synchronizes native close/Escape behavior to the bindable `open` prop.
- Decorative skeletons expose a loading label, and feedback components use status roles.
- Tooltip content opens from hover and focus within its child control.
- The app root uses Svelte Motion’s `MotionConfig reducedMotion="user"`, which removes transform movement when the OS motion preference requests it.
- Marquee stops under `prefers-reduced-motion`; Text Loop does not start its interval when reduced motion is requested.
- Carousel has labelled previous/next controls, while Stepper expresses current progress with `aria-current="step"`.

## Adding a component

1. Create `src/lib/components/Example.svelte`, using Svelte 5 runes and semantic `data-state`/`data-variant` props where applicable.
2. Add external styles in `src/lib/styles/_components.sass`; use semantic tokens and shared mixins.
3. Export it from `src/lib/components/index.ts`.
4. Add an entry to `src/lib/docs/catalogue.ts` containing a description, every prop, default values, and a usage string.
5. Add a matching interactive branch to `src/lib/components/ComponentPreview.svelte`.
6. Run `pnpm verify` and `pnpm build`.
