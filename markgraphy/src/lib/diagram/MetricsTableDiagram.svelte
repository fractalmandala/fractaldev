<script module lang="ts">
	export interface MetricRow {
		label?: string;
		calls?: number | string;
		time?: string;
	}

	export interface MetricsTableDiagramProps {
		/** Caption on the top edge, uppercased. Default "COST". */
		title?: string;
		rows?: MetricRow[];
		totalCalls?: number | string;
		totalTime?: string;
		/** Show the total row. Default true. */
		showTotal?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	import { dashEdge, padEnd, padRow, padStart, splitLabeledEdge, type ArtSeg } from './ascii';

	let {
		title = 'COST',
		rows = [
			{ label: 'AST parse', calls: 120, time: '16m' },
			{ label: 'MDsveX compile', calls: 164, time: '16m' },
			{ label: 'Rune optimization', calls: 112, time: '18m' }
		],
		totalCalls = 396,
		totalTime = '~50m',
		showTotal = true,
		class: className = ''
	}: MetricsTableDiagramProps = $props();

	const WIDTH = 45;
	const SEP = `|  ${'- '.repeat(20).trimEnd()}  |`;

	const art = $derived.by((): ArtSeg[][] => {
		const [edgeBefore, edgeLabel, edgeAfter] = splitLabeledEdge(WIDTH, title);
		const lines: ArtSeg[][] = [
			[{ text: edgeBefore }, { text: edgeLabel, cls: 'title' }, { text: edgeAfter }],
			[{ text: padRow(WIDTH) }],
			[{ text: `|  ${padEnd('Tool calls', 23)}${padEnd('Time', 18)}|` }],
			[{ text: SEP }]
		];

		for (const row of rows) {
			lines.push([
				{ text: `|  ${padEnd(row.label ?? '', 18)}` },
				{ text: padStart(String(row.calls ?? ''), 5), cls: 'num' },
				{ text: '     ' },
				{ text: padEnd(row.time ?? '', 6), cls: 'time' },
				{ text: '       |' }
			]);
		}

		if (showTotal) {
			lines.push([{ text: SEP }]);
			lines.push([
				{ text: `|  ${padEnd('Total', 18)}` },
				{ text: padStart(String(totalCalls), 5), cls: 'total-num' },
				{ text: '     ' },
				{ text: padEnd(totalTime, 6), cls: 'total-time' },
				{ text: '       |' }
			]);
		}

		lines.push([{ text: padRow(WIDTH) }]);
		lines.push([{ text: dashEdge(WIDTH) }]);

		return lines;
	});
</script>

<div class="ledger {className}">
	<div class="viewport">
		<pre class="art"><code>{#each art as line, i (i)}{#each line as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if i < art.length - 1}{'\n'}{/if}{/each}</code></pre>
	</div>
</div>

<style>
	.ledger {
		display: inline-flex;
		flex-direction: column;
		min-width: 0;
		font-size: 0.875rem;
	}

	.viewport {
		overflow-x: auto;
	}

	.art {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.4;
		color: var(--border, oklch(0.6 0 0 / 0.5));
		white-space: pre;
	}

	.title {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.num {
		color: var(--text-primary, oklch(0.93 0 0));
		font-weight: 500;
	}

	.time {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.total-num {
		color: var(--text-primary, oklch(0.93 0 0));
		font-weight: 600;
	}

	.total-time {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}
</style>
