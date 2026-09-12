<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		variant?: 'info' | 'success' | 'warning' | 'danger';
		title: string;
		children?: Snippet;
	};

	let { open = $bindable(true), variant = 'info', title, children }: Props = $props();
</script>

{#if open}
	<div class="toast" data-variant={variant} role="status">
		<div><strong>{title}</strong><div class="toast-content">{@render children?.()}</div></div>
		<button type="button" class="toast-close is-icon" aria-label="Dismiss notification" onclick={() => open = false}>×</button>
	</div>
{/if}
