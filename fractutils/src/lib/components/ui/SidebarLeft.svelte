<script lang="ts">

	import { allItems, getItems, type SingleItem, itemTypes } from "$lib/data/singletons.js";
	const singleitems = getItems()

</script>

{#each itemTypes as item}
	<div class="box">
		<span>{item.name}</span>
	</div>
{/each}
	<div class="box">
		<a href="/philosophy">Fractalstyler</a>
	</div>