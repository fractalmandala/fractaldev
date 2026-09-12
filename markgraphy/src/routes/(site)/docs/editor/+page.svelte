<script lang="ts">
	import { DiagramEditor } from '$lib';
	import PageHeader from '$site/components/docs/page-header.svelte';
	import { SITE_NAME } from '$site/lib/site';
</script>

<svelte:head>
	<title>Editor — {SITE_NAME}</title>
	<meta
		name="description"
		content="An embeddable ASCII diagram editor: presets, a glyph palette, auto-align, and copy-as-Svelte or .svx."
	/>
</svelte:head>

<div class="page">
	<PageHeader
		title="Editor"
		kicker="DiagramEditor"
		lead="An embeddable playground for the diagram set. Start from a preset or a blank frame, insert glyphs from the palette, auto-align the borders, and copy the result as plain text, a Svelte snippet, or an .svx block. Everything you draw re-themes with the accent."
	/>

	<section class="block">
		<DiagramEditor />
	</section>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.block {
		display: flex;
		flex-direction: column;
	}
</style>
