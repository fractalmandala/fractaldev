<script lang="ts">
	import { Settings } from '$lib/components/main';
</script>

<svelte:head>
	<title>Settings</title>
	<meta name="description" content="Configure application settings and preferences" />
</svelte:head>

<div style="view-transition-name: page-title">
	<h1 class="sr-only">Settings</h1>
</div>

<div class="pad-x-16 pad-y-32 sm:px-6 lg:px-8" style="view-transition-name: settings-content">
	<Settings />
</div>
