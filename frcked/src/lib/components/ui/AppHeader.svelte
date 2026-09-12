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
	} from '$lib/states/presets.svelte';
	import { tbfSun, tbfMoon } from 'fractalicons/tablerfill';
	import ModeToggle from '$lib/components/ui/ModeToggle.svelte'
	import { Icon } from 'fractalicons';
	const dark = $derived(presets.mode === 'dark');
	let isDark = $state(false);
	interface Props {
		headerName: string;
	}


function applyMode() {
	toggleMode();
	isDark = document.documentElement.getAttribute('data-mode') === 'dark';
}

	async function toggle() {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			applyMode();
			return;
		}

		const wasDark = isDark;

		// Create a full-screen overlay that captures the current theme
		const overlay = document.createElement('div');
		overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
		// Use html2canvas-like approach: just use the current background color
		const computedBg = getComputedStyle(document.body).backgroundColor;
		overlay.style.background = computedBg;
		document.body.appendChild(overlay);

		// Apply the theme change
		applyMode();

		// Animate the overlay away to reveal the new theme
		// Dark→Light: overlay shrinks downward (reveals from top)
		// Light→Dark: overlay shrinks upward (reveals from bottom)
		const to = wasDark ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)';

		const anim = overlay.animate(
			{ clipPath: ['inset(0 0 0 0)', to] },
			{
				duration: 520,
				easing: 'cubic-bezier(0.65, 0, 0.35, 1)'
			}
		);

		anim.onfinish = () => overlay.remove();
	}


	$effect(() => {
		const shell = 'lrfa';
		return scopePreset('shell', shell);
	});

	let { headerName = 'frcked' }: Props = $props();

	onMount(() => {
		initPresets();
isDark = document.documentElement.getAttribute('data-mode') === 'dark';
	});
</script>

<svelte:head>
	{@html `<script>${getPresetScript()}<\/script>`}
</svelte:head>

<header class="frk-header row ycenter xbetween wfull border-bottom">
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
