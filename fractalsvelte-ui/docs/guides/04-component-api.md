# Component API documentation

Each component page is the API reference for that component. It contains a live preview, a copy-ready import and usage example, a prop table, and the styling contract. The page is generated from the same catalogue that drives the sidebar, so a component is not considered documented until it has all four pieces.

## Import paths

Use the public package subpath in a consuming project:

```svelte
<script lang="ts">
	import { Button, Card } from 'fractalsvelte/components';
</script>
```

Inside this repository’s documentation app, internal modules use the Kit 3 `#lib` imports map (`#lib/components/index.ts`). A consuming project uses the public package subpath (`fractalsvelte/components`); the package root (`fractalsvelte`) re-exports the same components, and `fractalsvelte/tokens` exposes the typed token schema.

## Prop conventions

The following conventions apply across the catalogue:

| Convention | Meaning |
| --- | --- |
| `children` | Svelte 5 snippet rendered inside a component; use the content between the component tags. |
| `bind:value`, `bind:checked`, `bind:open`, `bind:index`, `bind:current` | Two-way state for the corresponding bindable prop. |
| `variant`, `size`, `padding`, `interactive`, `disabled` | Visual or interaction state reflected in `data-*` attributes or native disabled behavior. |
| `label`, `ariaLabel`, `title`, `description` | Text used for visible or assistive-technology context; supply it when the browser cannot infer a name. |
| `items` | Stable ordered content for list, gallery, carousel, and pattern adapters. Use stable `id` fields where the documented item type requires them. |
| `text` | Display text for typography and text-effect adapters. `label` remains the accessible name when it differs from the visual text. |
| `onclick` | A native mouse click callback on `Button` and `AnimatedButton`; use application state for side effects. |

The live table lists the exact type, default, and behavior for every prop exposed by that page. Snippets and forwarded native attributes are called out in the usage example when a component supports them.

## API checklist

Document every public prop with its TypeScript type, default, and behavior. Include bindable state such as `open`, `checked`, `value`, `index`, and `current`; callback props such as `onclick`; children or snippets; forwarded native attributes; and any browser-only behavior.

## Composition

Prefer native children and snippets over data-only APIs when content needs semantic markup. Use stable IDs for keyed arrays. Keep the component responsible for interaction state and let the consuming project own application state.

## Variants and states

Document every `variant`, `size`, disabled/loading state, selected state, open state, and interactive mode. Visual states are exposed through semantic `data-variant` and `data-state` attributes so consumers can inspect and extend them without modifier-class coupling.

## Pattern-equivalent APIs

Motion Core adapters exported from `fractalsvelte/components` expose `items?: string[]`, `text?: string`, and `label?: string`; their wrapper fixes the `pattern` internally. Canvas adapters use the same optional content props and render a client-safe OGL surface. SvelteBits aliases are named exports of `BitsEffect` and expose `pattern: string`, `category: 'animation' | 'background' | 'component' | 'text'`, `items?: string[]`, `text?: string`, and `label?: string`. The catalogue page shows the exact defaults used by each alias.

These are original, Sass-first equivalents rather than source-library implementations. They preserve the named pattern intent while keeping the public styling contract, colors, and accessibility behavior owned by Fractalsvelte UI.
