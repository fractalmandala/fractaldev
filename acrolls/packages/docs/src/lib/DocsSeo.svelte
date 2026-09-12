<script lang="ts">
	import { buildDocsSeo, type DocsSiteSeo } from './seo.js';
	import type { DocsNav } from './types.js';
	import type { DocsContentDocument } from './content.js';

	type Props = {
		nav: DocsNav;
		pathname: string;
		document?: DocsContentDocument<unknown>;
		site?: DocsSiteSeo;
		/** Auto-generated OG image path for this page (e.g. from `docsOgImagePath`). */
		ogImage?: string;
	};

	let { nav, pathname, document, site, ogImage }: Props = $props();

	const seo = $derived(buildDocsSeo({ nav, pathname, document, site, ogImage }));
	const ogEntries = $derived(Object.entries(seo.og));
	const twitterEntries = $derived(Object.entries(seo.twitter));

	// Build full <script> tags in JS so no literal tag/regex confuses the compiler,
	// and neutralize any embedded "<" so JSON-LD can't break out of the script.
	const scriptOpen = '<' + 'script type="application/ld+json">';
	const scriptClose = '<' + '/script>';
	const jsonLdTags = $derived(
		seo.jsonLd.map((entry) => scriptOpen + JSON.stringify(entry).split('<').join('\\u003c') + scriptClose)
	);
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#if seo.description}<meta name="description" content={seo.description} />{/if}
	{#if seo.canonical}<link rel="canonical" href={seo.canonical} />{/if}
	{#if seo.robots}<meta name="robots" content={seo.robots} />{/if}
	{#each ogEntries as [property, content]}
		<meta property={property} content={content} />
	{/each}
	{#each twitterEntries as [name, content]}
		<meta name={name} content={content} />
	{/each}
	{#each jsonLdTags as tag}
		{@html tag}
	{/each}
</svelte:head>
