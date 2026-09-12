<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		open?: boolean;
		children?: Snippet;
	};

	let { title, open = $bindable(false), children }: Props = $props();
</script>

<details class="accordion" bind:open>
	<summary class="accordion-trigger">{title}<span class="accordion-chevron" aria-hidden="true">⌄</span></summary>
	<div class="accordion-content">{@render children?.()}</div>
</details>
