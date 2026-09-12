# Scoped themes

`Theme` confines token values to its descendants, making it suitable for product areas, embedded widgets, documentation examples, and independently branded campaigns.

```svelte
<script lang="ts">
	import { Button, Card, Theme } from 'fractalsvelte/components';
</script>

<Theme
	theme="light"
	tokens={{
		'--bg-canvas': '#fff7ed',
		'--bg-surface': '#ffedd5',
		'--text-primary': '#431407',
		'--theme-color': '#c2410c',
		'--theme-color-alt': '#9a3412'
	}}
>
	<Card>
		<h2>Campaign panel</h2>
		<Button>Join now</Button>
	</Card>
</Theme>
```

Use raw tokens from the schema and `--ui-*` variables from the component contract. The wrapper uses `display: contents`, so it does not add a box, spacing, or stacking context.

## Nested scopes

Nested themes inherit outer values and replace only the values they specify. Keep nested scopes small and explicit; a global theme plus one or two product-specific scopes is easier to maintain than many overlapping token overrides.
