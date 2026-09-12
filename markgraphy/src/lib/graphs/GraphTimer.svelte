<script module lang="ts">
	import type { GraphPalette } from '../frame/tone';

	/** Elapsed time, how long ago, or the local clock. */
	export type TimerKind = 'elapsed' | 'ago' | 'clock';

	export interface GraphTimerProps {
		title: string;
		kind?: TimerKind;
		at?: Date | number | string;
		caption?: string;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { formatAgo, formatClock, formatHms, graphNow, parseInstant } from '../frame/clock';
	import { reveal } from '../frame/motion';

	let {
		title,
		kind = 'elapsed',
		at,
		caption,
		palette,
		corner,
		class: className = ''
	}: GraphTimerProps = $props();

	const time = graphNow();
	const origin = $derived(at == null ? Number.NaN : parseInstant(at));

	const view = $derived.by(() => {
		const placeholder = { value: kind === 'ago' ? '0s ago' : '00:00:00', spoken: 'timer' };

		if ($time == null) {
			return placeholder;
		}

		if (kind === 'clock') {
			const value = formatClock($time);
			return { value, spoken: `local time ${value}` };
		}

		if (!Number.isFinite(origin)) {
			return placeholder;
		}

		const elapsed = Math.max(0, $time - origin);

		if (kind === 'ago') {
			const value = formatAgo(elapsed);
			return { value, spoken: value };
		}

		const value = formatHms(elapsed);
		return { value, spoken: `elapsed ${value}` };
	});
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="timer" use:reveal={{ amount: 0.5 }}>
			<p class="value c-accent">{view.value}</p>
			{#if caption}
				<p class="muted">{caption}</p>
			{/if}
		</div>
		<span class="sr-only">{view.spoken}</span>
	</GraphBody>
</Graph>

<style>
	.timer {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.value {
		margin: 0;
		font-size: 1.875rem;
		line-height: 1.2;
		letter-spacing: -0.025em;
	}

	@media (min-width: 640px) {
		.value {
			font-size: 2.25rem;
		}
	}

	.muted {
		margin: 0;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.c-accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border-width: 0;
	}
</style>
