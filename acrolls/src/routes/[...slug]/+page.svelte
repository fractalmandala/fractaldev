<script lang="ts">
	import { page } from "$app/state";
	import { docs } from "$lib/demo/source";

	// Doc page for the playset corpus — same composition classes as the index page.
	// The Article is the playset Markdown compiled by the mdsvex pipeline.
	let { data } = $props();

	const document = $derived(docs.get(data.slug));
	const tags = $derived((document?.metadata?.tags as string[] | undefined) ?? []);
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
</script>

<svelte:head>
	<title>{document?.title ?? "Not found"} · {docs.nav.title}</title>
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
		<h1 class="weight-600 tt-c text-3xl">{document?.title ?? "Not found"}</h1>
		{#if document?.description}
			<p class="text-muted text-sm">{document.description}</p>
		{/if}
		{#if tags.length > 0}
			<div class="article-tags row ycenter gap-xs">
				{#each tags as tag (tag)}
					<span class="pill">{tag}</span>
				{/each}
			</div>
		{/if}
	</div>
	<div class="box acrolls-content">
		{#if document && data.Article}
			<data.Article />
		{:else}
			<p>Documentation page not found.</p>
		{/if}
	</div>
</article>
