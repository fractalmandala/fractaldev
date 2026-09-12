<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Horizontal track that spans the frame. Use for graphs that represent
	 * a range (meter, stack, bullet, rank) — pair with GraphTick so ticks
	 * flex edge to edge. Packed graphs (spark, bars, cells, uptime) should
	 * not use tracks.
	 */
	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<span class="track {className}" aria-hidden="true">
	{@render children?.()}
</span>

<style>
	.track {
		display: flex;
		width: 100%;
		min-width: 0;
		user-select: none;
	}
</style>
