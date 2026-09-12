<script lang="ts">
	import { untrack } from 'svelte';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import { useId } from '../../use-id.js';
	import {
		setMorphSelectContext,
		type MorphSelectContext
	} from './context.js';
	import type { MorphSelectProps } from './types.js';

	let {
		value,
		defaultValue,
		onValueChange,
		disabled = false,
		class: className,
		children
	}: MorphSelectProps = $props();

	const reduce = useReducedMotion();
	const baseId = useId();

	let rootEl = $state<HTMLDivElement | null>(null);
	let open = $state(false);
	// Init-only snapshot of the uncontrolled start value.
	let internal = $state<string | undefined>(untrack(() => defaultValue));
	// Ref-counted: items render twice (hidden registrar + open panel), so a
	// label is only dropped once every copy with that value has unmounted.
	let labels = $state<Map<string, { label: string; count: number }>>(new Map());
	let placeholder = $state('Select');

	const controlled = $derived(value !== undefined);
	const current = $derived(controlled ? value : internal);

	function select(next: string) {
		if (!controlled) internal = next;
		onValueChange?.(next);
		open = false;
	}

	function register(v: string, label: string) {
		labels = new Map(labels).set(v, {
			label,
			count: (labels.get(v)?.count ?? 0) + 1
		});
	}

	function unregister(v: string) {
		const entry = labels.get(v);
		if (!entry) return;
		const next = new Map(labels);
		if (entry.count <= 1) next.delete(v);
		else next.set(v, { label: entry.label, count: entry.count - 1 });
		labels = next;
	}

	function labelFor(v: string | undefined) {
		return v === undefined ? undefined : labels.get(v)?.label;
	}

	// Close on Escape or outside pointer press while open.
	$effect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') open = false;
		};
		const onPointer = (e: PointerEvent) => {
			const target = e.target as Node | null;
			if (target && rootEl && !rootEl.contains(target)) open = false;
		};
		window.addEventListener('keydown', onKey);
		window.addEventListener('pointerdown', onPointer);
		return () => {
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('pointerdown', onPointer);
		};
	});

	const ctx: MorphSelectContext = {
		get value() {
			return current;
		},
		get open() {
			return open;
		},
		setOpen(next) {
			open = next;
		},
		select,
		register,
		unregister,
		labelFor,
		get placeholder() {
			return placeholder;
		},
		setPlaceholder(p) {
			placeholder = p;
		},
		get reduce() {
			return reduce.current;
		},
		layoutId: `${baseId}-surface`,
		triggerId: `${baseId}-trigger`,
		listId: `${baseId}-list`,
		get disabled() {
			return disabled;
		}
	};
	setMorphSelectContext(ctx);
</script>

<div bind:this={rootEl} data-slot="select-morph" class={className}>
	{@render children()}
</div>
