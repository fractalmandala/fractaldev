<script lang="ts">
	interface Props {
		label?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { label = 'Toolbar', class: className = '', children }: Props = $props();

	const rootClass = $derived(['k-toolbar', className].filter(Boolean).join(' '));
</script>

<div class={rootClass} role="toolbar" aria-label={label}>
	{@render children?.()}
</div>

<style lang="sass">
.k-toolbar
	display: flex
	align-items: center
	gap: 4px
	padding: 4px
	background: var(--bg-raised)
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
</style>
