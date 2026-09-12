<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		caption?: string;
		wide?: boolean;
		children: Snippet;
	};

	let { caption, wide = false, children }: Props = $props();
</script>

<figure class="acrolls-figure" data-wide={wide ? 'true' : 'false'}>
	{@render children()}
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>
