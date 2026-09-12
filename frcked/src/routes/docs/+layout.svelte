<script lang="ts">
	import { APP_NAME } from '$lib/utils';
	import ResizeDemo from '$lib/actions/ResizeDemo.svelte';

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

<style lang="sass">

.doc-shell
	border-top: 1px solid var(--border)

</style>

