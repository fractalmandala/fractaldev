<script lang="ts">

	import type { Snippet } from 'svelte';

	interface Props {
		appFooter: Snippet;
		appHeader: Snippet;
		children: Snippet;
	}

	let {
		appFooter,
		appHeader,
		children
	}: Props = $props()

</script>

<div class="app-shell">
	<header class="app-header">
		{@render appHeader()}
	</header>
	<main class="app-main">
		{@render children()}
	</main>
	<footer class="app-footer">
		{@render appFooter()}
	</footer>
</div>