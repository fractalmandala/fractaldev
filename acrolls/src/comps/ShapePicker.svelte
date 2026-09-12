<script lang="ts">
	import { onMount } from 'svelte';
	import { presetAxes, presets, initPresets, setPreset } from '../presets.svelte.js';

	let { class: className = '' }: { class?: string } = $props();

	onMount(() => initPresets());

	// Corner glyphs — one square, four geometries; rx mirrors the sm channel.
	const glyphs: Record<string, number> = { sharp: 0, pro: 4, curved: 8, round: 16 };
</script>

<div class="row ycenter gap-8 {className}" role="group" aria-label="Corner shape preset">
	{#each presetAxes.shape as shape}
		<button
			type="button"
			class="button ghost"
			class:active={presets.shape === shape}
			aria-pressed={presets.shape === shape}
			title={shape}
			onclick={() => setPreset('shape', shape)}
		>
			<svg width="16" height="16" viewBox="0 0 19 19" aria-hidden="true">
				<rect
					x="1.5"
					y="1.5"
					width="16"
					height="16"
					rx={glyphs[shape]}
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				/>
			</svg>
		</button>
	{/each}
</div>
