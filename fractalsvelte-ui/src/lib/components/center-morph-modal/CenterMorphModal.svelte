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

<style lang="sass">
[data-slot='center-morph-modal']
	display: contents

:global([data-slot='center-morph-modal-trigger'])
	display: inline-flex
	cursor: pointer

:global([data-slot='center-morph-modal-portal'])
	position: fixed
	inset: 0
	z-index: var(--z-modal)
	display: grid
	place-items: center
	padding: var(--space-lg)

:global([data-slot='center-morph-modal-backdrop'])
	position: absolute
	inset: 0
	background: rgba(0, 0, 0, 0.45)

:global([data-slot='center-morph-modal-panel'])
	position: relative
	width: min(420px, 92vw)
	max-height: min(560px, 86vh)
	overflow-y: auto
	background: var(--bg-popover)
	border: 1px solid var(--border)
	border-radius: var(--radius-12)
	box-shadow: var(--shadow-lg)

:global([data-slot='center-morph-modal-close'])
	position: absolute
	top: var(--space-xs)
	right: var(--space-xs)
	display: inline-flex
	align-items: center
	justify-content: center
	width: var(--control-h-sm, 28px)
	height: var(--control-h-sm, 28px)
	border: 0
	border-radius: var(--radius-full)
	background: var(--state-hover)
	color: var(--text-secondary)
	cursor: pointer

	&:hover
		background: var(--state-hover)
		color: var(--text-primary)
</style>
