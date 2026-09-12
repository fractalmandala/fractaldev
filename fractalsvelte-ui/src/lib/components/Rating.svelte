<script lang="ts">
	import { untrack } from 'svelte';
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { SPRING_PRESS } from '../ease.js';
	import { Icon } from 'fractalicons';
	import { luStar, luStarHalf } from 'fractalicons/lucide';

	interface Props {
		/** Controlled value. When set the component is fully controlled. */
		value?: number;
		/** Uncontrolled start value. */
		defaultValue?: number;
		/** Star count. */
		max?: number;
		disabled?: boolean;
		/** Display-only: pointer and keyboard input are inert. */
		readonly?: boolean;
		/** Accessible name for the group. */
		ariaLabel?: string;
		onValueChange?: (value: number) => void;
		class?: string;
	}

	let {
		value,
		defaultValue = 0,
		max = 5,
		disabled = false,
		readonly = false,
		ariaLabel = 'Rating',
		onValueChange,
		class: className
	}: Props = $props();

	const reduce = useReducedMotion();

	let internal = $state(untrack(() => defaultValue));
	const controlled = $derived(value !== undefined);
	// Narrowed inline so `current` is a number, not number | undefined.
	const current = $derived(value === undefined ? internal : value);
	let hovered = $state<number | null>(null);
	let rootEl = $state<HTMLDivElement | null>(null);

	const interactive = $derived(!disabled && !readonly);
	// Hover previews the pending value; otherwise the committed one shows.
	const visual = $derived(hovered ?? current);

	function select(next: number) {
		if (!interactive) return;
		if (!controlled) internal = next;
		onValueChange?.(next);
	}

	function focusStar(n: number) {
		rootEl?.querySelector<HTMLElement>(`[data-value='${n}']`)?.focus();
	}

	// Roving-tabindex radiogroup: arrows step, Home/End bound, focus follows
	// the selection. Fractional (controlled) values snap to whole stars.
	function onKeydown(event: KeyboardEvent) {
		if (!interactive) return;
		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowUp': {
				event.preventDefault();
				const next = Math.min(max, Math.floor(current) + 1);
				select(next);
				focusStar(next);
				break;
			}
			case 'ArrowLeft':
			case 'ArrowDown': {
				event.preventDefault();
				if (current > 1) {
					const next = Math.ceil(current) - 1;
					select(next);
					focusStar(next);
				}
				break;
			}
			case 'Home':
				event.preventDefault();
				select(1);
				focusStar(1);
				break;
			case 'End':
				event.preventDefault();
				select(max);
				focusStar(max);
				break;
		}
	}
</script>

<div
	bind:this={rootEl}
	class={className}
	data-slot="rating"
	role="radiogroup"
	tabindex="-1"
	aria-label={ariaLabel}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	onkeydown={onKeydown}
	onmouseleave={() => (hovered = null)}
>
	{#each Array.from({ length: max }, (_, i) => i + 1) as n (n)}
		{@const star = visual >= n ? 'full' : visual > n - 1 ? 'half' : 'empty'}
		<motion.button
			type="button"
			role="radio"
			aria-checked={current === n}
			aria-label="{n} {n === 1 ? 'star' : 'stars'}"
			tabindex={current === n || (current === 0 && n === 1) ? 0 : -1}
			disabled={disabled}
			data-value={n}
			data-slot="rating-star"
			data-active={star !== 'empty' || undefined}
			whileHover={interactive && !reduce.current ? { scale: 1.15 } : undefined}
			whileTap={interactive && !reduce.current ? { scale: 0.85 } : undefined}
			transition={reduce.current ? undefined : SPRING_PRESS}
			onclick={() => select(n)}
			onmouseenter={() => {
				if (interactive) hovered = n;
			}}
		>
			{#if star === 'half'}
				<Icon icon={luStarHalf} size={16} aria-hidden="true" />
			{:else}
				<Icon icon={luStar} size={16} aria-hidden="true" />
			{/if}
		</motion.button>
	{/each}
</div>
