<script lang="ts">
	import { onMount } from 'svelte';
	import { presetAxes, presets, initPresets, setPreset } from '$lib/presets/presets.svelte';
	import DropdownMenu from '../ui/DropdownMenu.svelte';

	let { class: className = '' }: { class?: string } = $props();

	onMount(() => initPresets());

	// Labels for the featural shell compositions. The value itself is readable
	// (l = nav, r = TOC, f = footer, a = app-content article); these are the
	// friendly names for the picker.
	const shellLabels: Record<string, string> = {
		lrf: 'lrf - Full',
		lrfa: 'lrfa - Docs',
		lr: 'lr - No Footer',
		lra: 'lra - Docs, No Footer',
		lf: 'lf - No TOC',
		lfa: 'lfa - No TOC, tight',
		l: 'l - Nav Only',
		la: 'la - Nav Only, tight',
		f: 'f - No Rails',
		fa: 'fa - No Rails, tight',
		c: 'c - Bare',
		ca: 'ca - Bare, tight'
	};
</script>

<DropdownMenu label="Shell">
	<div class="box">
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
</DropdownMenu>
