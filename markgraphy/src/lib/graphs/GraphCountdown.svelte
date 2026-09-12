<script module lang="ts">
	import type { GraphPalette } from '../frame/tone';

	/** Time left until a date. */
	export interface GraphCountdownProps {
		title: string;
		to: Date | number | string;
		done?: string;
		caption?: string;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { formatHms, graphNow, parseInstant } from '../frame/clock';
	import { reveal } from '../frame/motion';

	let {
		title,
		to,
		done = 'done',
		caption,
		palette,
		corner,
		class: className = ''
	}: GraphCountdownProps = $props();

	const time = graphNow();
	const target = $derived(parseInstant(to));

	const view = $derived.by(() => {
		const remaining = $time == null || !Number.isFinite(target) ? null : target - $time;
		const finished = remaining != null && remaining <= 0;
		const value = remaining == null ? '00:00:00' : finished ? done : formatHms(remaining);
		return { value, finished };
	});
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="countdown" use:reveal={{ amount: 0.5 }}>
			<p class="value" class:c-accent={!view.finished} class:muted={view.finished}>
				{view.value}
			</p>
			{#if caption}
				<p class="muted">{caption}</p>
			{/if}
		</div>
		<span class="sr-only">{view.finished ? done : `remaining ${view.value}`}</span>
	</GraphBody>
</Graph>

<style>
	.countdown {
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
