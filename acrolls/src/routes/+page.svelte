<script lang="ts">
	import { page } from "$app/state";
	import { docs } from "$lib/demo/source";

	// Temporary playset home — pipeline proof, not the composition. This page exists so the
	// content engine's output (nav tree + compiled playset corpus) is visible at a URL.
	// The real composition layers in from src/comps: AppShell, PageShell, pickers.
	const sections = docs.nav.sections;
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
	const currentPage = $derived(routes.at(-1)?.name ?? "home");
	const totalDepth = $derived(segments.length);
</script>

<svelte:head>
	<title>{docs.nav.title}</title>
</svelte:head>

<article class="content-shell">
	<div class="article-heading box gap-xs">
		<div class="row breadcrumbs ycenter">
			{#each routes as route}
				<a class="crumb text-xs text-muted" href={route.path}
					>{route.name}</a
				>
			{/each}
		</div>
		<h1 class="weight-600 tt-c text-3xl">{docs.nav.title}</h1>
		<p class="text-muted text-sm">
			Content-engine output from docs/playset — {docs.documents.length} documents
			compiled. Compose the real shell in src/comps/AppShell.svelte and drive
			it from docs.nav.
		</p>
		<div class="article-tags row ycenter gap-xs">
			<span class="pill">tag one</span>
			<span class="pill">whooo</span>
			<span class="pill">muo</span>
		</div>
	</div>
	<div class="box acrolls-content">
	{#each sections as section (section.id)}
		<section>
			<h2>{section.title}</h2>
			<ul>
				{#each section.items as item (item.id)}
					<li>
						{#if item.href}<a href={item.href}>{item.title}</a>{:else}{item.title}{/if}{#if item.children}
							<ul>
								{#each item.children as child (child.id ?? child.title)}
									<li>{#if child.href}<a href={child.href}>{child.title}</a>{:else}{child.title}{/if}</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/each}
	</div>
</article>
