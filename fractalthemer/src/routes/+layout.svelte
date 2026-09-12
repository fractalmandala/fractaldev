<script lang="ts">
	import '$lib/styles/index.sass';
	import './app-shell.sass';
	import AuraBackground from '$lib/components/AuraBackground.svelte';
	import ThemePicker from '$lib/components/ThemePicker.svelte';

	let { children } = $props();
</script>

<AuraBackground />

<div class="appshell">
	<header class="themer-header row ycenter xbetween">
		<nav class="row gap32 ycenter">
			<a class="nav-link" href="/">fractalthemer</a>
		</nav>
		<div class="row ycenter gap16">
			<ThemePicker />
		</div>
	</header>
	<main class="themer-main">
		{@render children()}
	</main>
</div>

