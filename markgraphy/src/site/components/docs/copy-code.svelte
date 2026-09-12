<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		text,
		label = 'copy',
		children
	}: {
		text: string;
		label?: string;
		/** Optional wrapper content — renders as a full-width dashed box that copies on click. */
		children?: Snippet;
	} = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		return () => clearTimeout(timer);
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1600);
	}
</script>

<button
	type="button"
	class="copy"
	class:box={children != null}
	class:done={copied}
	onclick={copy}
	aria-label={copied ? 'Copied' : label}
>
	{#if children}
		{@render children()}
	{/if}
	<span class="state">{copied ? 'copied ✓' : label}</span>
</button>

<style>
	.copy {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: transparent;
		border: none;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.copy:hover {
		color: var(--text-primary);
	}

	.state {
		letter-spacing: 0.05em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.box {
		width: 100%;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		box-shadow: inset 0 0 0 1px var(--border);
		text-align: left;
	}

	.box:hover {
		background: var(--text-muted);
		color: var(--text-secondary);
	}

	.done {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.box.done:hover {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}
</style>
