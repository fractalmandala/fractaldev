<script lang="ts">
	// Docs shell: nav rail on the left, content on the right.
	// Below 1024px the rail becomes a horizontal chip strip.
	import type { Snippet } from 'svelte';
	import Nav from '$site/components/docs/nav.svelte';

	let { children }: { children: Snippet } = $props();

	// Delegated click handler for every ".code-block-copy" button rendered
	// by the mdsvex highlighter. Copies the raw code (stored on the parent
	// .code-block wrapper as data-code) and shows the copied state on the
	// button for ~1.6s. Lives here so it survives route changes without
	// needing a component per code block.
	function onContentClick(e: MouseEvent) {
		const target = e.target as HTMLElement | null;
		const button = target?.closest<HTMLButtonElement>('.code-block-copy');
		if (!button) return;
		const block = button.closest<HTMLElement>('.code-block');
		if (!block) return;
		const text = block.getAttribute('data-code') ?? '';
		const label = button.getAttribute('data-label') ?? 'copy';
		const state = button.querySelector<HTMLElement>('.code-block-copy-state');
		navigator.clipboard
			.writeText(text)
			.then(() => {
				button.classList.add('done');
				if (state) state.textContent = 'copied \u2713';
				window.setTimeout(() => {
					button.classList.remove('done');
					if (state) state.textContent = label;
				}, 1600);
			})
			.catch(() => {
				/* clipboard blocked by permissions — silently ignore */
			});
	}
</script>

<div class="docs site-wrapper">
	<Nav variant="mobile" />
	<div class="cabinet">
		<Nav variant="rail" />
		<main class="content" onclick={onContentClick}>
			{@render children()}
		</main>
	</div>
</div>

<style>
	.docs {
		position: relative;
		width: 100%;
		margin-inline: auto;
	}

	.cabinet {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	@media (min-width: 1024px) {
		.cabinet {
			display: grid;
			grid-template-columns: 17rem minmax(0, 1fr);
			align-items: start;
		}
	}

	.content {
		min-width: 0;
		padding: 1.2rem 1rem 3rem;
	}

	@media (min-width: 1024px) {
		.content {
			padding: 1.6rem 1.6rem 5rem;
		}
	}

	/* Section headings inside docs pages share one voice. */
	.content :global(h2) {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 1.45rem;
		font-weight: 600;
		letter-spacing: -0.04em;
	}

	/* --- Shiki-highlighted fenced code in .svx docs: matches examples page. --- */

	.content :global(.code-block) {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		min-width: 0;
		margin-block: 1.2rem;
		padding: 0.85rem 0.9rem 0.95rem;
		border: 1px solid var(--border);
		background: var(--bg-terminal, #0c0c0c);
	}

	.content :global(.code-block-head) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--text-secondary);
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.content :global(.code-block-lang) {
		color: var(--text-muted);
	}

	.content :global(.code-block-copy) {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: transparent;
		border: none;
		font: inherit;
		color: var(--text-secondary);
		cursor: pointer;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.content :global(.code-block-copy:hover) {
		color: var(--text-primary);
	}

	.content :global(.code-block-copy.done) {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.content :global(.code-block-body) {
		min-width: 0;
		overflow-x: auto;
	}

	.content :global(.code-block-body pre) {
		margin: 0;
		background: transparent !important;
		font-size: 0.8rem;
		line-height: 1.55;
		color: var(--text-secondary);
		white-space: pre;
	}
</style>
