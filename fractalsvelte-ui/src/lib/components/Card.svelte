<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		padding?: 'none' | 'sm' | 'md' | 'lg';
		children?: Snippet;
	};

	let { padding = 'md', children }: Props = $props();
</script>

<section class="card" data-padding={padding}>
	{@render children?.()}
</section>
