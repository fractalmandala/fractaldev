<script lang="ts">
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { EASE_OUT } from '../ease.js';

	interface Props {
		/** Absolute deadline — timestamp or Date. Overrides `seconds`. */
		to?: number | Date;
		/** Seconds counted from mount when no `to` is given. */
		seconds?: number;
		running?: boolean;
		/** Always render the days unit. */
		showDays?: boolean;
		onComplete?: () => void;
		class?: string;
	}

	let {
		to,
		seconds = 60,
		running = true,
		showDays = false,
		onComplete,
		class: className
	}: Props = $props();

	const reduce = useReducedMotion();

	// `seconds` anchors to mount time; `to` re-derives whenever it moves.
	const mountedAt = Date.now();
	let now = $state(mountedAt);
	const target = $derived(to === undefined ? mountedAt + seconds * 1000 : new Date(to).getTime());

	// Fire onComplete exactly once per deadline.
	let fired = false;
	$effect(() => {
		void target;
		fired = false;
	});

	$effect(() => {
		if (!running) return;
		now = Date.now();
		const timer = setInterval(() => (now = Date.now()), 250);
		return () => clearInterval(timer);
	});

	const remaining = $derived(Math.max(0, target - now));

	$effect(() => {
		if (remaining <= 0 && !fired) {
			fired = true;
			onComplete?.();
		}
	});

	const total = $derived(Math.ceil(remaining / 1000));
	const days = $derived(Math.floor(total / 86400));
	const hours = $derived(Math.floor((total % 86400) / 3600));
	const minutes = $derived(Math.floor((total % 3600) / 60));
	const secs = $derived(total % 60);
	const withDays = $derived(showDays || days > 0);

	const pad = (n: number) => String(n).padStart(2, '0');

	const ROLL = {
		initial: { y: '55%', opacity: 0 },
		animate: { y: '0%', opacity: 1 },
		exit: { y: '-55%', opacity: 0 },
		transition: { duration: 0.28, ease: EASE_OUT }
	} as const;
</script>

<div class={className} data-slot="countdown" role="timer">
	{#snippet unit(value: string, label: string)}
		<div data-slot="countdown-unit">
			<span data-slot="countdown-value">
				{#if reduce.current}
					<span>{value}</span>
				{:else}
					<AnimatePresence mode="popLayout" initial={false}>
						{#each [value] as v (v)}
							<motion.span
								initial={ROLL.initial}
								animate={ROLL.animate}
								exit={ROLL.exit}
								transition={ROLL.transition}
							>
								{v}
							</motion.span>
						{/each}
					</AnimatePresence>
				{/if}
			</span>
			<span data-slot="countdown-label">{label}</span>
		</div>
	{/snippet}

	{#if withDays}
		{@render unit(pad(days), 'days')}
	{/if}
	{@render unit(pad(hours), 'hrs')}
	{@render unit(pad(minutes), 'min')}
	{@render unit(pad(secs), 'sec')}
</div>
