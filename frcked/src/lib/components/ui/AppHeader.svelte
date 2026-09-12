<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { NavigationLogic, type NavigationState } from '$lib/data/Navigation.js';
	const logic = new NavigationLogic(page.url.pathname);
	import {
		initPresets,
		getPresetScript,
		presets,
		toggleMode,
		getPreset,
		scopePreset
	} from '$lib/presets/presets.svelte';
	import { tbfSun, tbfMoon } from 'fractalicons/tablerfill';
	import ModeToggle from '$lib/components/ui/ModeToggle.svelte'
	import { Icon } from 'fractalicons';
	const dark = $derived(presets.mode === 'dark');

	interface Props {
		headerName: string;
	}


function applyMode() {
	toggleMode();
}

	$effect(() => {
		const shell = 'lrfa';
		return scopePreset('shell', shell);
	});

	let { headerName = 'frcked' }: Props = $props();

	onMount(() => {
		initPresets();
	});
</script>

<svelte:head>
	{@html `<script>${getPresetScript()}<\/script>`}
</svelte:head>

<header class="app-header row ycenter xbetween wfull">
		<a class="header-link row ycenter gap-sm" href="/">
			<img src="/images/frcked.png" alt="site logo" />
			<span>{headerName}</span>
		</a>
		<nav class="header-nav row gap-sm ycenter">
			{#each logic.navItems as item (item.href)}
				<a class="header-nav-link text-sm weight-500" href={item.href}>{item.label}</a>
			{/each}
			<button class="button is-icon" onclick={toggleMode}>
				{#if dark}
					<Icon icon={tbfSun} size={18} />
				{:else}
					<Icon icon={tbfMoon} size={18} />
				{/if}
			</button>
		</nav>
</header>
