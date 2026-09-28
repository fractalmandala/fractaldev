<script lang="ts">
	interface Props {
		label?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { label, class: className = '', children }: Props = $props();

	const rootClass = $derived(['k-toolbar-group', className].filter(Boolean).join(' '));
</script>

<div class={rootClass} role="group" aria-label={label}>
	{@render children?.()}
</div>

<style lang="sass">
.k-toolbar-group
	display: inline-flex
	align-items: center
	gap: 4px
	padding-inline: 4px
	border-right: 1px solid var(--border)
	&:last-child
		border-right: none
</style>
