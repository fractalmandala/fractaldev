<script lang="ts">
	interface Props {
		cite?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { cite, class: className = '', children }: Props = $props();
</script>

<blockquote class="k-blockquote {className}">
	{@render children?.()}
	{#if cite}<cite class="k-blockquote-cite">— {cite}</cite>{/if}
</blockquote>
