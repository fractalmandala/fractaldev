<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luChevronLeft, luChevronRight } from 'fractalicons/lucide';

	interface Props {
		/** Controlled ISO date (yyyy-mm-dd); null clears the selection. */
		value?: string | null;
		/** Uncontrolled initial ISO date. */
		defaultValue?: string | null;
		/** Any ISO date in the month shown first; defaults to the value's or today's month. */
		defaultMonth?: string;
		/** Inclusive lower bound (ISO). */
		min?: string;
		/** Inclusive upper bound (ISO). */
		max?: string;
		/** Extra predicate; returning true disables the date. */
		isDateDisabled?: (iso: string) => boolean;
		/** 0 = weeks start Sunday (default), 1 = Monday. */
		weekStartsOn?: 0 | 1;
		/** BCP-47 locale for labels. */
		locale?: string;
		ariaLabel?: string;
		onValueChange?: (iso: string | null) => void;
		class?: string;
	}

	let {
		value,
		defaultValue = null,
		defaultMonth,
		min,
		max,
		isDateDisabled,
		weekStartsOn = 0,
		locale = 'en-US',
		ariaLabel = 'Calendar',
		onValueChange,
		class: className
	}: Props = $props();

	let internal = $state<string | null>(untrack(() => defaultValue));
	const controlled = $derived(value !== undefined);
	// Narrowed inline so `current` is string | null, not string | null | undefined.
	const current = $derived(value === undefined ? internal : value);

	// ── ISO date helpers (local wall-clock; no external date lib) ──
	const pad = (n: number) => String(n).padStart(2, '0');
	const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
	const todayIso = isoOf(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

	function parseIso(iso: string): { y: number; m: number; d: number } | null {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
		if (!match) return null;
		const y = Number(match[1]);
		const m = Number(match[2]) - 1;
		const d = Number(match[3]);
		// Reject rollovers like 2026-02-31.
		const date = new Date(y, m, d);
		if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) return null;
		return { y, m, d };
	}

	function addDays(iso: string, days: number): string {
		const p = parseIso(iso);
		if (!p) return iso;
		const date = new Date(p.y, p.m, p.d + days);
		return isoOf(date.getFullYear(), date.getMonth(), date.getDate());
	}

	// ── View month + roving focus ──
	const initial = untrack(() => {
		const p = parseIso(defaultMonth ?? defaultValue ?? todayIso);
		return p ? { y: p.y, m: p.m } : { y: new Date().getFullYear(), m: new Date().getMonth() };
	});
	let viewY = $state(initial.y);
	let viewM = $state(initial.m);
	let focusedIso = $state<string>(untrack(() => current ?? todayIso));
	let gridEl = $state<HTMLDivElement | null>(null);

	function isDisabled(iso: string): boolean {
		if (min && iso < min) return true;
		if (max && iso > max) return true;
		return isDateDisabled ? isDateDisabled(iso) : false;
	}

	interface DayCell {
		iso: string;
		label: number;
		inMonth: boolean;
		disabled: boolean;
	}

	// Six fixed week rows keep month heights stable.
	const weeks = $derived.by(() => {
		const offset = (new Date(viewY, viewM, 1).getDay() - weekStartsOn + 7) % 7;
		const cursor = new Date(viewY, viewM, 1 - offset);
		const out: DayCell[][] = [];
		for (let w = 0; w < 6; w++) {
			const week: DayCell[] = [];
			for (let d = 0; d < 7; d++) {
				const iso = isoOf(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
				week.push({
					iso,
					label: cursor.getDate(),
					inMonth: cursor.getMonth() === viewM,
					disabled: isDisabled(iso)
				});
				cursor.setDate(cursor.getDate() + 1);
			}
			out.push(week);
		}
		return out;
	});

	// Focus always rests on an in-month day for a clean tab entry point.
	const focusedInView = $derived.by(() => {
		const p = parseIso(focusedIso);
		if (p && p.y === viewY && p.m === viewM) return focusedIso;
		const flat = weeks.flat();
		const firstEnabled = flat.find((c) => c.inMonth && !c.disabled);
		return (firstEnabled ?? flat.find((c) => c.inMonth))?.iso ?? todayIso;
	});

	const monthLabel = $derived(
		new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
			new Date(viewY, viewM, 1)
		)
	);

	const weekdayLabels = $derived.by(() => {
		const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
		// 2023-01-01 was a Sunday; offset by the week start.
		return [1, 2, 3, 4, 5, 6, 7].map((d) => fmt.format(new Date(2023, 0, d + weekStartsOn)));
	});

	function commit(next: string | null) {
		if (!controlled) internal = next;
		onValueChange?.(next);
	}

	function select(cell: DayCell) {
		if (cell.disabled) return;
		commit(cell.iso);
		focusedIso = cell.iso;
	}

	function shiftMonth(delta: number) {
		const date = new Date(viewY, viewM + delta, 1);
		viewY = date.getFullYear();
		viewM = date.getMonth();
	}

	// Focus follows across month boundaries; crossing one flips the view.
	function moveFocus(target: string) {
		const p = parseIso(target);
		if (!p) return;
		if (p.y !== viewY || p.m !== viewM) {
			viewY = p.y;
			viewM = p.m;
		}
		focusedIso = target;
		tick().then(() => {
			gridEl?.querySelector<HTMLButtonElement>(`[data-date="${target}"]`)?.focus();
		});
	}

	function weekEdge(edge: 'first' | 'last') {
		for (const week of weeks) {
			const inMonth = week.filter((c) => c.inMonth);
			if (inMonth.some((c) => c.iso === focusedInView)) {
				const target = edge === 'first' ? inMonth[0] : inMonth[inMonth.length - 1];
				if (target) moveFocus(target.iso);
				return;
			}
		}
	}

	// PageUp/PageDown keep the day-of-month, clamped to the target month.
	function sameDayOtherMonth(delta: number) {
		const p = parseIso(focusedInView);
		if (!p) return;
		const last = new Date(p.y, p.m + delta + 1, 0).getDate();
		moveFocus(isoOf(p.y, p.m + delta, Math.min(p.d, last)));
	}

	function onGridKeydown(event: KeyboardEvent) {
		const key = event.key;
		if (
			key === 'ArrowRight' ||
			key === 'ArrowLeft' ||
			key === 'ArrowUp' ||
			key === 'ArrowDown'
		) {
			event.preventDefault();
			const delta =
				key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : key === 'ArrowDown' ? 7 : -7;
			moveFocus(addDays(focusedInView, delta));
		} else if (key === 'Home' || key === 'End') {
			event.preventDefault();
			weekEdge(key === 'Home' ? 'first' : 'last');
		} else if (key === 'PageUp' || key === 'PageDown') {
			event.preventDefault();
			sameDayOtherMonth(key === 'PageUp' ? -1 : 1);
		}
		// Enter/Space activate the focused day button natively.
	}
