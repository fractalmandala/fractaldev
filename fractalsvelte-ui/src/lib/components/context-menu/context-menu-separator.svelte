<script lang="ts">
	let { class: className }: { class?: string } = $props();
</script>

<hr data-slot="context-menu-separator" class={className} />

<style lang="sass">
[data-slot="context-menu-separator"]
	margin: var(--space-3xs) 0
	height: 1px
	border: 0
	background: var(--border)
</style>
