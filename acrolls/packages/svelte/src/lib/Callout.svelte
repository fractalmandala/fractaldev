<script lang="ts">
	import type { Snippet } from 'svelte';

	const VARIANTS = ['note', 'insight', 'warning', 'success', 'error'] as const;
	type Variant = (typeof VARIANTS)[number];

	type Props = {
		variant?: Variant;
		title?: string;
		children: Snippet;
	};

	let { variant = 'note', title, children }: Props = $props();

	const safeVariant = $derived(
		(VARIANTS as readonly string[]).includes(variant) ? variant : 'note'
	);
</script>

<aside class="acrolls-callout" data-variant={safeVariant} role="note">
	{#if title}
		<p class="acrolls-callout__title">{title}</p>
	{/if}
	<div class="acrolls-callout__body">
		{@render children()}
	</div>
</aside>
