<script lang="ts">

	let { children } = $props()
	import Sidebar from '$lib/components/ui/Sidebar.svelte'

</script>

<div class="docbox grow row">
	<Sidebar>
		hi
	</Sidebar>
	<section class="mainpage">
		{@render children()}
	</section>
</div>

<style lang="sass">

.docbox
	height: 100%

</style>