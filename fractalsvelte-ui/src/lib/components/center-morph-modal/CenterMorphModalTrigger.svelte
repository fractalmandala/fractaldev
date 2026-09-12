<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useCenterMorphModalContext } from './context.js';

	let { children }: { children: Snippet } = $props();

	const ctx = useCenterMorphModalContext('CenterMorphModalTrigger');

	// The child renders inside this span: Svelte has no cloneElement, so the
	// handlers/aria live on the wrapper. An inline span hugs the child and the
	// child's own click still bubbles here, so defaultPrevented composes like
	// the React original. tabindex=-1 makes the span programmatically
	// focusable so focus can return to it when the modal closes.
	function compose(event: Event, handler: () => void) {
		if (!event.defaultPrevented) handler();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_no_noninteractive_tabindex, a11y_click_events_have_key_events — Svelte has no cloneElement; the wrapper carries the ARIA wiring, and the child (a real button) receives keyboard activation itself. -->
<span
	id={ctx.triggerId}
	tabindex={-1}
	data-slot="center-morph-modal-trigger"
	aria-haspopup="dialog"
	aria-expanded={ctx.open}
	aria-controls={ctx.open ? ctx.contentId : undefined}
	data-state={ctx.open ? 'open' : 'closed'}
	onclick={(e) => compose(e, () => ctx.setOpen(!ctx.open))}
>
	{@render children()}
</span>
