<script lang="ts">
	import type { Snippet } from 'svelte';

	// A single step inside <Steps>. The number is drawn by the parent list's CSS
	// counter, so it is never passed as a prop and can never drift out of order.
	type Props = {
		title?: string;
		children?: Snippet;
	};

	let { title, children }: Props = $props();
</script>

<li class="acrolls-steps__item">
	{#if title}
		<p class="acrolls-steps__title">{title}</p>
	{/if}
	{#if children}
		<div class="acrolls-steps__body">
			{@render children()}
		</div>
	{/if}
</li>
