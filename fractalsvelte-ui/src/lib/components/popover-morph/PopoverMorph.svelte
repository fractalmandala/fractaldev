<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { useId } from '../../use-id.js';
	import {
		setMorphPopoverContext,
		type MorphPopoverContext
	} from './context.js';

	let {
		children,
		open: controlledOpen,
		defaultOpen = false,
		onOpenChange,
		class: className
	}: {
		children: Snippet;
		/** Controlled open state. */
		open?: boolean;
		/** Uncontrolled initial open state. */
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		class?: string;
	} = $props();

	const baseId = useId();
	const triggerId = `${baseId}-trigger`;
	const contentId = `${baseId}-content`;
	let rootEl: HTMLDivElement | null = null;
	let triggerEl: HTMLElement | null = null;
	let contentEl: HTMLDivElement | null = null;

	let internalOpen = $state(untrack(() => defaultOpen));
	const controlled = $derived(controlledOpen !== undefined);
	const open = $derived(controlled ? controlledOpen! : internalOpen);

	function setOpen(next: boolean) {
		if (!controlled) internalOpen = next;
		onOpenChange?.(next);
	}

	function toggle() {
		setOpen(!open);
	}

	$effect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		const onPointer = (e: PointerEvent) => {
			const target = e.target as Node | null;
			if (target && rootEl && !rootEl.contains(target) && !contentEl?.contains(target)) {
				setOpen(false);
			}
		};
		window.addEventListener('keydown', onKey);
		window.addEventListener('pointerdown', onPointer);
		return () => {
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('pointerdown', onPointer);
		};
	});

	const ctx: MorphPopoverContext = {
		get open() {
			return open;
		},
		setOpen,
		toggle,
		triggerId,
		contentId,
		triggerRef: {
			get current() {
				return triggerEl;
			},
			set current(node) {
				triggerEl = node;
			}
		},
		contentRef: {
			get current() {
				return contentEl;
			},
			set current(node) {
				contentEl = node;
			}
		}
	};
	setMorphPopoverContext(ctx);
</script>

<div bind:this={rootEl} data-slot="popover-morph" class={className}>
	{@render children()}
</div>

<style lang="sass">
[data-slot='popover-morph']
	position: relative
	display: inline-flex

:global([data-slot='popover-morph-trigger'])
	display: inline-flex
	cursor: pointer

:global([data-slot='popover-morph-panel'])
	position: absolute
	z-index: var(--z-modal)
	top: calc(100% + 8px)
	left: 0
	min-width: 220px
	padding: var(--space-sm)
	background: var(--bg-popover)
	border: 1px solid var(--border)
	border-radius: var(--radius-8)
	box-shadow: var(--shadow-popover)

	&[data-side='top']
		top: auto
		bottom: calc(100% + 8px)

	&[data-side='left']
		top: 0
		left: auto
		right: calc(100% + 8px)

	&[data-side='right']
		top: 0
		left: calc(100% + 8px)
</style>
