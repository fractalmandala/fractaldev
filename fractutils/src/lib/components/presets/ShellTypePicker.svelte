<script lang="ts">
	import { onMount } from 'svelte';
	import { presetAxes, presets, initPresets, setPreset } from '$lib/ui/presets.svelte';

	let { class: className = '' }: { class?: string } = $props();

	onMount(() => initPresets());

	// Labels for the featural shell compositions. The value itself is readable
	// (l = nav, r = TOC, f = footer, a = app-content article); these are the
	// friendly names for the picker.
	const shellLabels: Record<string, string> = {
		lrf: 'Full',
		lrfa: 'Docs',
		lr: 'No Footer',
		lra: 'Docs, No Footer',
		lf: 'No TOC',
		l: 'Nav Only',
		f: 'No Rails',
		c: 'Bare'
	};
</script>

<div class="box {className}" role="group" aria-label="Shell composition preset">
	{#each presetAxes.shell as shell}
		<button
			type="button"
			class="button small bord0"
			class:active={presets.shell === shell}
			aria-pressed={presets.shell === shell}
			title={shellLabels[shell] ?? shell}
			onclick={() => setPreset('shell', shell)}
		>
			<span class="text-sm tt-u">{shellLabels[shell] ?? shell}</span>
		</button>
	{/each}
</div>
