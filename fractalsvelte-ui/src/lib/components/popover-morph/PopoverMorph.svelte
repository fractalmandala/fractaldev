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
