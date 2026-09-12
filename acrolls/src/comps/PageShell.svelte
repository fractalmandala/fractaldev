<script lang="ts">
	import type { Snippet } from 'svelte';

	/** The padded content frame, from canonical-markups.md §4. Registry classes only. */
	interface Props {
		children: Snippet;
		class?: string;
	}
	let { children, class: className = '' }: Props = $props();
</script>

<section class="page-shell {className}">
	{@render children()}
</section>
