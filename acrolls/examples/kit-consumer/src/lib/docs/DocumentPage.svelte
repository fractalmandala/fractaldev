<script lang="ts">
	import type { Component } from 'svelte';
	import { docs, raw } from './source';
	import { DocsPageHeader, CopyPageMarkdown, docsPageMarkdown } from 'acrolls/docs';

	// Article is resolved in the route `load` so it prerenders with content (SSR,
	// SEO, and Pagefind all need the prose in the static HTML — not an {#await}).
	let { slug, Article }: { slug: string; Article?: Component } = $props();
	const document = $derived(docs.get(slug));
	const markdown = $derived(docsPageMarkdown(docs, slug, raw));
</script>

{#if document}
	<DocsPageHeader title={document.title} description={document.description} />
	{#if markdown}<CopyPageMarkdown {markdown} />{/if}
	{#if Article}<Article />{/if}
{:else}
	<p>Documentation page not found.</p>
{/if}
