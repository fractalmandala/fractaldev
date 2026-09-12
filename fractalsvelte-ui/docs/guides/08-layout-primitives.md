# Layout primitives

Layout primitives are opt-in classes. They do not add product colours or component decoration; each measurement can be overridden through a local custom property.

| Primitive | Purpose | Local variables |
| --- | --- | --- |
| `.ui-container` | Center a readable content measure | `--container-gutter`, `--container-measure` |
| `.ui-stack` | Vertical flow with a consistent gap | `--stack-space` |
| `.ui-cluster` | Wrapping horizontal groups | `--cluster-space`, `--cluster-align`, `--cluster-justify` |
| `.ui-grid` | Responsive auto-fit grid | `--grid-min`, `--grid-gap` |
| `.ui-sidebar` | Sidebar plus content grid | `--sidebar-size`, `--sidebar-gap`, `--sidebar-align` |
| `.ui-center` | Center content in a grid | `--center-place`, `--center-min-block-size` |
| `.ui-cover` | Full-block cover layout with centered body | `--cover-min-block-size`, `--cover-padding` |

The defaults are intentionally predictable: container gutter `var(--space-m)`, container measure `var(--measure)`, stack gap `var(--space-m)`, cluster gap `var(--space-xs)`, grid minimum `16rem`, grid gap `var(--space-m)`, sidebar size `20rem`, sidebar gap `var(--space-l)`, and cover minimum block size `100dvb`. Set only the local variables you need.

```svelte
<main class="ui-container ui-stack" style="--stack-space: var(--space-l)">
	<header class="ui-cluster" style="--cluster-justify: space-between">
		<h1>Projects</h1>
		<Button>Add project</Button>
	</header>
	<div class="ui-grid" style="--grid-min: 18rem">
		<Card>One</Card>
		<Card>Two</Card>
	</div>
</main>
```

At widths below `48rem`, `.ui-sidebar` collapses to one column.

Primitives are classes rather than Svelte components, so they can wrap native elements or Fractalsvelte UI components without changing the component API. They do not define colors, borders, shadows, or z-index values.
