<script lang="ts">

		import type { Snippet } from 'svelte';

		interface Props {
			mainType: boolean;
			children: Snippet
		}
	
	let { children, mainType = false } = $props();
</script>

<section class="main-section">
	{#if mainType === true}
		<div class="content-section">
			{@render children()}
		</div>
	{:else}
		{@render children()}
	{/if}
</section>
