<script lang="ts">
	import { onMount } from 'svelte';
	import { presetAxes, presets, initPresets, setPreset } from '$lib/presets/presets.svelte';

	let { class: className = '' }: { class?: string } = $props();

	onMount(() => initPresets());

	// Density glyphs — three bars, spread tightest → loosest.
	const spreads: Record<string, number[]> = {
		zero: [0,1,0],
		tight: [5.5, 8.5, 11.5],
		comfortable: [3.5, 8.5, 13.5],
		sprawling: [1.5, 8.5, 15.5]
	};
</script>

<div class="box {className}" role="group" aria-label="Layout density preset">
	{#each presetAxes.layout as layout}
		<button
			type="button"
			class="button small bord0"
			class:active={presets.layout === layout}
			aria-pressed={presets.layout === layout}
			title={layout}
			onclick={() => setPreset('layout', layout)}
		>
			<span class="text-sm tt-u">{layout}</span>
		</button>
	{/each}
</div>
