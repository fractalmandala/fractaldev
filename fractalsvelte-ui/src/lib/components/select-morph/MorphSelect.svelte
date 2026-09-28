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
		untrack(() => {
			const current = labels;
			labels = new Map(current).set(v, {
				label,
				count: (current.get(v)?.count ?? 0) + 1
			});
		});
	}

	function unregister(v: string) {
		untrack(() => {
			const current = labels;
			const entry = current.get(v);
			if (!entry) return;
			const next = new Map(current);
			if (entry.count <= 1) next.delete(v);
			else next.set(v, { label: entry.label, count: entry.count - 1 });
			labels = next;
		});
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

<style lang="sass">
[data-slot='select-morph']
	position: relative
	display: inline-flex
	flex-direction: column
	width: 100%

:global([data-slot='select-morph-sizer']),
:global([data-slot='select-morph-registrar'])
	visibility: hidden
	height: 0
	overflow: hidden
	position: absolute
	pointer-events: none

:global([data-slot='select-morph-trigger'])
	position: relative
	display: flex
	align-items: center
	justify-content: space-between
	gap: var(--space-2xs)
	min-height: var(--control-h-md)
	padding: 0 var(--space-sm)
	border: 1px solid var(--border)
	border-radius: var(--radius-4)
	background: var(--bg-input)
	color: var(--text-primary)
	font-size: var(--text-md)
	cursor: pointer

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 1px

	&[data-disabled='true']
		opacity: 0.5
		pointer-events: none

:global([data-slot='select-morph-trigger-label']),
:global([data-slot='select-morph-value'])
	overflow: hidden
	text-overflow: ellipsis
	white-space: nowrap

:global([data-slot='select-morph-trigger-chevron'])
	display: inline-flex
	color: var(--text-muted)

:global([data-slot='select-morph-panel'])
	position: absolute
	z-index: var(--z-modal)
	top: calc(100% + 6px)
	left: 0
	right: 0
	padding: 4px
	background: var(--bg-popover)
	border: 1px solid var(--border)
	border-radius: var(--radius-6)
	box-shadow: var(--shadow-popover)

:global([data-slot='select-morph-header'])
	display: flex
	align-items: center
	justify-content: space-between
	gap: var(--space-2xs)
	padding: var(--space-2xs) var(--space-2xs)
	border-bottom: 1px solid var(--border-subtle)
	font-size: var(--text-sm)
	font-weight: 500
	color: var(--text-primary)

:global([data-slot='select-morph-header-chevron'])
	display: inline-flex
	color: var(--text-muted)

:global([data-slot='select-morph-list'])
	display: flex
	flex-direction: column
	max-height: 240px
	overflow-y: auto

:global([data-slot='select-morph-item'])
	display: flex

:global([data-slot='select-morph-item-button'])
	display: flex
	align-items: center
	gap: var(--space-2xs)
	width: 100%
	padding: var(--space-2xs) var(--space-2xs)
	border: 0
	border-radius: var(--radius-4)
	background: transparent
	color: var(--text-secondary)
	font-size: var(--text-md)
	text-align: left
	cursor: pointer

	&:hover
		background: var(--state-hover)
		color: var(--text-primary)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: -2px

	&[data-selected='true']
		background: var(--state-selected)
		color: var(--text-primary)
		font-weight: 500

:global([data-slot='select-morph-divider'])
	height: 1px
	margin: 4px 4px
	background: var(--border-subtle)
</style>
