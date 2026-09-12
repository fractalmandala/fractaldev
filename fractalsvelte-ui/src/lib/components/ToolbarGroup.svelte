<script lang="ts">
	interface Props {
		label?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { label, class: className = '', children }: Props = $props();
</script>

<div class="k-toolbar-group {className}" role="group" aria-label={label}>
	{@render children?.()}
</div>
