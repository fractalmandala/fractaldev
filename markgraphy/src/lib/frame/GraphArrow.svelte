<script lang="ts">
	/** Dashed arrow between flow nodes. `stretch` spans the available row. */
	interface Props {
		accent?: boolean;
		stretch?: boolean;
		class?: string;
	}

	let { accent = false, stretch = false, class: className = '' }: Props = $props();
</script>

<div class="arrow {className}" class:accent class:stretch aria-hidden="true">
	{#if stretch}
		<span class="line"></span>
	{:else}
		<span>- - -</span>
	{/if}
	<span class="head">▶</span>
</div>

<style>
	.arrow {
		display: flex;
		min-width: 1.5rem;
		align-items: center;
		gap: 0.25rem;
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.stretch {
		min-width: 2.5rem;
		flex: 1;
	}

	.accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.line {
		height: 1px;
		min-width: 1.5rem;
		flex: 1;
		border-top: 1px dashed currentColor;
	}

	.head {
		flex-shrink: 0;
	}
</style>
