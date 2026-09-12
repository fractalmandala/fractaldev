<script lang="ts">
	import { onMount } from 'svelte';
	import { presetAxes, presets, initPresets, setPreset } from '../presets.svelte.js';

	let { class: className = '' }: { class?: string } = $props();

	onMount(() => initPresets());

	// Layer-tint glyphs — one swatch, three intensities (least → most tinted).
	const fills: Record<string, number> = { clean: 0, general: 0.45, vibrant: 1 };
</script>

<div class="row ycenter gap-8 {className}" role="group" aria-label="Color tint preset">
	{#each presetAxes.color as color}
		<button
			type="button"
			class="button ghost"
			class:active={presets.color === color}
			aria-pressed={presets.color === color}
			title={color}
			onclick={() => setPreset('color', color)}
		>
			<svg width="16" height="16" viewBox="0 0 19 19" aria-hidden="true">
				<rect
					x="1.5"
					y="1.5"
					width="16"
					height="16"
					rx="4"
					fill="currentColor"
					fill-opacity={fills[color]}
					stroke="currentColor"
					stroke-width="1.5"
				/>
			</svg>
		</button>
	{/each}
</div>
