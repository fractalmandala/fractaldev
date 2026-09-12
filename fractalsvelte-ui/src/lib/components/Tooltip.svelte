<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		content: string;
		position?: 'top' | 'bottom';
		children?: Snippet;
	};

	let { content, position = 'top', children }: Props = $props();
</script>

<span class="tooltip" data-position={position}>
	{@render children?.()}
	<span class="tooltip-bubble" role="tooltip">{content}</span>
</span>
