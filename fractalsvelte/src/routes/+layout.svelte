<script lang="ts">
	import '../lib/styles/index.sass';
	// Kills the UA cross-fade on ::view-transition snapshots, or the ModeToggle
	// wipe arrives smeared with a fade (the engine drives the snapshots itself).
	import '../lib/internal/transition.css';
	import ModeToggle from '$lib/internal/ModeToggle.svelte'
	// Color tokens live under [data-mode] in _00_tokens.sass, so the mode script
	// must run in the head — before first paint — to mark <html>.
	import { modeScript } from 'fractalthemer/mode';

	let { children } = $props();
</script>

<svelte:head>
	{@html `<script>${modeScript()}<\/script>`}
</svelte:head>

<div class="app-shell" data-shape="square">
	<header class="app-header bb">
		<a class="logo-link" href="/">
			fractalsvelte ui
		</a>
		<div class="row">
			<ModeToggle/>
		</div>
	</header>
	<main class="app-main">
		{@render children()}
	</main>
	<footer class="app-footer">
		<span class="text-xs">fractalsvelte | 2026</span>
	</footer>
</div>
