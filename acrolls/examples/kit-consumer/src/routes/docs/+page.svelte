<script lang="ts">
	import DocumentPage from '../../lib/docs/DocumentPage.svelte';
	let { data } = $props();
</script>

<DocumentPage slug="" Article={data.Article} />
