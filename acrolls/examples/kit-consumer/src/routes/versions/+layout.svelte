<script lang="ts">
	import { page } from '$app/state';
	import { DocsShell, DocsSeo } from 'acrolls/docs';
	import type { DocsTocItem } from 'acrolls/docs';
	import { versionedDocs, versionsConfig } from '../../lib/versions/source';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const currentDoc = $derived(versionedDocs.get(page.url.pathname));
	const headings = $derived(currentDoc?.metadata?.headings as DocsTocItem[] | undefined);
</script>

<DocsSeo nav={versionedDocs.nav} pathname={page.url.pathname} document={currentDoc} />

<!-- `versions` renders the built-in DocsVersionSwitcher in the header and deep-links each
     version at the equivalent page. -->
<DocsShell
	nav={versionedDocs.nav}
	pathname={page.url.pathname}
	showToc={Boolean(headings?.length)}
	showPager={true}
	showThemeToggle={false}
	versions={versionsConfig.versions}
	versionsBaseHref={versionsConfig.baseHref}
	{headings}
	siteName="Acrolls"
	searchable={false}
>
	{@render children()}
</DocsShell>
