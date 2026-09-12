<script lang="ts">
	interface Props {
		label?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { label = 'Toolbar', class: className = '', children }: Props = $props();
</script>

<div class="k-toolbar {className}" role="toolbar" aria-label={label}>
	{@render children?.()}
</div>
