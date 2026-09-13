<script lang="ts">
	import { page } from '$app/state';
	import { DocsShell, DocsSeo } from 'acrolls/docs';
	import type { DocsTocItem } from 'acrolls/docs';
	import { blog } from '../../lib/blog/source';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const base = blog.nav.baseHref;
	const isIndex = $derived(page.url.pathname === base || page.url.pathname === `${base}/`);
	const currentDoc = $derived(blog.get(page.url.pathname));
	const headings = $derived(currentDoc?.metadata?.headings as DocsTocItem[] | undefined);
</script>

<DocsSeo
	nav={blog.nav}
	pathname={page.url.pathname}
	document={currentDoc}
	site={{ twitter: '@acrolls', locale: 'en_US' }}
/>

<DocsShell
	nav={blog.nav}
	pathname={page.url.pathname}
	showToc={!isIndex}
	showPager={!isIndex}
	showThemeToggle={false}
	{headings}
	siteName="Acrolls"
	searchable={false}
>
	{@render children()}
</DocsShell>
