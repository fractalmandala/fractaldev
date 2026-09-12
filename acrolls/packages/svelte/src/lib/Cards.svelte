<script lang="ts">
	import type { Snippet } from 'svelte';

	// A responsive grid of cards. `columns` caps the desktop column count; the grid
	// collapses to a single column on narrow viewports via CSS. Children are <Card>.
	type Props = {
		columns?: 1 | 2 | 3 | 4;
		children?: Snippet;
	};

	let { columns, children }: Props = $props();
</script>

<div class="acrolls-cards" data-columns={columns}>
	{@render children?.()}
</div>
