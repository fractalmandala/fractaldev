<script lang="ts">
	import type { Snippet } from 'svelte';

	/** One glyph on a GraphTrack: flexes to fill, stays 1ch wide, centered. */
	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<span class="tick {className}">
	{@render children?.()}
</span>

<style>
	.tick {
		flex: 1 1 0%;
		min-width: 1ch;
		text-align: center;
	}
</style>
