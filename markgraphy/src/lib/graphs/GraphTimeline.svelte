<script module lang="ts">
	import type { GraphPalette } from '../frame/tone';

	/** Progress state of a timeline event. */
	export type TimelineState = 'done' | 'now' | 'next';

	export interface TimelineEvent {
		date: string;
		label: string;
		state?: TimelineState;
	}

	export interface GraphTimelineProps {
		title: string;
		events: TimelineEvent[];
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { reveal, stagger } from '../frame/motion';
	import { toneRole, type ToneRole } from '../frame/tone';

	const MARK: Record<TimelineState, string> = {
		done: '●',
		now: '●',
		next: '○'
	};

	let {
		title,
		events,
		palette,
		corner,
		class: className = ''
	}: GraphTimelineProps = $props();

	function eventRole(state: TimelineState): ToneRole {
		if (state === 'now') {
			return toneRole(palette, 'primary');
		}

		if (state === 'next') {
			return toneRole(palette, 'secondary');
		}

		return 'foreground';
	}

	function dateRole(state: TimelineState): ToneRole {
		return state === 'next' ? toneRole(palette, 'secondary') : 'foreground';
	}
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<ol class="timeline" role="list">
			{#each events as event, index (`${event.date}-${event.label}`)}
				{@const state = event.state ?? 'done'}
				{@const main = eventRole(state)}
				{@const date = dateRole(state)}
				<li class="event" use:reveal={{ delay: stagger(index, 50), amount: 0.4 }}>
					<div class="line">
						<span
							class="mark"
							aria-hidden="true"
							class:c-accent={main === 'accent'}
							class:c-accent2={main === 'accent2'}
							class:c-muted={main === 'muted'}
							class:c-fg={main === 'foreground'}
						>
							{MARK[state]}
						</span>
						<span
							class="when"
							class:c-accent={date === 'accent'}
							class:c-accent2={date === 'accent2'}
							class:c-muted={date === 'muted'}
							class:c-fg={date === 'foreground'}
						>
							{event.date}
						</span>
						<span
							class="label"
							class:c-accent={main === 'accent'}
							class:c-accent2={main === 'accent2'}
							class:c-muted={main === 'muted'}
							class:c-fg={main === 'foreground'}
						>
							{event.label}
						</span>
					</div>
					{#if index < events.length - 1}
						<div class="link" aria-hidden="true">
							<span class="linkmark">│</span>
						</div>
					{/if}
				</li>
			{/each}
		</ol>
	</GraphBody>
</Graph>

<style>
	.timeline {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.event {
		display: flex;
		flex-direction: column;
	}

	.line {
		display: grid;
		grid-template-columns: 1.25rem 7rem minmax(0, 1fr);
		align-items: baseline;
		column-gap: 1rem;
	}

	.mark {
		text-align: center;
		line-height: 1;
		user-select: none;
	}

	.link {
		display: grid;
		grid-template-columns: 1.25rem 7rem minmax(0, 1fr);
		column-gap: 1rem;
		padding: 0.25rem 0;
		user-select: none;
	}

	.linkmark {
		grid-column: 1;
		text-align: center;
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.c-accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.c-accent2 {
		color: var(--graph-accent-2, oklch(0.78 0.12 70));
	}

	.c-muted {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.c-fg {
		color: var(--text-primary, oklch(0.93 0 0));
	}
</style>
