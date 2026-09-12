<script lang="ts">
	import CopyCode from './copy-code.svelte';

	let {
		code,
		html,
		label = 'copy',
		heading = 'code'
	}: {
		code: string;
		/** Shiki HTML highlighted on the server at build time; falls back to plain text. */
		html?: string;
		label?: string;
		/** Small uppercase label in the box header, e.g. "usage" or "+layout.svelte". */
		heading?: string;
	} = $props();
</script>

<div class="import-box">
	<header>
		<span>{heading}</span>
		<CopyCode text={code} {label} />
	</header>
	<div class="code">
		{#if html}
			{@html html}
		{:else}
			<pre><code>{code}</code></pre>
		{/if}
	</div>
</div>

<style>
	.import-box {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		min-width: 0;
		padding: 0.85rem 0.9rem 0.95rem;
		border: 1px solid var(--border);
		background: var(--bg-terminal, #0c0c0c);
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--text-secondary);
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.code {
		min-width: 0;
		overflow-x: auto;
	}

	.code :global(pre) {
		margin: 0;
		background: transparent !important;
		font-size: 0.8rem;
		line-height: 1.55;
		color: var(--text-secondary);
		white-space: pre;
	}

	.code :global(code) {
		font-family: var(--font-mono);
	}
</style>
