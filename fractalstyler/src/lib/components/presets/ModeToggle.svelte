<script lang="ts">
	import { onMount } from 'svelte';
	import { presets, initPresets, toggleMode } from '$lib/presets/presets.svelte';

	/**
	 * `palettes` — when a theme is applied, swap to its light/dark twin instead
	 * of only flipping the mode. Off by default: plain mode is the common case,
	 * and most palettes have no twin to swap to.
	 */
	let { class: className = '' }: { class?: string; } =
		$props();
	onMount(() => initPresets());
	const dark = $derived(presets.mode === 'dark');
</script>

<button
	type="button"
	class="button is-icon {className}"
	aria-pressed={dark}
	aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
	title={dark ? 'Light mode' : 'Dark mode'}
	onclick={() => (toggleMode())}
>
	<svg width="20" height="20" viewBox="0 0 19 19" aria-hidden="true">
		{#if dark}
			<!-- Sun: filled core, eight rays -->
			<circle cx="9.5" cy="9.5" r="3.75" fill="currentColor" />
			{#each [0, 45, 90, 135, 180, 225, 270, 315] as angle}
				<line
					x1="9.5"
					y1="1.75"
					x2="9.5"
					y2="3.5"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					transform="rotate({angle} 9.5 9.5)"
				/>
			{/each}
		{:else}
			<!-- Moon: one circle bitten by another, as a single path -->
			<path
				d="M13.5 11.9A6.25 6.25 0 0 1 7.1 5.5a6.25 6.25 0 1 0 6.4 6.4Z"
				fill="currentColor"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linejoin="round"
			/>
		{/if}
	</svg>
</button>
