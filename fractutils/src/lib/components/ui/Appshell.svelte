<script lang="ts">

	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import PageShell from '$lib/components/ui/PageShell.svelte'
	import { presets, initPresets } from '$lib/ui/presets.svelte';

	interface Props {
		sidebarLeft?: Snippet;
		sidebarRight?: Snippet;
		appFooter?: Snippet;
		appHeader: Snippet;
		children: Snippet;
	}

	let {
		sidebarLeft,
		sidebarRight,
		appFooter,
		appHeader,
		children
	}: Props = $props()

	onMount(() => initPresets());

	// Featural shell composition (presets.shell): the value lists the OPTIONAL
	// regions present — l = left rail (nav), r = right rail (TOC), f = footer,
	// a = the constrained .app-content article (docs column) in place of the
	// full-bleed PageShell. We render only the regions the composition names, so
	// a composed-out region doesn't render its snippet at all. The [data-shell]
	// rules in _05_shells.sass still hide composed-out regions for the
	// pre-hydration / no-JS path, where this reactive state has not yet synced
	// from storage (it starts at the full default 'lrf', matching SSR).
	const hasNav = $derived(presets.shell.includes('l'));
	const hasToc = $derived(presets.shell.includes('r'));
	const hasFooter = $derived(presets.shell.includes('f'));
	// Content wrapper: `a` selects the constrained article, its absence PageShell.
	// The composition is the only source of truth here — no parallel prop.
	const hasArticle = $derived(presets.shell.includes('a'));

</script>

<div class="app-shell">
	<header class="app-header">
		{@render appHeader()}
	</header>
	<main class="app-main">
		{#if hasNav}
			<aside class="sidebar-left">
				{@render sidebarLeft?.()}
			</aside>
		{/if}
		<section class="main-section">
			{#if hasArticle}
				<article class="app-content">
					{@render children()}
				</article>
			{:else}
				<PageShell>
					{@render children()}
				</PageShell>
			{/if}
		</section>
		{#if hasToc}
			<aside class="sidebar-right">
				{@render sidebarRight?.()}
			</aside>
		{/if}
	</main>
	{#if hasFooter}
		<footer class="app-footer">
			{@render appFooter?.()}
		</footer>
	{/if}
</div>
