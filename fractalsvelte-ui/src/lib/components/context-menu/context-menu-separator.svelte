<script lang="ts">
	let { class: className }: { class?: string } = $props();
</script>

<hr data-slot="context-menu-separator" class={className} />
