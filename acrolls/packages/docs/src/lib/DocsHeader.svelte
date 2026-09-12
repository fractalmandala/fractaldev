<script lang="ts">
	import type { Snippet } from 'svelte';
	import DocsSearch from './DocsSearch.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	// Sticky docs header: nav toggle, brand, optional section tabs, search, and
	// theme toggle. De-branded port of the kit header — the logo mark is opt-in
	// via the `brand` snippet so a host can drop in its own.
	type SectionLink = { label: string; href: string; current?: boolean };

	type Props = {
		siteName?: string;
		homeHref?: string;
		sections?: SectionLink[];
		githubUrl?: string;
		showSearch?: boolean;
		bundlePath?: string;
		searchPlaceholder?: string;
		menuLabel?: string;
		/**
		 * Whether the nav drawer is open. Wired by DocsShell so the toggle can expose an
		 * accurate `aria-expanded`. When omitted (standalone header), the fallback toggle
		 * tracks its own state.
		 */
		navOpen?: boolean;
		defaultTheme?: 'light' | 'dark' | 'system';
		/**
		 * Render the built-in light/dark `ThemeToggle`. Defaults to true; set false when the host
		 * already owns theme switching (e.g. a fractalthemer picker in the site header), so two
		 * controls never compete to write `data-theme` / inline tokens on `<html>`.
		 */
		showThemeToggle?: boolean;
		/** Called by the nav toggle. When omitted, toggles the drawer directly. */
		onToggleNav?: () => void;
		brand?: Snippet;
		/** Extra actions rendered before the GitHub link and theme toggle. */
		actions?: Snippet;
	};

	let {
		siteName = 'Docs',
		homeHref = '/',
		sections = [],
		githubUrl,
		showSearch = true,
		bundlePath,
		searchPlaceholder,
		menuLabel = 'Toggle navigation',
		navOpen,
		defaultTheme = 'system',
		showThemeToggle = true,
		onToggleNav,
		brand,
		actions
	}: Props = $props();

	// Standalone fallback state: only used when no `navOpen` prop is wired.
	let selfOpen = $state(false);
	const expanded = $derived(navOpen ?? selfOpen);

	function toggleNav() {
		if (onToggleNav) return onToggleNav();
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		const open = root.toggleAttribute('data-acrolls-nav-open');
		selfOpen = open;
		const header = document.querySelector('[data-acrolls-header]');
		if (open && header) {
			root.style.setProperty(
				'--acrolls-docs-drawer-top',
				`${header.getBoundingClientRect().bottom}px`
			);
		}
		root.style.overflow = open ? 'hidden' : '';
	}
</script>

<header data-acrolls-header data-pagefind-ignore>
	<button
		aria-controls="acrolls-docs-nav-drawer"
		aria-expanded={expanded}
		aria-label={menuLabel}
		class="acrolls-docs-icon-btn acrolls-docs-nav-toggle"
		data-acrolls-nav-toggle
		type="button"
		onclick={toggleNav}
	>
		<svg aria-hidden="true" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
			<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5h16M4 12h16M4 19h16" />
		</svg>
	</button>

	<a class="acrolls-docs-header-brand" href={homeHref}>
		{#if brand}
			{@render brand()}
		{:else}
			<span class="acrolls-docs-name">{siteName}</span>
		{/if}
	</a>

	{#if sections.length}
		<nav aria-label="Sections" class="acrolls-docs-header-sections">
			{#each sections as s (s.href)}
				<a href={s.href} aria-current={s.current ? 'page' : undefined}>{s.label}</a>
			{/each}
		</nav>
	{/if}

	<div class="acrolls-docs-header-spacer"></div>

	{#if showSearch}
		<DocsSearch bundlePath={bundlePath} placeholder={searchPlaceholder} />
	{/if}

	<div class="acrolls-docs-header-actions">
		{#if actions}
			{@render actions()}
		{/if}
		{#if githubUrl}
			<a aria-label="Source repository" class="acrolls-docs-icon-btn" href={githubUrl} rel="noreferrer" target="_blank">
				<svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 16 16" width="18" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2 .37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
				</svg>
			</a>
		{/if}
		{#if showThemeToggle}
			<ThemeToggle initial={defaultTheme} />
		{/if}
	</div>
</header>
