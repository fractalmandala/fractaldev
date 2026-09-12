<script lang="ts">
	import DocumentPage from '../../../lib/docs/DocumentPage.svelte';
	let { data } = $props();
</script>

<DocumentPage slug={data.slug} Article={data.Article} />
