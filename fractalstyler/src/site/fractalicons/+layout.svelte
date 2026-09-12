<script lang="ts">
	import AppmainRails from '$lib/components/shell/AppmainRails.svelte';
	import Sidebar from '$site/components/docs-nav.svelte';
	let { children } = $props();
</script>

<AppmainRails>
	{#snippet sidebarLeft()}
		<div class="navtree pad-sm">
			<Sidebar/>
		</div>
	{/snippet}

	{@render children()}

	{#snippet sidebarRight()}
		<div class="toc">
			hi
		</div>
	{/snippet}
</AppmainRails>