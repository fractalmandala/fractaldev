<script lang="ts">
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import { untrack, type Snippet } from 'svelte';
	import {
		setContextMenuContext,
		type ContextMenuContextValue,
		type MenuPoint,
		type OpenModality
	} from './context-menu-context.js';

	let {
		children,
		open: controlledOpen,
		defaultOpen = false,
		onOpenChange,
		class: className
	}: {
		children: Snippet;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		class?: string;
	} = $props();

	const reduce = useReducedMotion();
	const menuId = `fs-context-menu-${Math.random().toString(36).slice(2, 8)}`;
	let internalOpen = $state(untrack(() => defaultOpen));
	let point = $state<MenuPoint>({ x: 0, y: 0 });
	let modality = $state<OpenModality>('pointer');
	let invocation = $state(0);
	let activeId = $state<string | null>(null);
	let triggerEl: HTMLElement | null = null;
	let contentEl: HTMLDivElement | null = null;

	const controlled = $derived(controlledOpen !== undefined);
	const open = $derived(controlled ? controlledOpen! : internalOpen);

	function setOpen(next: boolean) {
		if (!controlled) internalOpen = next;
		onOpenChange?.(next);
		if (!next) activeId = null;
	}

	function openAt(nextPoint: MenuPoint, nextModality: OpenModality) {
		point = nextPoint;
		modality = nextModality;
		invocation += 1;
		activeId = null;
		setOpen(true);
	}

	$effect(() => {
		if (!open) return;
		const onPointerDown = (event: PointerEvent) => {
			if (!contentEl?.contains(event.target as Node)) setOpen(false);
		};
		const onWindowChange = () => setOpen(false);
		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('resize', onWindowChange);
		window.addEventListener('scroll', onWindowChange);
		return () => {
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('resize', onWindowChange);
			window.removeEventListener('scroll', onWindowChange);
		};
	});

	const ctx: ContextMenuContextValue = {
		get open() {
			return open;
		},
		setOpen,
		openAt,
		get point() {
			return point;
		},
		get modality() {
			return modality;
		},
		get invocation() {
			return invocation;
		},
		menuId,
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
		},
		get activeId() {
			return activeId;
		},
		setActiveId(id) {
			activeId = id;
		},
		get reduce() {
			return reduce.current;
		}
	};
	setContextMenuContext(ctx);
</script>

<div data-slot="context-menu" class={className}>
	{@render children()}
</div>
