<script lang="ts">
	let { children } = $props();
	import Sidebar from '$lib/components/ui/Sidebar.svelte';
	import '$lib/actions/index'
</script>

<div class="row grow full min0">
	<Sidebar initial={320} min={180} max={520} collapseBelow={110} storageKey="wiki-sidebar-w">
		<div class="box gap-sm pad-md font-mono">
				<a href="/wiki" class="nav-l1 active text-sm">Resize Engine Demo</a>
		</div>
	</Sidebar>
	<section class="grow scroll-y pad-lg min0">
		{@render children()}
	</section>
</div>