</script>

<div class={className} data-slot="calendar" role="group" aria-label={ariaLabel}>
	<div data-slot="calendar-header">
		<button
			type="button"
			data-slot="calendar-nav"
			aria-label="Previous month"
			onclick={() => shiftMonth(-1)}
		>
			<Icon icon={luChevronLeft} aria-hidden="true" />
		</button>
		<span data-slot="calendar-month" aria-live="polite">{monthLabel}</span>
		<button
			type="button"
			data-slot="calendar-nav"
			aria-label="Next month"
			onclick={() => shiftMonth(1)}
		>
			<Icon icon={luChevronRight} aria-hidden="true" />
		</button>
	</div>
	<div bind:this={gridEl} data-slot="calendar-grid" role="grid" tabindex="-1" onkeydown={onGridKeydown}>
		<div role="row" data-slot="calendar-weekdays">
			{#each weekdayLabels as label (label)}
				<span role="columnheader" data-slot="calendar-weekday" aria-label={label}>
					{label.slice(0, 2)}
				</span>
			{/each}
		</div>
		{#each weeks as week, wi (wi)}
			<div role="row" data-slot="calendar-week">
				{#each week as cell (cell.iso)}
					<span
						role="gridcell"
						data-slot="calendar-cell"
						aria-selected={cell.inMonth && cell.iso === current}
					>
						{#if cell.inMonth}
							<button
								type="button"
								data-slot="calendar-day"
								data-date={cell.iso}
								tabindex={cell.iso === focusedInView ? 0 : -1}
								aria-disabled={cell.disabled || undefined}
								aria-label={new Intl.DateTimeFormat(locale, {
									weekday: 'long',
									month: 'long',
									day: 'numeric',
									year: 'numeric'
								}).format(new Date(`${cell.iso}T00:00:00`))}
								data-selected={cell.iso === current || undefined}
								data-today={cell.iso === todayIso || undefined}
								onclick={() => select(cell)}
							>
								{cell.label}
							</button>
						{:else}
							<span data-slot="calendar-day" data-outside="true" aria-hidden="true">
								{cell.label}
							</span>
						{/if}
					</span>
				{/each}
			</div>
		{/each}
	</div>
</div>
