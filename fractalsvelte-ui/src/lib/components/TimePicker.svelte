<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { EASE_OUT } from '../ease.js';
	import { Icon } from 'fractalicons';
	import { luCheck, luClock, luX } from 'fractalicons/lucide';

	interface Props {
		/** Controlled time in 24h 'HH:MM'; null clears. */
		value?: string | null;
		/** Uncontrolled initial 'HH:MM'. */
		defaultValue?: string | null;
		/** Minutes between options (1–60). */
		step?: number;
		/** Render labels in 12-hour format. */
		hour12?: boolean;
		/** Inclusive lower bound ('HH:MM'). */
		min?: string;
		/** Inclusive upper bound ('HH:MM'). */
		max?: string;
		placeholder?: string;
		/** Show a clear button when a time is set. */
		clearable?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		/** Hidden input name for plain-HTML form submission. */
		name?: string;
		id?: string;
		ariaLabel?: string;
		onValueChange?: (time: string | null) => void;
		class?: string;
	}

	let {
		value,
		defaultValue = null,
		step = 30,
		hour12 = false,
		min,
		max,
		placeholder = 'Pick a time…',
		clearable = true,
		disabled = false,
		readonly = false,
		name,
		id,
		ariaLabel = 'Time',
		onValueChange,
		class: className
	}: Props = $props();

	const reduce = useReducedMotion();

	let internal = $state<string | null>(untrack(() => defaultValue));
	const controlled = $derived(value !== undefined);
	// Narrowed inline so `current` is string | null, not string | null | undefined.
	const current = $derived(value === undefined ? internal : value);
	const interactive = $derived(!disabled && !readonly);

	let open = $state(false);
	let active = $state(-1);
	let rootEl = $state<HTMLDivElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);
	const uid = `tp-${Math.random().toString(36).slice(2, 8)}`;

	const pad = (n: number) => String(n).padStart(2, '0');
	const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

	const options = $derived.by(() => {
		const stepMin = Math.min(60, Math.max(1, Math.round(step)));
		const list: string[] = [];
		for (let mins = 0; mins < 24 * 60; mins += stepMin) {
			const t = `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
			if (min && TIME_RE.test(min) && t < min) continue;
			if (max && TIME_RE.test(max) && t > max) continue;
			list.push(t);
		}
		return list;
	});

	function labelFor(t: string): string {
		const date = new Date(`2000-01-01T${t}:00`);
		if (Number.isNaN(date.getTime())) return t;
		return new Intl.DateTimeFormat(undefined, {
			hour: hour12 ? 'numeric' : '2-digit',
			minute: '2-digit',
			hour12
		}).format(date);
	}

	const inputValue = $derived(current ? labelFor(current) : '');

	function commit(next: string | null) {
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
			const idx = options.findIndex((t) => t === current);
			active = idx >= 0 ? idx : 0;
			scrollActive();
		} else {
			active = -1;
		}
	}

	function select(t: string) {
		if (!interactive) return;
		commit(t);
		setOpen(false);
		inputEl?.focus();
	}

	function clear() {
		if (!interactive) return;
		commit(null);
		inputEl?.focus();
	}

	function move(delta: number) {
		if (!options.length) return;
		active = (active + delta + options.length) % options.length;
		scrollActive();
	}

	function jump(edge: 'first' | 'last') {
		if (!options.length) return;
		active = edge === 'first' ? 0 : options.length - 1;
		scrollActive();
	}

	function onInputKeydown(event: KeyboardEvent) {
		if (!interactive) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!open) setOpen(true);
			else move(event.key === 'ArrowDown' ? 1 : -1);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (!open) setOpen(true);
			else if (options[active]) select(options[active]);
		} else if (event.key === 'Escape' && open) {
			event.preventDefault();
			setOpen(false);
		} else if (event.key === 'Home' || event.key === 'End') {
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
	class={className}
	data-slot="timepicker"
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
		data-slot="timepicker-input"
		role="combobox"
		type="text"
		autocomplete="off"
		readonly
		disabled={disabled}
		{placeholder}
		aria-label={ariaLabel}
		aria-expanded={open}
		aria-controls={open ? `${uid}-list` : undefined}
		aria-activedescendant={open && active >= 0 ? `${uid}-opt-${active}` : undefined}
		value={inputValue}
		onkeydown={onInputKeydown}
		onclick={() => !open && setOpen(true)}
		onfocus={() => !open && setOpen(true)}
	/>
	{#if clearable && current && interactive}
		<button
			type="button"
			data-slot="timepicker-clear"
			aria-label="Clear time"
			tabindex="-1"
			onclick={clear}
		>
			<Icon icon={luX} aria-hidden="true" />
		</button>
	{/if}
	<button
		type="button"
		data-slot="timepicker-toggle"
		aria-label={open ? 'Collapse times' : 'Expand times'}
		tabindex="-1"
		onclick={() => {
			setOpen(!open);
			inputEl?.focus();
		}}
	>
		<Icon icon={luClock} aria-hidden="true" />
	</button>

	<AnimatePresence>
		{#if open}
			<motion.div
				id={`${uid}-list`}
				data-slot="timepicker-list"
				role="listbox"
				aria-label={ariaLabel}
				initial={reduce.current ? false : { opacity: 0, y: -4, scale: 0.98 }}
				animate={reduce.current ? undefined : { opacity: 1, y: 0, scale: 1 }}
				exit={reduce.current ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
				transition={{ duration: 0.16, ease: EASE_OUT }}
			>
				{#each options as t, i (t)}
					<button
						type="button"
						id={`${uid}-opt-${i}`}
						data-slot="timepicker-option"
						role="option"
						aria-selected={t === current}
						data-highlighted={active === i || undefined}
						data-selected={t === current || undefined}
						onclick={() => select(t)}
						onmouseenter={() => (active = i)}
					>
						<span data-slot="timepicker-option-label">{labelFor(t)}</span>
						{#if t === current}
							<span data-slot="timepicker-check"><Icon icon={luCheck} aria-hidden="true" /></span>
						{/if}
					</button>
				{/each}
				{#if options.length === 0}
					<div data-slot="timepicker-empty">No times in range</div>
				{/if}
			</motion.div>
		{/if}
	</AnimatePresence>
</div>
