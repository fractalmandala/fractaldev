<script module lang="ts">
	import type { GraphPalette, ToneRole } from '../frame/tone';

	export type DiffSign = 'add' | 'remove' | 'keep';

	export interface DiffRow {
		label: string;
		value: string;
		sign?: DiffSign;
	}

	export interface GraphDiffProps {
		title: string;
		rows: DiffRow[];
		footer?: DiffRow;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import GraphRule from '../frame/GraphRule.svelte';
	import { reveal, stagger } from '../frame/motion';
	import { toneRole } from '../frame/tone';

	let {
		title,
		rows,
		footer,
		palette,
		corner,
		class: className = ''
	}: GraphDiffProps = $props();

	const signGlyph: Record<DiffSign, string> = {
		add: '+',
		remove: '-',
		keep: ' '
	};

	function toneOf(sign: DiffSign): ToneRole {
		if (sign === 'add') {
			return toneRole(palette, 'primary');
		}

		if (sign === 'remove') {
			return toneRole(palette, 'secondary');
		}

		return 'foreground';
	}

	const summary = $derived.by(() => {
		let add = 0;
		let remove = 0;
		let keep = 0;
		for (const row of footer ? [...rows, footer] : rows) {
			const sign = row.sign ?? 'keep';
			if (sign === 'add') {
				add += 1;
			} else if (sign === 'remove') {
				remove += 1;
			} else {
				keep += 1;
			}
		}
		return `${add} added, ${remove} removed, ${keep} unchanged`;
	});
</script>

{#snippet diffLine(row: DiffRow, delay: number)}
	{@const sign = row.sign ?? 'keep'}
	{@const tone = toneOf(sign)}
	{@const mark = sign === 'keep' ? 'empty' : tone}
	<div class="line" use:reveal={{ delay, amount: 0.4 }}>
		<span
			aria-hidden="true"
			class="mark"
			class:c-frame={mark === 'empty'}
			class:c-accent={mark === 'accent'}
			class:c-accent2={mark === 'accent2'}
			class:c-muted={mark === 'muted'}>{signGlyph[sign]}</span>
		<span
			class="label"
			class:c-accent={tone === 'accent'}
			class:c-accent2={tone === 'accent2'}
			class:c-muted={tone === 'muted'}
			class:c-fg={tone === 'foreground'}>{row.label}</span>
		<span
			class="value"
			class:c-accent={tone === 'accent'}
			class:c-accent2={tone === 'accent2'}
			class:c-muted={tone === 'muted'}
			class:c-fg={tone === 'foreground'}>{row.value}</span>
	</div>
{/snippet}

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="stack">
			<ul class="lines" role="list">
				{#each rows as row, i (row.label)}
					<li>{@render diffLine(row, stagger(i, 40))}</li>
				{/each}
			</ul>
			{#if footer}
				<GraphRule />
				{@render diffLine(footer, 0)}
			{/if}
		</div>
		<span class="sr-only">{summary}</span>
	</GraphBody>
</Graph>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.lines {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.line {
		display: grid;
		grid-template-columns: 1.25rem minmax(0, 1fr) 8ch;
		align-items: baseline;
		column-gap: 0.75rem;
	}

	.mark {
		text-align: center;
		user-select: none;
	}

	.value {
		text-align: right;
	}

	.c-accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.c-accent2 {
		color: var(--graph-accent-2, oklch(0.78 0.12 70));
	}

	.c-fg {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.c-frame {
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.c-muted {
		color: var(--text-secondary, oklch(0.62 0 0));
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
