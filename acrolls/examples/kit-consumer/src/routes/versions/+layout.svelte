<script lang="ts">
	import { page } from '$app/state';
	import {
		DocsShell,
		DocsSeo,
		DocsVersionSwitcher,
		alternateVersionHrefs
	} from 'acrolls/docs';
	import type { DocsTocItem } from 'acrolls/docs';
	import { versionedDocs, versionsConfig } from '../../lib/versions/source';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const currentDoc = $derived(versionedDocs.get(page.url.pathname));
	const headings = $derived(currentDoc?.metadata?.headings as DocsTocItem[] | undefined);
	const versionItems = $derived(alternateVersionHrefs(page.url.pathname, versionsConfig));
</script>

<DocsSeo nav={versionedDocs.nav} pathname={page.url.pathname} document={currentDoc} />

<DocsShell
	nav={versionedDocs.nav}
	pathname={page.url.pathname}
	showToc={Boolean(headings?.length)}
	showPager={true}
	showThemeToggle={false}
	{headings}
	siteName="Acrolls"
	searchable={false}
>
	<div class="version-bar">
		<DocsVersionSwitcher items={versionItems} />
	</div>
	{@render children()}
</DocsShell>
