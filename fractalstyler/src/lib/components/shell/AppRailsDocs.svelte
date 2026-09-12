<script lang="ts">

	import type { Snippet } from 'svelte';

	interface Props {
		sidebarLeft: Snippet;
		sidebarRight: Snippet;
		children: Snippet;
	}

	let {
		sidebarLeft,
		sidebarRight,
		children
	}: Props = $props()

</script>

<main class="app-main">
	<aside class="sidebar-left">
		{@render sidebarLeft()}
	</aside>
	<main class="app-main">
		{@render children()}
	</main>
	<aside class="sidebar-right">
		{@render sidebarRight()}
	</aside>
</main>