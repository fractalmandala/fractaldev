<script lang="ts">
	import { untrack } from 'svelte';
	import { useId } from '../../use-id.js';
	import {
		setCenterMorphModalContext,
		type CenterMorphModalContext
	} from './context.js';
	import type { CenterMorphModalProps } from './types.js';

	let {
		children,
		open: controlledOpen,
		defaultOpen = false,
		onOpenChange
	}: CenterMorphModalProps = $props();

	const baseId = useId();
	let internalOpen = $state(untrack(() => defaultOpen));

	const controlled = $derived(controlledOpen !== undefined);
	const open = $derived(controlled ? controlledOpen ?? false : internalOpen);

	function setOpen(next: boolean) {
		if (!controlled) internalOpen = next;
		onOpenChange?.(next);
	}

	const ctx: CenterMorphModalContext = {
		get open() {
			return open;
		},
		setOpen,
		triggerId: `${baseId}-trigger`,
		contentId: `${baseId}-content`
	};
	setCenterMorphModalContext(ctx);
</script>

<div data-slot="center-morph-modal">
	{@render children()}
</div>
