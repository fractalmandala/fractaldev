<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import '$lib/styles/index.sass'
	import {
		initPresets,
		getPresetScript,
		presets,
		toggleMode,
		getPreset,
		scopePreset
	} from '$lib/presets/presets.svelte';
	import Shell from '$lib/components/shell/Appshell.svelte'
	import Logo from '$lib/icons/fslogo.svelte';
	import { Icon } from 'fractalicons';
	import { siGithub, siNpm, siTwitter } from 'fractalicons/simple';
	import { tbfSun, tbfMoon } from 'fractalicons/tablerfill';
	let { children } = $props();
	const dark = $derived(presets.mode === 'dark');

	const segments = $derived(page.url.pathname.split('/').filter(Boolean));
	let firstSegment = $derived(segments[0]);

	$effect(() => {
		const shell = firstSegment === 'docs' ? 'lrfa' : firstSegment === 'fractalicons' ? 'lf' : 'f';
		return scopePreset('shell', shell);
	});

	onMount(() => {
		initPresets();
	});
</script>

<svelte:head>
	{@html `<script>${getPresetScript()}<\/script>`}
</svelte:head>

<div class="app-shell">
	<header class="app-header">
		<a class="nav-logo row gap-sm ycenter" href="/">
			<img src="/images/fractalstyler.png" alt="fractalstyler logo" />
			<Logo />
		</a>
		<div class="header-section row ycenter gap-bs">
			<a class="nav-header" href="/docs">Docs</a>
			<button class="button is-icon" onclick={toggleMode}>
				{#if dark}
					<Icon icon={tbfSun} size={18} />
				{:else}
					<Icon icon={tbfMoon} size={18} />
				{/if}
			</button>
		</div>
	</header>

	<main class="app-main">
		{@render children()}
	</main>

	<footer class="app-footer">
		<div class="row ycenter wfull xbetween">
			<span class="text-xs tt-u text-muted">2026 | Fractalmandala</span>
			<nav class="social-links row ycenter gap-bs">
				<a
					class="button is-icon"
					href="https://github.com/fractalmandala"
					target="_blank"
					rel="noreferrer"
				>
					<Icon icon={siGithub} size={14} />
				</a>
				<a
					class="button is-icon"
					href="https://www.npmjs.com/~fractaldesign"
					target="_blank"
					rel="noreferrer"
				>
					<Icon icon={siNpm} size={14}/>
				</a>
				<a
					class="button is-icon"
					href="https://x.com/saamaanyafreaky"
					target="_blank"
					rel="noreferrer"
				>
					<Icon icon={siTwitter} size={14} />
				</a>
			</nav>
		</div>
	</footer>
</div>