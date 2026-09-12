<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { docs } from "$lib/demo/source";
	import type { Snippet } from "svelte";
	// The fractalstyler2 scaffold — tokens, 41 themes, preset axes, and layers 01–08.
	import "$lib/styles/index.sass";
	import { presets, toggleMode, initPresets } from "fractalstyler2";
	let { children }: { children: Snippet } = $props();
	const segments = $derived(page.url.pathname.split("/").filter(Boolean));
	const routes = $derived(
		segments.map((segment, index) => {
			const isCurrent = index === segments.length - 1;
			return {
				name: segment,
				depth: index + 1,
				path: "/" + segments.slice(0, index + 1).join("/"),
				isCurrent,
			};
		}),
	);
	const currentPage = $derived(routes.at(-1)?.name ?? "");
	const currentDoc = $derived(
		page.url.pathname === "/" ? undefined : docs.get(page.url.pathname),
	);
	const headings = $derived(
		(currentDoc?.metadata?.headings as { id: string; text: string; level: number }[] | undefined) ??
			[],
	);
	// Two-level TOC data matching the toc-ul / toc-ul-in markup: an h2 opens a group, deeper
	// headings nest under the previous group.
	const tocGroups = $derived.by(() => {
		const groups: { id: string; text: string; subs: { id: string; text: string }[] }[] = [];
		for (const heading of headings) {
			if (heading.level <= 2) {
				groups.push({ id: heading.id, text: heading.text, subs: [] });
			} else if (groups.length > 0) {
				groups[groups.length - 1].subs.push({ id: heading.id, text: heading.text });
			}
		}
		return groups;
	});
	onMount(() => initPresets());
</script>

<div class="app-shell">
	<header class="app-header row gap-lg ycenter">
		<a href="/" class="text-logo">
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="logo">
					<rect
						id="top"
						x="3.84766"
						width="12.3077"
						height="2.82051"
						fill="currentColor"
					/>
					<rect
						id="left"
						y="16.1538"
						width="12.3077"
						height="2.82051"
						transform="rotate(-90 0 16.1538)"
						fill="currentColor"
					/>
					<rect
						id="right"
						x="20"
						y="3.84619"
						width="12.3077"
						height="2.82051"
						transform="rotate(90 20 3.84619)"
						fill="currentColor"
					/>
					<rect
						id="bot"
						x="3.84766"
						y="17.1797"
						width="12.3077"
						height="2.82051"
						fill="currentColor"
					/>
					<rect
						id="cent"
						x="3.84766"
						y="3.84619"
						width="12.3077"
						height="12.3077"
						fill="currentColor"
					/>
				</g>
			</svg>

			<span>Acrolls</span>
		</a>
		<nav class="header-nav row ycenter gap-lg">
			<a href="/introduction">Introduction</a>
			<a href="/components">Components</a>
			<a href="/presets">Presets</a>
		</nav>
		<div class="row site-settings ycenter">
			<button class="button is-icon" aria-label="menu-button">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 6H20" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 12H20" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 18H20" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
			</button>
		</div>
	</header>
	<main class="app-main">
		<aside class="sidebar-left">
			<div class="docs-nav-wrapper box gap-sm">
				<ul class="box nav-ul">
					<li class="nav-li">
						<a class="sidebar-nav-link" href="/">Dummy Link</a>
					</li>
					<li class="nav-li">
						<a class="sidebar-nav-link" href="/">Second Dummy</a>
					</li>
				</ul>
				{#each docs.nav.sections as section (section.id)}
					<ul class="box nav-ul">
						<p class="nav-eyebrow">{section.title}</p>
						{#each section.items as item (item.id)}
							<li class="nav-li">
								<a class="sidebar-nav-link" href={item.href ?? "#"}>{item.title}</a>
							</li>
						{/each}
					</ul>
				{/each}
			</div>
		</aside>
		<div class="main-section">
			<div class="page-shell">
				{@render children()}
			</div>
		</div>
		<aside class="sidebar-right">
			<div class="docs-toc-wrapper box gap-sm">
				<p class="toc-header weight-500 text-bs acrolls">On this page</p>
				<ul class="box toc-ul">
					{#if tocGroups.length === 0}
						<li class="toc-li"><a href="/">level h2 titles</a></li>
						<li class="toc-li"><a href="/">level h2 titles</a>
							<ul class="box toc-ul-in">
								<li class="toc-li"><a href="/">level h3 titles</a></li>
								<li class="toc-li"><a href="/">level h3 titles</a></li>
							</ul>
						</li>
						<li class="toc-li"><a href="/">level h2 titles</a></li>
					{:else}
						{#each tocGroups as group (group.id)}
							<li class="toc-li"><a href="#{group.id}">{group.text}</a>
								{#if group.subs.length > 0}
									<ul class="box toc-ul-in">
										{#each group.subs as sub (sub.id)}
											<li class="toc-li"><a href="#{sub.id}">{sub.text}</a></li>
										{/each}
									</ul>
								{/if}
							</li>
						{/each}
					{/if}
				</ul>
			</div>
		</aside>
	</main>
	<footer class="app-footer">f</footer>
</div>
