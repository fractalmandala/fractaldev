<script lang="ts">
	import { Landing } from '$lib/landing';
	import { APP_NAME } from '$lib/states/config.svelte';
</script>

<svelte:head>
	<title>{APP_NAME} Landing</title>
	<meta name="description" content="Landing page" />
</svelte:head>

<div style="view-transition-name: page-title">
	<h1 class="sr-only">Landing</h1>
</div>

<div class="main-section" style="view-transition-name: landing-content">
	<Landing />
</div>
