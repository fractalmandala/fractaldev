<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luCopy, luCheck } from 'fractalicons/lucide';

	interface Props {
		code: string;
		/** Optional label shown in the header (e.g. filename or language). */
		label?: string;
		/** Hide the copy button. */
		noCopy?: boolean;
		class?: string;
		[key: string]: unknown;
	}

	let { code, label, noCopy = false, class: className = '', ...rest }: Props = $props();

	let copied = $state(false);
	const rootClass = $derived(`k-code-block ${className}`.trim());

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => (copied = false), 1600);
		} catch {
			// clipboard unavailable — no-op
		}
	}
</script>

<div class={rootClass} {...rest}>
	{#if label || !noCopy}
		<div class="k-code-block-header">
			{#if label}<span>{label}</span>{/if}
			{#if !noCopy}
				<button
					type="button"
					class="k-code-block-copy"
					data-copied={copied || undefined}
					aria-label="Copy code"
					onclick={copy}
				>
					{#if copied}
						<Icon icon={luCheck} size={14} />
					{:else}
						<Icon icon={luCopy} size={14} />
					{/if}
				</button>
			{/if}
		</div>
	{/if}
	<pre class="k-code-block-pre"><code>{code}</code></pre>
</div>

<style lang="sass">

.k-code-block
	position: relative
	overflow: hidden
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	background: var(--bg-sidebar, #1e2029)
	color: var(--text-primary)

	&-header
		display: flex
		align-items: center
		justify-content: space-between
		gap: 8px
		padding: 8px 14px
		border-bottom: 1px solid var(--border)
		background: var(--bg-raised)
		font-size: var(--text-xs)
		font-weight: 600
		text-transform: uppercase
		letter-spacing: 0.04em
		color: var(--text-muted)

	&-copy
		display: inline-flex
		align-items: center
		justify-content: center
		width: 28px
		height: 28px
		padding: 0
		border: 1px solid transparent
		border-radius: var(--radius-sm)
		background: transparent
		color: var(--text-secondary)
		cursor: pointer
		transition: background-color var(--motionin1), color var(--motionin1)

		&:hover
			background: var(--state-hover)
			color: var(--text-primary)

		&:focus-visible
			outline: 2px solid var(--ring)
			outline-offset: 1px

	&-pre
		margin: 0
		padding: 16px
		overflow-x: auto
		font-family: var(--font-mono, monospace)
		font-size: var(--text-sm)
		line-height: 1.6

		code
			font-family: inherit
</style>
