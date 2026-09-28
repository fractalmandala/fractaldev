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
		[key: string]: unknown;
	}

	let {
		to,
		seconds = 60,
		running = true,
		showDays = false,
		onComplete,
		class: className = '',
		...rest
	}: Props = $props();

	const reduce = useReducedMotion();

	const mountedAt = Date.now();
	let now = $state(mountedAt);
	const target = $derived(to === undefined ? mountedAt + seconds * 1000 : new Date(to).getTime());

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

	const rootClass = $derived(`countdown-root ${className}`.trim());
</script>

<div class={rootClass} data-slot="countdown" role="timer" {...rest}>
	{#snippet unit(value: string, label: string)}
		<div data-slot="countdown-unit">
			<span data-slot="countdown-value">
				{#if reduce.current}
					<span>{value}</span>
				{:else}
					<AnimatePresence mode="popLayout" initial={false}>
						{#each [value] as v (v)}
							<motion.span
								key={v}
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

<style lang="sass">

.countdown-root
	display: inline-flex
	align-items: center
	gap: var(--space-xs)

	[data-slot='countdown-unit']
		display: flex
		flex-direction: column
		align-items: center
		justify-content: center
		min-width: 52px
		padding: var(--space-2xs) var(--space-xs)
		background: var(--bg-surface)
		border: 1px solid var(--border)
		border-radius: var(--radius-md)
		box-shadow: var(--shadow-sm)

	[data-slot='countdown-value']
		position: relative
		display: flex
		align-items: center
		justify-content: center
		height: 32px
		overflow: hidden
		font-family: var(--font-mono, monospace)
		font-size: var(--text-xl)
		font-weight: 700
		font-variant-numeric: tabular-nums
		color: var(--text-primary)
		line-height: 1

	[data-slot='countdown-label']
		font-size: 10px
		font-weight: 600
		text-transform: uppercase
		letter-spacing: 0.06em
		color: var(--text-muted)
		margin-top: 2px
</style>
