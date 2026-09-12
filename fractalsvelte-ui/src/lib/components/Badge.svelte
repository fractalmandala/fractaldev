<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
		children?: Snippet;
	};

	let { variant = 'neutral', children }: Props = $props();
</script>

<span class="badge" data-variant={variant}>
	{@render children?.()}
</span>
