<script lang="ts">
	import '#lib/styles/index.sass';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { MotionConfig } from '@humanspeak/svelte-motion';
	import Menu from '#lib/icons/menu.svelte';
	import ModeToggle from '#lib/mode/ModeToggle.svelte';
	import { mode, modeScript } from '#lib/mode/mode.svelte.ts';
	import DocsNav from '#lib/docs/DocsNav.svelte';
	import Github from '#lib/icons/github.svelte';

	let mobileNavOpen = $state(false);
	let { children }: { children: Snippet } = $props();
	const store = mode();
	const dark = $derived(store.resolved === 'dark');

	// Close drawer when changing routes
	$effect(() => {
		const _ = page.url.pathname;
		mobileNavOpen = false;
	});

	// Handle Escape key for mobile nav
	$effect(() => {
		if (!mobileNavOpen) return;

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				mobileNavOpen = false;
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	function closeMobileNav() {
		mobileNavOpen = false;
	}
</script>

<svelte:head>
	{@html `<script>${modeScript()}<\/script>`}
	<title>Fractalsvelte UI — Svelte components</title>
	<meta
		name="description"
		content="A considered SvelteKit component library documented in its own interface."
	/>
</svelte:head>

<MotionConfig reducedMotion="user">
	<div class="app-shell">
		<header class="app-header">
			<a class="row ycenter gap-xs xleft" href="/">
				<img class="logomotif" src="/images/logomotif.png" alt="motif" />
				{#if dark}
				<img class="logotype" src="/images/logotype2-w.png" alt="logotype" />
				{:else}
				<img class="logotype" src="/images/logotype2-d.png" alt="logotype" />
				{/if}
			</a>

			<div class="row ycenter gap-bs">
				<nav class="primary-nav row ycenter gap-bs" aria-label="Primary navigation">
					<a class="text-md" href="/components">Components</a>
					<a class="text-md" href="/gradient-builder">Gradient Builder</a>
				</nav>
				<ModeToggle/>
				<button
					class="is-icon mobile-menu"
					type="button"
					aria-label="Toggle navigation menu"
					aria-expanded={mobileNavOpen}
					onclick={() => (mobileNavOpen = !mobileNavOpen)}
				>
					<Menu />
				</button>
			</div>
		</header>
		<div
			class="mobile-nav-backdrop"
			class:open={mobileNavOpen}
			onclick={closeMobileNav}
			aria-hidden="true"
		></div>
		<aside
			class="mobile-nav-panel"
			class:open={mobileNavOpen}
			aria-label="Mobile navigation"
			aria-hidden={!mobileNavOpen}
		>
			<div class="mobile-nav-header row ycenter xright pad-md shrink-0">
				<button
					type="button"
					class="is-icon text-secondary"
					aria-label="Close menu"
					onclick={closeMobileNav}
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			<div class="mobile-nav-body grow pad-md">
				<DocsNav onSelect={closeMobileNav} />
			</div>
		</aside>
		<main class="app-main">
			{@render children()}
		</main>
		<footer class="app-footer row ycenter xbetween bt">
			<p class="text-sm">fractalmandala | 2026</p>
			<a class="is-icon" href="https://github.com/fractalmandala" target="_blank" rel="noreferrer"><Github/></a>
		</footer>
	</div>
</MotionConfig>
