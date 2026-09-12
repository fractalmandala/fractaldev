<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The full-bleed master-detail split, from canonical-markups.md §4.
	 *
	 * `.page-sidebar` and `.page-main` are not decoration: `.page-split` is a
	 * grid whose columns are defined for exactly those two children, and the
	 * horizontal padding lives in `.page-main` rather than on the split, so the
	 * sidebar can sit flush. Getting either wrong loses the layout silently.
	 */
	interface Props {
		/** Explorer / file tree. Hidden below 768px. */
		sidebar?: Snippet;
		children: Snippet;
		class?: string;
	}
	let { sidebar, children, class: className = '' }: Props = $props();
</script>

<section class="page-split {className}">
	{#if sidebar}
		<aside class="page-sidebar">{@render sidebar()}</aside>
	{/if}
	<main class="page-main">{@render children()}</main>
</section>
