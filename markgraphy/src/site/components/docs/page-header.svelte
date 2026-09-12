<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		kicker,
		lead,
		note,
		children
	}: {
		title: string;
		/** Bracketed label above the title, e.g. GraphStat. */
		kicker?: string;
		/** Intro paragraph, set to the right of the title on wide screens. */
		lead?: string;
		/** Extra muted line, e.g. when / when-not guidance. */
		note?: string;
		children?: Snippet;
	} = $props();
</script>

<header class="page-head">
	<div class="left">
		{#if kicker}
			<p class="kicker">[ {kicker} ]</p>
		{/if}
		<h1 class="display">{title}</h1>
	</div>
	<div class="right">
		{#if lead}
			<p class="lead">{lead}</p>
		{/if}
		{#if note}
			<p class="note">{note}</p>
		{/if}
		{@render children?.()}
	</div>
</header>

<style>
	.page-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 2rem;
		padding: 0.2rem 0 1.2rem;
		border-bottom: 1px dashed var(--border);
	}

	.left {
		min-width: 0;
	}

	.kicker {
		margin: 0 0 0.55rem;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 4.2vw, 3.4rem);
	}

	.right {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		max-width: 42ch;
		margin-left: auto;
		text-align: right;
	}

	.lead,
	.note {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.88rem;
		text-wrap: pretty;
	}

	.note {
		font-size: 0.78rem;
	}

	.right :global(p) {
		margin: 0;
	}

	.right :global(a) {
		color: var(--text-primary);
		text-decoration: none;
		border-bottom: 1px dotted var(--text-muted);
	}

	@media (max-width: 980px) {
		.page-head {
			flex-direction: column;
			align-items: flex-start;
		}

		.right {
			margin-left: 0;
			text-align: left;
		}
	}
</style>
