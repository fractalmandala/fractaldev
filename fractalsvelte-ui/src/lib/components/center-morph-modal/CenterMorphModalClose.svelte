<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useCenterMorphModalContext } from './context.js';

	let { children }: { children: Snippet } = $props();

	const ctx = useCenterMorphModalContext('CenterMorphModalClose');

	function compose(event: Event, handler: () => void) {
		if (!event.defaultPrevented) handler();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events — Svelte has no cloneElement; the wrapper carries the click, and the child's own click bubbles here, so defaultPrevented composes like the React original. -->
<span
	data-slot="center-morph-modal-close-trigger"
	onclick={(e) => compose(e, () => ctx.setOpen(false))}
>
	{@render children()}
</span>
