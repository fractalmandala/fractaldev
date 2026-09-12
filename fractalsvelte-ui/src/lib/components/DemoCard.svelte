<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		description?: string;
		code: string;
		children?: Snippet;
	};

	let { title, description, code, children }: Props = $props();

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => (copied = false), 2000);
		} catch {
			// Clipboard unavailable — nothing further to do.
		}
	}
</script>

<figure class="demo-card">
	<figcaption class="demo-card__meta">
		<div class="demo-card__info">
			<strong class="demo-card__title">{title}</strong>
			{#if description}
				<p class="muted text-sm">{description}</p>
			{/if}
		</div>
		<button type="button" class="playground__copy-btn" class:copied onclick={copyCode}>
			{#if copied}✓ Copied!{:else}📋 Copy{/if}
		</button>
	</figcaption>
	<div class="demo-card__preview">
		{@render children?.()}
	</div>
	<pre class="playground__code-content"><code>{code}</code></pre>
</figure>
