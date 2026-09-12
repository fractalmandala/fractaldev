# Quick start

This example creates a small, themed page using the public component and layout APIs.

```svelte
<script lang="ts">
	import { Button, Card, Theme } from 'fractalsvelte/components';

	const productTokens = {
		'--theme-color': '#2563eb',
		'--theme-color-alt': '#1d4ed8',
		'--radius-6': '10px'
	};
</script>

<Theme theme="light" tokens={productTokens}>
	<section class="ui-container ui-stack" style="--stack-space: var(--space-l)">
		<header class="ui-stack" style="--stack-space: var(--space-xs)">
			<h1>Project settings</h1>
			<p>Use Fractalsvelte UI primitives without inheriting a brand.</p>
		</header>
		<Card>
			<div class="ui-cluster" style="--cluster-justify: space-between">
				<strong>Workspace</strong>
				<Button>Save changes</Button>
			</div>
		</Card>
	</section>
</Theme>
```

The component pages under `/components` show the same pattern with live controls, complete metadata, and copy-ready examples.

## Next steps

Start with [Token reference](09-token-reference.md) if you need to replace the complete visual language. Start with [Theming quick start](10-theming-quick-start.md) if you only need an accent or scoped theme.
