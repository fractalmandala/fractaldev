<script lang="ts">
	interface Props {
		/** Number of columns on wide screens. */
		cols?: 1 | 2 | 3 | 4;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { cols = 1, class: className = '', children }: Props = $props();
</script>

<div class="k-grid {className}" data-cols={cols} style="--k-grid-gap: var(--space-m)">
	{@render children?.()}
</div>
