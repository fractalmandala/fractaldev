<script lang="ts">
	import { onMount } from 'svelte';
	import { presetAxes, presets, initPresets, setPreset } from '../presets.svelte.js';

	let { class: className = '' }: { class?: string } = $props();

	onMount(() => initPresets());

	// Density glyphs — three bars, spread tightest → loosest.
	const spreads: Record<string, number[]> = {
		tight: [5.5, 8.5, 11.5],
		comfortable: [3.5, 8.5, 13.5],
		sprawling: [1.5, 8.5, 15.5]
	};
</script>

<div class="row ycenter gap-8 {className}" role="group" aria-label="Layout density preset">
	{#each presetAxes.layout as layout}
		<button
			type="button"
			class="button ghost"
			class:active={presets.layout === layout}
			aria-pressed={presets.layout === layout}
			title={layout}
			onclick={() => setPreset('layout', layout)}
		>
			<svg width="16" height="16" viewBox="0 0 19 19" aria-hidden="true">
				{#each spreads[layout] as y}
					<rect x="3" {y} width="13" height="2" rx="1" fill="currentColor" />
				{/each}
			</svg>
		</button>
	{/each}
</div>
