<script lang="ts">
	interface Props {
		/** Number of columns on wide screens. */
		cols?: 1 | 2 | 3 | 4;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { cols = 1, class: className = '', children }: Props = $props();

	const rootClass = $derived(['k-grid', className].filter(Boolean).join(' '));
</script>

<div class={rootClass} data-cols={cols} style="--k-grid-gap: var(--space-md)">
	{@render children?.()}
</div>

<style lang="sass">
.k-grid
	display: grid
	gap: var(--k-grid-gap, var(--space-sm))
	grid-template-columns: 1fr
	&[data-cols='2']
		grid-template-columns: repeat(2, minmax(0, 1fr))
	&[data-cols='3']
		grid-template-columns: repeat(3, minmax(0, 1fr))
	&[data-cols='4']
		grid-template-columns: repeat(4, minmax(0, 1fr))
	@media (max-width: 900px)
		&[data-cols='3'], &[data-cols='4']
			grid-template-columns: repeat(2, minmax(0, 1fr))
	@media (max-width: 560px)
		&[data-cols='2'], &[data-cols='3'], &[data-cols='4']
			grid-template-columns: 1fr
</style>
