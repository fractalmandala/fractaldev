<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const modules = import.meta.glob('../../../../docs/content/*.svx', { eager: true });
	const Doc = $derived.by(() => {
		const key = Object.keys(modules).find((k) => k.endsWith(`/${data.doc}.svx`));
		return key ? (modules[key] as any).default : null;
	});
</script>

<svelte:head>
	<title>{data.doc} — Markgraphy</title>
</svelte:head>

<div class="page fg-prose">
	{#if Doc}
		<Doc />
	{:else}
		<p>Doc not found: {data.doc}</p>
	{/if}
</div>

<style>
	.page {
		max-width: 56rem;
		margin: 0 auto;
		padding: 2rem var(--pad) 5rem;
	}
</style>
