<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { DocsCrumb, DocsNav, DocsPagerLink, DocsTocItem } from './types.js';
	import { buildDocsCrumbs, docsPager, withNavIds } from './nav.js';
	import DocsHeader from './DocsHeader.svelte';
	import DocsSidebar from './DocsSidebar.svelte';
	import DocsBreadcrumbs from './DocsBreadcrumbs.svelte';
	import DocsPager from './DocsPager.svelte';
	import DocsToc from './DocsToc.svelte';
	import PageActions from './PageActions.svelte';
	import PageFeedback from './PageFeedback.svelte';

	// The Acrolls docs shell: sticky header, off-canvas/sticky nav drawer,
	// constrained content column, and a right-rail TOC. Drop-in — `nav` +
	// `pathname` + `children` is enough; everything else has sensible defaults.
	// The nav/crumbs/pager/TOC are derived from the Acrolls data layer, and the
	// chrome themes through the token bridge in @acrolls/styles/docs.css.
	type SectionLink = { label: string; href: string; current?: boolean };

	type Props = {
		nav: DocsNav;
		pathname: string;
		crumbs?: DocsCrumb[];
		homeHref?: string;
		homeLabel?: string;
		filterable?: boolean;
		showPager?: boolean;
		/** Right-rail (and mobile) table of contents from article headings */
		showToc?: boolean;
		/**
		 * Compile-time headings (a page's `metadata.headings`) for a server-rendered TOC. When
		 * omitted, the TOC falls back to scanning the article DOM after mount.
		 */
		headings?: DocsTocItem[];
		/** Retained for API compatibility; the shell always owns the page layout. */
		fullBleed?: boolean;
		tocMinLevel?: number;
		tocMaxLevel?: number;
		persistOpen?: boolean;
		menuLabel?: string;
		/** Mark the article as Pagefind-indexable. Set false to exclude a page from
		 * full-text search (e.g. frontmatter `search: { exclude: true }`). */
		searchable?: boolean;

		// Header
		siteName?: string;
		sections?: SectionLink[];
		githubUrl?: string;
		showSearch?: boolean;
		bundlePath?: string;
		searchPlaceholder?: string;
		defaultTheme?: 'light' | 'dark' | 'system';
		/** Hide the built-in theme toggle when the host already has its own (see `DocsHeader`). */
		showThemeToggle?: boolean;

		// Page furniture
		showPageActions?: boolean;
		editUrl?: string;
		markdown?: string;
		markdownUrl?: string;
		showFeedback?: boolean;
		feedbackQuestion?: string;
		onVote?: (value: 'yes' | 'no') => void;

		brand?: Snippet;
		/** Extra header actions rendered before the GitHub link and theme toggle. */
		header?: Snippet;
		children: Snippet;
	};

	let {
		nav: navIn,
		pathname,
		crumbs,
		homeHref = '/',
		homeLabel = 'Home',
		filterable = true,
		showPager = true,
		showToc = true,
		headings,
		fullBleed = false,
		tocMinLevel = 2,
		tocMaxLevel = 3,
		persistOpen = true,
		menuLabel = 'Toggle navigation',
		searchable = true,
		siteName,
		sections = [],
		githubUrl,
		showSearch = true,
		bundlePath,
		searchPlaceholder,
		defaultTheme = 'system',
		showThemeToggle = true,
		showPageActions = true,
		editUrl,
		markdown,
		markdownUrl,
		showFeedback = false,
		feedbackQuestion,
		onVote,
		brand,
		header,
		children
	}: Props = $props();

	const nav = $derived(withNavIds(navIn));

	const resolvedCrumbs = $derived(
		crumbs ?? buildDocsCrumbs(nav, pathname, { homeHref, homeLabel })
	);
	const pager = $derived(docsPager(nav, pathname));
	const previous = $derived(pager.previous as DocsPagerLink);
	const next = $derived(pager.next as DocsPagerLink);

	const brandName = $derived(siteName ?? nav.title);
	const showRail = $derived(showToc || showPageActions);

	let navOpen = $state(false);
	let rootEl = $state<HTMLElement | null>(null);
	let articleEl = $state<HTMLElement | null>(null);

	function syncDrawerTop() {
		if (typeof document === 'undefined') return;
		const headerEl =
			rootEl?.querySelector<HTMLElement>('[data-acrolls-header]') ??
			document.querySelector<HTMLElement>('[data-acrolls-header]');
		if (headerEl) {
			document.documentElement.style.setProperty(
				'--acrolls-docs-drawer-top',
				`${headerEl.getBoundingClientRect().bottom}px`
			);
		}
	}

	// Mirror the drawer state onto <html> so the CSS can open it and lock scroll.
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.toggleAttribute('data-acrolls-nav-open', navOpen);
		document.documentElement.style.overflow = navOpen ? 'hidden' : '';
		if (navOpen) syncDrawerTop();
	});

	// Any navigation closes the mobile drawer.
	$effect(() => {
		pathname;
		navOpen = false;
	});

	onMount(() => {
		syncDrawerTop();
		const onKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && navOpen) navOpen = false;
		};
		const onResize = () => {
			if (!navOpen) return;
			if (matchMedia('(min-width: 64rem)').matches) navOpen = false;
			else syncDrawerTop();
		};
		window.addEventListener('keydown', onKeydown);
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('keydown', onKeydown);
			window.removeEventListener('resize', onResize);
			document.documentElement.removeAttribute('data-acrolls-nav-open');
			document.documentElement.style.overflow = '';
		};
	});
