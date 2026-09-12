<script lang="ts">
	import { APP_NAME } from '$lib/states/config.svelte';
	import ResizeDemo from '$lib/components/ui/ResizeDemo.svelte';

	let { children } = $props();

</script>

<svelte:head>
	<title>Documentation - {APP_NAME}</title>
	<meta name="description" content="Complete documentation for {APP_NAME}" />
</svelte:head>

<main class="doc-shell grow">
	<ResizeDemo/>
	{@render children()}
</main>



