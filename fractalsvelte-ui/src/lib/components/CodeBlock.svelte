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
	}

	let { code, label, noCopy = false, class: className = '' }: Props = $props();

	let copied = $state(false);

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

<div class="k-code-block {className}">
	{#if label || !noCopy}
		<div class="k-code-block-header">
			{#if label}<span>{label}</span>{/if}
			{#if !noCopy}
				<button class="k-icon-button" data-size="sm" aria-label="Copy code" onclick={copy}>
					{#if copied}<Icon icon={luCheck} size={14} />{:else}<Icon icon={luCopy} size={14} />{/if}
				</button>
			{/if}
		</div>
	{/if}
	<pre class="k-code-block-pre"><code>{code}</code></pre>
</div>
