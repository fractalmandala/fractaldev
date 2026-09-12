<script lang="ts">
	// Site chrome: skip link, sticky header, footer.
	import Footer from '$site/components/Footer.svelte';
	import Header from '$site/components/Header.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<a class="skip" href="#main">Skip to content</a>

<div class="shell">
	<Header />
	<main id="main">
		{@render children()}
	</main>
	<Footer />
</div>

<style>

	.shell {
		display: flex;
		min-height: 100dvh;
		flex-direction: column;
		isolation: isolate;
	}

	main {
		flex: 1;
	}

	.skip {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border-width: 0;
	}

	.skip:focus-visible {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		z-index: 50;
		width: auto;
		height: auto;
		padding: 0.5rem 0.75rem;
		margin: 0;
		overflow: visible;
		clip-path: none;
		background: var(--bg);
		color: var(--text-primary);
	}
</style>
