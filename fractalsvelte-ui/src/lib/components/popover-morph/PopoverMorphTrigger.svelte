<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getMorphPopoverContext } from './context.js';

	let { children }: { children: Snippet } = $props();

	const ctx = getMorphPopoverContext('MorphPopoverTrigger');

	// Svelte has no cloneElement, so the aria + click live on this wrapper span;
	// the child (a Button) is the real focusable element and activates via its
	// own click, which bubbles here.
	let triggerEl: HTMLElement | null = null;
	$effect(() => {
		ctx.triggerRef.current = triggerEl;
		return () => {
			ctx.triggerRef.current = null;
		};
	});

	function handleKeydown(event: KeyboardEvent) {
		// Only act when the wrapper itself is focused: real interactive children
		// (buttons, links) fire their own click, which bubbles here and would
		// double-toggle if we also handled Enter/Space.
		if (event.target !== triggerEl) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			ctx.toggle();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions — the wrapper delegates
     interactivity to the child (a Button), which is the focusable element. -->
<span
	bind:this={triggerEl}
	id={ctx.triggerId}
	data-slot="popover-morph-trigger"
	aria-haspopup="dialog"
	aria-expanded={ctx.open}
	aria-controls={ctx.open ? ctx.contentId : undefined}
	data-state={ctx.open ? 'open' : 'closed'}
	onclick={() => ctx.toggle()}
	onkeydown={handleKeydown}
>
	{@render children()}
</span>
