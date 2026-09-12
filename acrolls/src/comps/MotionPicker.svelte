<script lang="ts">
	import { onMount } from 'svelte';
	import { presetAxes, presets, initPresets, setPreset } from '../presets.svelte.js';

	let { class: className = '' }: { class?: string } = $props();

	onMount(() => initPresets());

	// Energy glyphs — one arc, four amplitudes (still → liveliest overshoot).
	const arcs: Record<string, number> = { reduced: 0, heavy: 4, active: 8, springy: 12 };
</script>

<div class="row ycenter gap-8 {className}" role="group" aria-label="Motion energy preset">
	{#each presetAxes.motion as motion}
		<button
			type="button"
			class="button ghost"
			class:active={presets.motion === motion}
			aria-pressed={presets.motion === motion}
			title={motion}
			onclick={() => setPreset('motion', motion)}
		>
			<svg width="16" height="16" viewBox="0 0 19 19" aria-hidden="true">
				<path
					d="M3 15 Q9.5 {15 - arcs[motion]} 16 15"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
		</button>
	{/each}
</div>
