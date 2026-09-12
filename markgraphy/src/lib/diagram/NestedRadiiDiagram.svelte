<script module lang="ts">
	export interface NestedRadiiDiagramProps {
		/** Starting outer radius in px. Default 16. */
		initialOuter?: number;
		/** Starting inset (padding) in px. Default 4. */
		initialInset?: number;
		/** Show the sliders and the live CSS preview. Default true. */
		interactive?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	import { dashEdge, labeledEdgeSegs, overlayRow, padRow, type ArtCell, type ArtSeg } from './ascii';

	let {
		initialOuter = 16,
		initialInset = 4,
		interactive = true,
		class: className = ''
	}: NestedRadiiDiagramProps = $props();

	const WIDTH = 47;

	const uid = $props.id();

	// svelte-ignore state_referenced_locally
	let outer = $state(initialOuter);
	// svelte-ignore state_referenced_locally
	let inset = $state(initialInset);
	const inner = $derived(Math.max(0, outer - inset));

	const px = (value: number) => `${String(value).padStart(2, ' ')}px`;

	function edgeCells(left: number, right: number, cornerL: string, cornerR: string): ArtCell[] {
		const cells: ArtCell[] = [
			{ at: left, text: cornerL, cls: 'corner' },
			{ at: right, text: cornerR, cls: 'corner' }
		];
		for (let i = left + 2; i <= right - 2; i += 2) {
			cells.push({ at: i, text: '-' });
		}
		return cells;
	}

	const art = $derived.by((): ArtSeg[][] => {
		return [
			labeledEdgeSegs(WIDTH, 'Nested Radii'),
			[{ text: padRow(WIDTH) }],
			overlayRow(WIDTH, edgeCells(4, 42, '╭', '╮')),
			overlayRow(WIDTH, [
				{ at: 4, text: '|' },
				{ at: 42, text: '|' },
				{ at: 7, text: `outer   ${px(outer)}`, cls: 'val' }
			]),
			overlayRow(WIDTH, edgeCells(10, 36, '╭', '╮')),
			overlayRow(WIDTH, [
				{ at: 4, text: '|' },
				{ at: 5, text: '◀ - ▶', cls: 'arrow' },
				{ at: 10, text: '|' },
				{ at: 13, text: `inner   ${px(inner)}`, cls: 'val' },
				{ at: 36, text: '|' },
				{ at: 42, text: '|' }
			]),
			overlayRow(WIDTH, edgeCells(10, 36, '╰', '╯')),
			overlayRow(WIDTH, [
				{ at: 4, text: '|' },
				{ at: 42, text: '|' },
				{ at: 15, text: `inset   ${px(inset)}`, cls: 'val' }
			]),
			overlayRow(WIDTH, edgeCells(4, 42, '╰', '╯')),
			[{ text: padRow(WIDTH) }],
			overlayRow(WIDTH, [{ at: 8, text: 'inner = outer - inset', cls: 'muted' }]),
			overlayRow(WIDTH, [{ at: 8, text: `${px(inner)} = ${px(outer)} - ${px(inset)}`, cls: 'val' }]),
			[{ text: dashEdge(WIDTH) }]
		];
	});
</script>

<div class="radii {className}">
	<div class="viewport">
		<pre class="art"><code>{#each art as line, i (i)}{#each line as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{#if i < art.length - 1}{'\n'}{/if}{/each}</code></pre>
	</div>

	{#if interactive}
		<div class="controls">
			<label class="row" for="{uid}-outer">
				Outer radius <span class="badge">{outer}px</span>
				<input id="{uid}-outer" type="range" min="6" max="48" step="1" bind:value={outer} />
			</label>
			<label class="row" for="{uid}-inset">
				Inset <span class="badge">{inset}px</span>
				<input id="{uid}-inset" type="range" min="0" max="32" step="1" bind:value={inset} />
			</label>
			<div class="preview-row">
				<div class="box-outer" style:border-radius="{outer}px" style:padding="{inset}px">
					<div class="box-inner" style:border-radius="{inner}px">
						<span>{inner}px</span>
					</div>
				</div>
				<p class="hint">inner = max(0, {outer} - {inset}) = {inner}px</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.radii {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
		font-size: 0.875rem;
	}

	.viewport {
		overflow-x: auto;
	}

	.art {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.35;
		color: var(--border, oklch(0.6 0 0 / 0.5));
		white-space: pre;
	}

	.corner {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 400;
	}

	.arrow {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.val {
		color: var(--text-primary, oklch(0.93 0 0));
		font-weight: 500;
	}

	.muted {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-top: 0.875rem;
		border-top: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		white-space: nowrap;
	}

	.row input {
		flex: 1;
		min-width: 0;
		height: 4px;
		accent-color: var(--graph-accent, oklch(0.78 0.17 155));
		cursor: pointer;
	}

	.badge {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		border: 1px dashed var(--graph-accent, oklch(0.78 0.17 155));
		padding: 0.1rem 0.4rem;
		font-size: 0.75rem;
	}

	.preview-row {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.box-outer {
		flex-shrink: 0;
		width: 100px;
		height: 70px;
		border: 2px solid var(--graph-accent, oklch(0.78 0.17 155));
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.box-inner {
		width: 100%;
		height: 100%;
		border: 1px dashed var(--graph-accent, oklch(0.78 0.17 155));
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.hint {
		margin: 0;
		font-size: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}
</style>