</script>

<div
	class="acrolls-docs-root"
	data-full-bleed={fullBleed || undefined}
	bind:this={rootEl}
>
	<a class="acrolls-docs-skip" href="#acrolls-content">Skip to content</a>

	<DocsHeader
		siteName={brandName}
		{homeHref}
		{sections}
		{githubUrl}
		{showSearch}
		{bundlePath}
		searchPlaceholder={searchPlaceholder}
		{menuLabel}
		{navOpen}
		{defaultTheme}
		{showThemeToggle}
		{brand}
		actions={header}
		onToggleNav={() => (navOpen = !navOpen)}
	/>

	<div data-acrolls-doc-grid>
		<aside id="acrolls-docs-nav-drawer" data-acrolls-nav-drawer aria-label="Documentation" data-pagefind-ignore>
			<DocsSidebar {nav} {pathname} {filterable} {persistOpen} />
		</aside>

		<main id="acrolls-content">
			<DocsBreadcrumbs crumbs={resolvedCrumbs} />

			{#if showToc}
				<DocsToc
					variant="mobile"
					{headings}
					contentEl={articleEl}
					watch={pathname}
					minLevel={tocMinLevel}
					maxLevel={tocMaxLevel}
				/>
			{/if}

			<div
				class="acrolls-docs-article"
				bind:this={articleEl}
				data-pagefind-body={searchable ? '' : undefined}
			>
				{@render children()}
			</div>

			{#if showFeedback}
				<PageFeedback question={feedbackQuestion} {onVote} />
			{/if}

			{#if showPager}
				<DocsPager {previous} {next} />
			{/if}
		</main>

		{#if showRail}
			<aside data-acrolls-toc aria-label="On this page" data-pagefind-ignore>
				{#if showToc}
					<DocsToc
						variant="rail"
						{headings}
						contentEl={articleEl}
						watch={pathname}
						minLevel={tocMinLevel}
						maxLevel={tocMaxLevel}
					/>
				{/if}
				{#if showPageActions}
					<PageActions {editUrl} {markdown} {markdownUrl} />
				{/if}
			</aside>
		{/if}
	</div>

	<button
		aria-label="Close navigation"
		class="acrolls-docs-nav-overlay"
		data-acrolls-nav-toggle
		type="button"
		onclick={() => (navOpen = false)}
	></button>
</div>
