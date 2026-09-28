<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { NavigationEdge } from '#lib/data/componentTypes.ts';
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { EASE_OUT } from '../ease.js';
	import { Icon } from 'fractalicons';
	import { luCheck, luChevronDown, luX } from 'fractalicons/lucide';

	export interface ComboboxOption {
		value: string;
		/** Defaults to value. */
		label?: string;
		/** Secondary line under the label. */
		hint?: string;
		disabled?: boolean;
	}

	interface Props {
		options: ComboboxOption[];
		/** Controlled selected value. When set the component is fully controlled. */
		value?: string;
		/** Uncontrolled initial value. */
		defaultValue?: string;
		placeholder?: string;
		/** Typed text filters the list; false turns it into a plain picker. */
		searchable?: boolean;
		/** Show a clear button when a value is set. */
		clearable?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		/** Hidden input name for plain-HTML form submission. */
		name?: string;
		id?: string;
		ariaLabel?: string;
		onValueChange?: (value: string) => void;
		class?: string;
	}

	let {
		options,
		value,
		defaultValue = '',
		placeholder = 'Select…',
		searchable = true,
		clearable = true,
		disabled = false,
		readonly = false,
		name,
		id,
		ariaLabel = 'Combobox',
		onValueChange,
		class: className = ''
	}: Props = $props();

	const rootClass = $derived(`combobox-root ${className}`.trim());
	const reduce = useReducedMotion();

	let internal = $state(untrack(() => defaultValue));
	const controlled = $derived(value !== undefined);
	// Narrowed inline so `current` is a string, not string | undefined.
	const current = $derived(value === undefined ? internal : value);
	const interactive = $derived(!disabled && !readonly);

	let open = $state(false);
	let query = $state('');
	let active = $state(-1);
	let rootEl = $state<HTMLDivElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);

	const uid = `cb-${Math.random().toString(36).slice(2, 8)}`;

	const labelOf = (option: ComboboxOption) => option.label ?? option.value;

	const labelFor = (v: string) => labelOf(options.find((o) => o.value === v) ?? { value: v });

	const selectedOption = $derived(options.find((o) => o.value === current) ?? null);

	// The input shows the query while filtering, otherwise the selected label.
	const inputValue = $derived(open && searchable ? query : current ? labelFor(current) : '');

	const filtered = $derived.by(() => {
		if (!searchable || !open || !query.trim()) return options;
		const q = query.trim().toLowerCase();
		return options.filter(
			(o) => labelOf(o).toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
		);
	});

	// Options that can actually take a selection.
	const enabled = $derived(filtered.filter((o) => !o.disabled));

	function commit(next: string) {
		if (!controlled) internal = next;
		onValueChange?.(next);
	}

	function scrollActive() {
		queueMicrotask(() => {
			rootEl?.querySelector(`#${uid}-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
		});
	}

	function setOpen(next: boolean) {
		if (!interactive) return;
		open = next;
		if (next) {
			query = '';
			const idx = filtered.findIndex((o) => o.value === current);
			active = idx >= 0 ? idx : 0;
			scrollActive();
			queueMicrotask(() => inputEl?.focus());
		} else {
			active = -1;
			query = '';
		}
	}

	function select(option: ComboboxOption) {
		if (option.disabled || !interactive) return;
		commit(option.value);
		setOpen(false);
		inputEl?.focus();
	}

	function clear() {
		if (!interactive) return;
		commit('');
		inputEl?.focus();
	}

	function move(delta: number) {
		if (!enabled.length) return;
		const idx = enabled.findIndex((o) => o.value === filtered[active]?.value);
		const target = enabled[(idx + delta + enabled.length) % enabled.length];
		if (!target) return;
		active = filtered.indexOf(target);
		scrollActive();
	}

	function jump(edge: NavigationEdge) {
		if (!enabled.length) return;
		const target = edge === 'first' ? enabled[0] : enabled[enabled.length - 1];
		if (!target) return;
		active = filtered.indexOf(target);
		scrollActive();
	}

	function onInput(event: Event) {
		query = (event.target as HTMLInputElement).value;
		active = 0;
		if (!open) open = true;
	}

	// ArrowUp/Down navigate (opening on demand), Enter commits the active
	// option, Escape closes. Home/End are only hijacked when the input is not
	// text-editable; focus never enters the list (aria-activedescendant pattern).
	function onInputKeydown(event: KeyboardEvent) {
		if (!interactive) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!open) setOpen(true);
			else move(event.key === 'ArrowDown' ? 1 : -1);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (!open) {
				setOpen(true);
			} else {
				const target = filtered[active];
				if (target) select(target);
			}
		} else if (event.key === 'Escape' && open) {
			event.preventDefault();
			setOpen(false);
		} else if (!searchable && (event.key === 'Home' || event.key === 'End')) {
			event.preventDefault();
			if (!open) setOpen(true);
			else jump(event.key === 'Home' ? 'first' : 'last');
		}
	}

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (open && rootEl && !rootEl.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	});
</script>

<div
	bind:this={rootEl}
	class={rootClass}
	data-slot="combobox"
	data-open={open || undefined}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-clearable={clearable && current ? 'true' : undefined}
>
	{#if name}
		<input type="hidden" {name} value={current} />
	{/if}
	<input
		bind:this={inputEl}
		id={id}
		data-slot="combobox-input"
		role="combobox"
		type="text"
		autocomplete="off"
		readonly={!searchable || undefined}
		disabled={disabled}
		{placeholder}
		aria-label={ariaLabel}
		aria-expanded={open}
		aria-controls={open ? `${uid}-list` : undefined}
		aria-activedescendant={open && active >= 0 ? `${uid}-opt-${active}` : undefined}
		aria-autocomplete={searchable ? 'list' : undefined}
		value={inputValue}
		oninput={onInput}
		onkeydown={onInputKeydown}
		onclick={() => !open && setOpen(true)}
		onfocus={() => !open && setOpen(true)}
	/>
	{#if clearable && current && interactive}
		<button
			type="button"
			data-slot="combobox-clear"
			aria-label="Clear selection"
			tabindex="-1"
			onclick={clear}
		>
			<Icon icon={luX} aria-hidden="true" />
		</button>
	{/if}
	<button
		type="button"
		data-slot="combobox-toggle"
		aria-label={open ? 'Collapse options' : 'Expand options'}
		tabindex="-1"
		onclick={() => {
			setOpen(!open);
			inputEl?.focus();
		}}
	>
		<Icon icon={luChevronDown} aria-hidden="true" />
	</button>

	<AnimatePresence>
		{#if open}
			<motion.div
				key="list"
				id={`${uid}-list`}
				data-slot="combobox-list"
				role="listbox"
				aria-label={ariaLabel}
				initial={reduce.current ? false : { opacity: 0, y: -4, scale: 0.98 }}
				animate={reduce.current ? undefined : { opacity: 1, y: 0, scale: 1 }}
				exit={reduce.current ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
				transition={{ duration: 0.16, ease: EASE_OUT }}
			>
				{#each filtered as option, i (option.value)}
					<button
						type="button"
						id={`${uid}-opt-${i}`}
						data-slot="combobox-option"
						role="option"
						aria-selected={option.value === current}
						aria-disabled={option.disabled || undefined}
						data-highlighted={active === i || undefined}
						data-selected={option.value === current || undefined}
						disabled={option.disabled}
						onclick={() => select(option)}
						onmouseenter={() => !option.disabled && (active = i)}
					>
						<span data-slot="combobox-option-label">{labelOf(option)}</span>
						{#if option.hint}<span data-slot="combobox-option-hint">{option.hint}</span>{/if}
						{#if option.value === current}
							<span data-slot="combobox-check"><Icon icon={luCheck} aria-hidden="true" /></span>
						{/if}
					</button>
				{/each}
				{#if filtered.length === 0}
					<div data-slot="combobox-empty">No matches</div>
				{/if}
			</motion.div>
		{/if}
	</AnimatePresence>
</div>

<style lang="sass">

.combobox-root
	position: relative
	display: inline-flex
	align-items: center
	width: 100%
	font-family: inherit

	&[data-disabled='true']
		opacity: 0.5
		pointer-events: none

	[data-slot='combobox-input']
		display: block
		width: 100%
		height: var(--control-h-md)
		padding-left: var(--space-sm)
		padding-right: 32px
		font-family: inherit
		font-size: var(--text-sm)
		background: var(--bg-input)
		color: var(--text-primary)
		border: 1px solid var(--border)
		border-radius: var(--radius-sm)
		transition: border-color var(--motionin1)

		&:focus-visible
			outline: none
			border-color: var(--theme-color)
			box-shadow: 0 0 0 2px var(--ring)

		&::placeholder
			color: var(--text-muted)

	&[data-clearable='true'] [data-slot='combobox-input']
		padding-right: 56px

	[data-slot='combobox-clear']
		position: absolute
		right: 30px
		top: 50%
		transform: translateY(-50%)
		display: inline-flex
		align-items: center
		justify-content: center
		width: 20px
		height: 20px
		border: 0
		border-radius: var(--radius-full)
		background: transparent
		color: var(--text-muted)
		cursor: pointer
		transition: background var(--motionin1), color var(--motionin1)

		&:hover
			background: var(--state-hover)
			color: var(--text-primary)

	[data-slot='combobox-toggle']
		position: absolute
		right: 6px
		top: 50%
		transform: translateY(-50%)
		display: inline-flex
		align-items: center
		justify-content: center
		width: 24px
		height: 24px
		border: 0
		border-radius: var(--radius-sm)
		background: transparent
		color: var(--text-muted)
		cursor: pointer
		transition: transform var(--motionin1), color var(--motionin1)

		&:hover
			color: var(--text-primary)

	&[data-open='true'] [data-slot='combobox-toggle']
		transform: translateY(-50%) rotate(180deg)

	:global([data-slot='combobox-list'])
		position: absolute
		z-index: var(--z-modal, 1000)
		top: calc(100% + 4px)
		left: 0
		right: 0
		max-height: 240px
		overflow-y: auto
		padding: 4px
		background: var(--bg-popover, var(--bg-surface))
		border: 1px solid var(--border)
		border-radius: var(--radius-md)
		box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.15))
		display: flex
		flex-direction: column
		gap: 1px

	:global([data-slot='combobox-option'])
		display: flex
		align-items: center
		justify-content: space-between
		gap: var(--space-xs)
		width: 100%
		padding: var(--space-2xs) var(--space-xs)
		border: 0
		border-radius: var(--radius-sm)
		background: transparent
		color: var(--text-primary)
		font-family: inherit
		font-size: var(--text-sm)
		text-align: left
		cursor: pointer
		transition: background var(--motionin1)

		&[data-highlighted='true'],
		&:hover:not(:disabled)
			background: var(--state-hover)

		&[data-selected='true']
			background: var(--state-selected)
			font-weight: 500

		&:disabled
			opacity: 0.4
			cursor: not-allowed

	:global([data-slot='combobox-option-label'])
		flex: 1
		overflow: hidden
		text-overflow: ellipsis
		white-space: nowrap

	:global([data-slot='combobox-option-hint'])
		font-size: var(--text-xs)
		color: var(--text-muted)

	:global([data-slot='combobox-check'])
		display: inline-flex
		color: var(--theme-color)
		flex-shrink: 0

	:global([data-slot='combobox-empty'])
		padding: var(--space-sm)
		font-size: var(--text-sm)
		color: var(--text-muted)
		text-align: center
</style>
