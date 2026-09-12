<script lang="ts">
	import '#lib/styles/index.sass';
	import { components, categories } from '#lib/docs/catalogue.ts';
	import { guides } from '#lib/docs/guides.ts';
	import { page } from '$app/state';
	import { MotionConfig } from '@humanspeak/svelte-motion';

	let openSidebarSection = $state<string | null>(null);
	let mobileNavOpen = $state(false);
	let tocOpen = $state(false);
	let { children } = $props();
	type TocItem = { id: string; label: string; level: 2 | 3 };

	function slugify(value: string) {
		return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	let tocItems = $derived.by((): TocItem[] => {
		const pathname = page.url.pathname;
		const componentMatch = pathname.match(/^\/components\/([^/]+)/);
		if (componentMatch) return [
			{ id: 'preview-heading', label: 'Live preview', level: 2 },
			{ id: 'usage-heading', label: 'Usage', level: 2 },
			{ id: 'props-heading', label: 'Props', level: 2 },
			{ id: 'styling-heading', label: 'Styling contract', level: 2 }
		];
		const guideMatch = pathname.match(/^\/guides\/([^/]+)/);
		const guide = guideMatch ? guides.find((item) => item.slug === guideMatch[1]) : undefined;
		return (guide?.markdown.match(/^#{2,3}\s+.+$/gm) ?? []).map((heading) => {
			const match = heading.match(/^(#{2,3})\s+(.+)$/);
			const label = match?.[2] ?? heading;
			return { id: slugify(label), label, level: (match?.[1].length ?? 2) as 2 | 3 };
		});
	});

	function toggleSidebarSection(section: string) {
		openSidebarSection = openSidebarSection === section ? null : section;
	}

	function sidebarSectionId(section: string) {
		return `sidebar-section-${section.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
	}

	function sectionIsCurrent(section: string) {
		if (section === 'docs') return page.url.pathname.startsWith('/guides');
		return components.some((component) => component.category === section && page.url.pathname === `/components/${component.slug}`);
	}

	function closeMobileNav() {
		mobileNavOpen = false;
	}

	function closeToc() {
		tocOpen = false;
	}
</script>

<svelte:head>
	<title>Fractalsvelte UI — Svelte components</title>
	<meta name="description" content="A considered SvelteKit component library documented in its own interface." />
</svelte:head>

<MotionConfig reducedMotion="user">
	<div class="app-shell">
		<header class="app-header row ycenter xbetween px-m">
			<a class="row ycenter gap-2xs" href="/">
				<img class="logomotif" src="/images/logomotif.png" alt="motif"/>
				<img class="logotype" src="/images/logotype-d.png" alt="logotype"/>

			</a>
			<div class="app-header__actions row ycenter gap-xs">
				<nav class="row ycenter gap-s" aria-label="Primary navigation">
					<a class="navtree-link" href="/">Introduction</a>
					<a class="navtree-link" href="/components/button">Components</a>
					<a class="navtree-link" href="/guides">Guides</a>
				</nav>
				<details class="mobile-nav" bind:open={mobileNavOpen}>
					<summary class="mobile-nav__trigger button ghost sm">Menu</summary>
					<div class="mobile-nav__panel">
						<a href="/" onclick={closeMobileNav}>Introduction</a>
						<strong>Components</strong>
						{#each categories as category}
							<span class="mobile-nav__heading">{category}</span>
							{#each components.filter((component) => component.category === category) as component}
								<a href={`/components/${component.slug}`} onclick={closeMobileNav}>{component.name}</a>
							{/each}
						{/each}
						<strong>Docs</strong>
						<a href="/guides" onclick={closeMobileNav}>Overview</a>
						{#each guides as guide}
							<a href={`/guides/${guide.slug}`} onclick={closeMobileNav}>{guide.title}</a>
						{/each}
					</div>
				</details>
			</div>
		</header>
		<main class="app-main">
			<aside class="sidebar-left">
			<nav class="docs-nav navtree" aria-label="Documentation navigation">
				<div class="navtree-group">
					<div class="navtree-title">Library</div>
					<a class="navtree-link" aria-current={page.url.pathname === '/' ? 'page' : undefined} href="/">Introduction</a>
				</div>
				<div class="navtree-group">
					<button class="navtree-link" type="button" aria-expanded={openSidebarSection === 'docs'} onclick={() => toggleSidebarSection('docs')}>
						<span>Docs</span><span class="sidebar-section__chevron" aria-hidden="true">⌄</span>
					</button>
					{#if openSidebarSection === 'docs'}
						<div class="navtree-sub">
							<a class="navtree-link" aria-current={page.url.pathname === '/guides' ? 'page' : undefined} href="/guides">Overview</a>
							{#each guides as guide}
								<a class="navtree-link" aria-current={page.url.pathname === `/guides/${guide.slug}` ? 'page' : undefined} href={`/guides/${guide.slug}`}>{guide.title}</a>
							{/each}
						</div>
					{/if}
				</div>
				{#each categories as category}
					<div class="navtree-group">
						<button class="navtree-link" type="button" aria-expanded={openSidebarSection === category} onclick={() => toggleSidebarSection(category)}>
							<span>{category}</span><span class="sidebar-section__chevron" aria-hidden="true">⌄</span>
						</button>
						{#if openSidebarSection === category}
							<div class="navtree-sub">
								{#each components.filter((component) => component.category === category) as component}
									<a class="navtree-link" aria-current={page.url.pathname === `/components/${component.slug}` ? 'page' : undefined} href={`/components/${component.slug}`}>{component.name}</a>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</nav>
			</aside>
			<main class="docs-main">
				<div class="app-content prose">{@render children()}</div>
			</main>
			<aside class="sidebar-right">
			{#if tocItems.length}
				<nav class="docs-toc toc" aria-label="On this page">
					<div class="toc-title">On this page</div>
					<nav class="toc-list" aria-label="Table of contents">
						{#each tocItems as item}
							<a class="toc-link" data-depth={item.level} href={`#${item.id}`} onclick={closeToc}>{item.label}</a>
						{/each}
					</nav>
				</nav>
			{/if}
			</aside>
		</main>
	</div>
</MotionConfig>
