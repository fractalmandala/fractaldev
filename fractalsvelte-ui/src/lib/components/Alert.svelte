<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		variant?: 'info' | 'success' | 'warning' | 'danger';
		title?: string;
		children?: Snippet;
	};

	let { variant = 'info', title, children }: Props = $props();
</script>

<section class="alert" data-variant={variant} role="status">
	<div class="alert-icon" aria-hidden="true">{variant === 'success' ? '✓' : variant === 'warning' ? '!' : variant === 'danger' ? '×' : 'i'}</div>
	<div>
		{#if title}<strong>{title}</strong>{/if}
		<div class="alert-content">{@render children?.()}</div>
	</div>
</section>
