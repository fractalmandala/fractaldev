<script module lang="ts">
	import type { Glyphs } from '../frame/glyphs';
	import type { GraphPalette } from '../frame/tone';

	/** Packed 1ch sparkline, centered with a small gap. Never stretched. */
	export interface GraphSparkProps {
		title: string;
		data: number[];
		caption?: string;
		glyphs?: Glyphs;
		palette?: GraphPalette;
		corner?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';
	import { reveal } from '../frame/motion';
	import { resolveGlyphs } from '../frame/glyphs';
	import { isMonoPalette, toneRole } from '../frame/tone';

	const SPARK_DEFAULT: readonly string[] = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

	let {
		title,
		data,
		caption,
		glyphs,
		palette,
		corner,
		class: className = ''
	}: GraphSparkProps = $props();

	const max = $derived(Math.max(...data, 1));
	const last = $derived(data.length - 1);
	const mono = $derived(isMonoPalette(palette));
	const set = $derived(glyphs == null ? SPARK_DEFAULT : resolveGlyphs(glyphs));
	const points = $derived(
		data.map((value) => {
			const index = Math.round((value / max) * (set.length - 1));
			return set[index] ?? set[0] ?? '▁';
		})
	);
</script>

<Graph {title} {corner} class={className}>
	<GraphBody>
		<div class="sparkwrap" use:reveal={{ amount: 0.5 }}>
			<span class="spark" aria-hidden="true">
				{#each points as glyph, index (`${glyph}-${index}`)}
					{@const live = index === last}
					{@const role = live ? 'accent' : toneRole(palette, 'secondary')}
					<span
						class="cell"
						class:c-accent={role === 'accent'}
						class:c-accent2={role === 'accent2'}
						class:c-muted={role === 'muted'}
						class:recede={!live && mono}
					>{glyph}</span>
				{/each}
			</span>
			{#if caption}
				<p class="muted">{caption}</p>
			{/if}
			<span class="sr-only">Sparkline with {data.length} points{caption ? `. ${caption}` : ''}</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.sparkwrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.spark {
		display: flex;
		justify-content: center;
		column-gap: 0.125rem;
		user-select: none;
	}

	.cell {
		flex: none;
		min-width: 1ch;
		text-align: center;
	}

	.cell.recede {
		opacity: 0.4;
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

	.muted {
		margin: 0;
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
