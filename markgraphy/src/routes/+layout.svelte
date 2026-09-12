<script lang="ts">

	import 'fractalstyler2/styles';
	import '$lib/styles/index.sass'
	import { getPresetScript } from 'fractalstyler2/presets';
	import favicon from '$lib/assets/favicon.svg';
	import { SITE_DESCRIPTION, SITE_URL } from '$site/lib/site';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	{@html `<script>${getPresetScript()}<\/script>`}
	<link rel="icon" href={favicon} />
	<meta name="description" content={SITE_DESCRIPTION} />
	<meta property="og:title" content="Markgraphy — Svelte graphs for markdown" />
	<meta property="og:description" content={SITE_DESCRIPTION} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:image" content={`${SITE_URL}/og.png`} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Markgraphy — Svelte graphs for markdown" />
	<meta name="twitter:description" content={SITE_DESCRIPTION} />
</svelte:head>

{@render children()}

