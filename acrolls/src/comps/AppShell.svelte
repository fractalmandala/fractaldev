<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The canonical application shell, from canonical-markups.md §1 and §2.
	 *
	 * The point of this component is not convenience — the classes work by hand.
	 * It is that an L4 class without its markup is half a definition: the rails
	 * retract, the drawer opens and the TOC folds because of the *structure*,
	 * not because of anything you wire. Approximating the structure is where
	 * people quietly lose the behaviour and start inventing classes to get it
	 * back. This emits the structure exactly.
	 *
	 * Everything here is registry classes. There is no style block, and adding
	 * one would defeat the purpose.
	 */
	interface Props {
		/** Sticky top bar. Omit for a shell with no chrome. */
		header?: Snippet;
		/** Left rail — navigation. Visible ≥1024px, drawer below. */
		sidebarLeft?: Snippet;
		/** Right rail — table of contents. Visible ≥1280px, folds to `mobileToc`. */
		sidebarRight?: Snippet;
		/** The page-top disclosure the right rail retracts into below 1280px. */
		mobileToc?: Snippet;
		/** Bottom bar. */
		footer?: Snippet;
		/** Page content. Wrapped in `.content-shell` unless `bounded` is false. */
		children: Snippet;
		/**
		 * Whether the left rail is showing as a drawer. Only has an effect below
		 * 1024px, where the rail is off-canvas. Bind it to your menu button.
		 */
		open?: boolean;
		/** Set false to drop `.content-shell` and let content run full width. */
		bounded?: boolean;
		class?: string;
	}

	let {
		header,
		sidebarLeft,
		sidebarRight,
		mobileToc,
		footer,
		children,
		open = $bindable(false),
		bounded = true,
		class: className = ''
	}: Props = $props();
</script>

<div class="app-shell {className}" class:open>
	{#if header}
		<header class="app-header row ycenter xbetween gap-sm">
			{@render header()}
		</header>
	{/if}

	<main class="app-main">
		{#if sidebarLeft}
			<aside class="sidebar-left">{@render sidebarLeft()}</aside>
		{/if}

		<section class="main-section">
			{#if mobileToc}
				<details class="mobile-toc">{@render mobileToc()}</details>
			{/if}
			{#if bounded}
				<article class="content-shell">{@render children()}</article>
			{:else}
				{@render children()}
			{/if}
		</section>

		{#if sidebarRight}
			<aside class="sidebar-right">{@render sidebarRight()}</aside>
		{/if}
	</main>

	{#if footer}
		<footer class="app-footer row ycenter xbetween text-xs text-muted">
			{@render footer()}
		</footer>
	{/if}
</div>
