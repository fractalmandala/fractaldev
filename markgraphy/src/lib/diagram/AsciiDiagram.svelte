<script module lang="ts">
	export interface AsciiDiagramProps {
		/** Raw ASCII or Unicode diagram text. */
		content?: string;
		/** Optional label above the diagram. Uppercase, 1-2 words. */
		title?: string;
		/** Show a copy-to-clipboard button. Default true. */
		showCopy?: boolean;
		/** Dashed border around the diagram. Default true. */
		bordered?: boolean;
		/** Phosphor glow on accent tokens. Default false. */
		glow?: boolean;
		/** Font size of the diagram text. */
		fontSize?: string;
		/** Line height of the diagram text. */
		lineHeight?: string;
		align?: 'left' | 'center';
		class?: string;
		/** Custom content instead of text. */
		children?: Snippet;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { formatDiagramHtml } from './parser';

	let {
		content = '',
		title = '',
		showCopy = true,
		bordered = true,
		glow = false,
		fontSize = '0.85rem',
		lineHeight = '1.35',
		align = 'left',
		class: className = '',
		children
	}: AsciiDiagramProps = $props();

	let copied = $state(false);

	const formattedHtml = $derived(content ? formatDiagramHtml(content) : '');

	async function handleCopy() {
		if (!content) {
			return;
		}

		try {
			await navigator.clipboard.writeText(content);
			copied = true;
			window.setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// Clipboard unavailable (permissions or non-secure context).
		}
	}
</script>

<div
	class="diagram {className}"
	class:bordered
	class:glow
	style:--diag-font-size={fontSize}
	style:--diag-line-height={lineHeight}
	style:text-align={align}
>
	{#if title || (showCopy && content)}
		<div class="header">
			{#if title}
				<span class="label">{title}</span>
			{/if}
			{#if showCopy && content}
				<button class="copy" type="button" onclick={handleCopy} aria-label={copied ? 'Copied diagram code' : 'Copy diagram code'}>
					{copied ? '✓ copied' : 'copy'}
				</button>
			{/if}
		</div>
	{/if}

	<div class="viewport">
		{#if content}
			<pre class="art"><code>{@html formattedHtml}</code></pre>
		{:else if children}
			<div class="custom">
				{@render children()}
			</div>
		{/if}
	</div>
</div>

<style>
	.diagram {
		position: relative;
		min-width: 0;
		font-size: 0.875rem;
		user-select: text;
	}

	.bordered {
		border: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.bordered .header + .viewport,
	.bordered .viewport {
		padding: 1.25rem 1.5rem;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.bordered .header {
		padding: 0.5rem 1.5rem;
		border-bottom: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.label {
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.copy {
		padding: 0.15rem 0.5rem;
		font-size: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		background: none;
		border: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
		border-radius: 0;
		cursor: pointer;
	}

	.copy:hover {
		color: var(--text-primary, oklch(0.93 0 0));
		border-color: var(--text-secondary, oklch(0.62 0 0));
	}

	.viewport {
		overflow-x: auto;
		min-width: 0;
	}

	.viewport:not(:first-child) {
		margin-top: 0.75rem;
	}

	.bordered .viewport:not(:first-child) {
		margin-top: 0;
	}

	.art {
		margin: 0;
		font-size: var(--diag-font-size, 0.85rem);
		line-height: var(--diag-line-height, 1.35);
		color: var(--text-secondary, oklch(0.62 0 0));
		tab-size: 2;
		white-space: pre;
	}

	.custom {
		font-size: var(--diag-font-size, 0.85rem);
	}

	/* Token classes come from formatDiagramHtml's {@html} output, so they are
	   global descendants of the scoped wrapper. */
	.diagram :global(.diag-title) {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.diagram :global(.diag-arrow) {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.diagram :global(.diag-corner) {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 500;
	}

	.diagram :global(.diag-box) {
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.diagram :global(.diag-glyph) {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.diagram :global(.diag-accent) {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 500;
	}

	.glow :global(.diag-title) {
		text-shadow: 0 0 12px color-mix(in oklab, var(--graph-accent, oklch(0.78 0.17 155)) 40%, transparent);
	}

	.glow :global(.diag-arrow) {
		text-shadow: 0 0 8px color-mix(in oklab, var(--graph-accent, oklch(0.78 0.17 155)) 40%, transparent);
	}

	.glow :global(.diag-glyph) {
		text-shadow: 0 0 8px color-mix(in oklab, var(--graph-accent, oklch(0.78 0.17 155)) 40%, transparent);
	}
</style>
