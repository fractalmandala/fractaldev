<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { EASE_OUT } from '../ease.js';
	import { Icon } from 'fractalicons';
	import { luCalendar, luX } from 'fractalicons/lucide';
	import Calendar from './Calendar.svelte';

	interface Props {
		/** Controlled ISO date (yyyy-mm-dd); null clears. */
		value?: string | null;
		/** Uncontrolled initial ISO date. */
		defaultValue?: string | null;
		placeholder?: string;
		/** Inclusive lower bound (ISO), passed to the calendar. */
		min?: string;
		/** Inclusive upper bound (ISO), passed to the calendar. */
		max?: string;
		/** Extra predicate; returning true disables the date. */
		isDateDisabled?: (iso: string) => boolean;
		/** 0 = weeks start Sunday (default), 1 = Monday. */
		weekStartsOn?: 0 | 1;
		/** BCP-47 locale for labels and the input display. */
		locale?: string;
		/** Show a clear button when a date is set. */
		clearable?: boolean;
		/** Keep the popover open after picking a date. */
		closeOnSelect?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		/** Hidden input name for plain-HTML form submission. */
		name?: string;
		id?: string;
		ariaLabel?: string;
		onValueChange?: (iso: string | null) => void;
		class?: string;
	}

	let {
		value,
		defaultValue = null,
		placeholder = 'Pick a date…',
		min,
		max,
		isDateDisabled,
		weekStartsOn = 0,
		locale = 'en-US',
		clearable = true,
		closeOnSelect = true,
		disabled = false,
		readonly = false,
		name,
		id,
		ariaLabel = 'Date',
		onValueChange,
		class: className
	}: Props = $props();

	const rootClass = $derived(['datepicker', className].filter(Boolean).join(' '));

	const reduce = useReducedMotion();

	let internal = $state<string | null>(untrack(() => defaultValue));
	const controlled = $derived(value !== undefined);
	// Narrowed inline so `current` is string | null, not string | null | undefined.
	const current = $derived(value === undefined ? internal : value);
	const interactive = $derived(!disabled && !readonly);

	let open = $state(false);
	let rootEl = $state<HTMLDivElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);
	const uid = `dp-${Math.random().toString(36).slice(2, 8)}`;

	const display = $derived.by(() => {
		if (!current) return '';
		// 'T00:00:00' forces local-time parsing so timezone shifts can't move the day.
		const date = new Date(`${current}T00:00:00`);
		if (Number.isNaN(date.getTime())) return current;
		return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
	});

	function commit(next: string | null) {
		if (!controlled) internal = next;
		onValueChange?.(next);
	}

	function setOpen(next: boolean) {
		if (!interactive) return;
		open = next;
	}

	// Clearing keeps the popover open so a replacement pick is one click away.
	function pick(iso: string | null) {
		commit(iso);
		if (closeOnSelect && iso !== null) {
			open = false;
			inputEl?.focus();
		}
	}

	function clear() {
		if (!interactive) return;
		commit(null);
		inputEl?.focus();
	}

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (open && rootEl && !rootEl.contains(e.target as Node)) open = false;
		}
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	});
</script>

<div
	bind:this={rootEl}
	class={rootClass}
	data-slot="datepicker"
	data-open={open || undefined}
	data-clearable={clearable && current ? 'true' : undefined}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
>
	{#if name}
		<input type="hidden" {name} value={current ?? ''} />
	{/if}
	<input
		bind:this={inputEl}
		id={id}
		data-slot="datepicker-input"
		role="combobox"
		type="text"
		autocomplete="off"
		readonly
		disabled={disabled}
		{placeholder}
		aria-label={ariaLabel}
		aria-expanded={open}
		aria-haspopup="dialog"
		aria-controls={open ? `${uid}-panel` : undefined}
		value={display}
		onclick={() => setOpen(!open)}
		onkeydown={(e) => {
			if (e.key === 'Escape' && open) {
				e.preventDefault();
				setOpen(false);
			} else if ((e.key === 'ArrowDown' || e.key === 'Enter') && !open) {
				e.preventDefault();
				setOpen(true);
			}
		}}
	/>
	{#if clearable && current && interactive}
		<button
			type="button"
			data-slot="datepicker-clear"
			aria-label="Clear date"
			tabindex="-1"
			onclick={clear}
		>
			<Icon icon={luX} aria-hidden="true" />
		</button>
	{/if}
	<button
		type="button"
		data-slot="datepicker-toggle"
		aria-label={open ? 'Close calendar' : 'Open calendar'}
		tabindex="-1"
		onclick={() => {
			setOpen(!open);
			inputEl?.focus();
		}}
	>
		<Icon icon={luCalendar} aria-hidden="true" />
	</button>

	<AnimatePresence>
		{#if open}
			<motion.div
				key="panel"
				id={`${uid}-panel`}
				data-slot="datepicker-panel"
				role="dialog"
				aria-label={ariaLabel}
				initial={reduce.current ? false : { opacity: 0, y: -4, scale: 0.98 }}
				animate={reduce.current ? undefined : { opacity: 1, y: 0, scale: 1 }}
				exit={reduce.current ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
				transition={{ duration: 0.16, ease: EASE_OUT }}
			>
				<Calendar
					value={current}
					{min}
					{max}
					{isDateDisabled}
					{weekStartsOn}
					{locale}
					onValueChange={pick}
				/>
			</motion.div>
		{/if}
	</AnimatePresence>
</div>

<style lang="sass">
.datepicker
	position: relative
	display: inline-flex
	align-items: center
	width: 100%
	max-width: 280px

	&[data-disabled]
		opacity: 0.5
		pointer-events: none

	[data-slot='datepicker-input']
		display: block
		width: 100%
		height: var(--control-h-md)
		padding-left: var(--space-sm)
		padding-right: 32px
		font-size: var(--text-sm)
		background: var(--bg-input)
		color: var(--text-primary)
		border: 1px solid var(--border)
		border-radius: var(--radius-sm)
		cursor: pointer
		transition: border-color var(--motion-fast) ease
		&:focus-visible
			outline: none
			border-color: var(--theme-color)
			box-shadow: 0 0 0 2px var(--ring)
		&::placeholder
			color: var(--text-muted)

	&[data-clearable] [data-slot='datepicker-input']
		padding-right: 56px

	[data-slot='datepicker-clear']
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
		transition: all var(--motion-fast) ease
		&:hover
			background: var(--state-hover)
			color: var(--text-primary)

	[data-slot='datepicker-toggle']
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
		transition: all var(--motion-fast) ease
		&:hover
			color: var(--text-primary)

:global([data-slot='datepicker-panel'])
	position: absolute
	z-index: var(--z-modal)
	top: calc(100% + 4px)
	left: 0
	border-radius: var(--radius-lg)
	box-shadow: var(--shadow-popover)

:global([data-slot='datepicker-panel'] > [data-slot='calendar'])
	border: 1px solid var(--border)
	box-shadow: none
</style>

