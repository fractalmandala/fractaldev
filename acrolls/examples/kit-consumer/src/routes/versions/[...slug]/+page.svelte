<script lang="ts">
	import { DocsPageHeader } from 'acrolls/docs';
	let { data } = $props();
</script>

<DocsPageHeader title={data.title} description={data.description} />
{#if data.Article}
	<data.Article />
{/if}
