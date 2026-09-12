<script lang="ts">
	import type { Snippet } from 'svelte';

	// An ordered list of steps, numbered purely with a CSS counter (no JS), so the
	// numbering is present in the SSR HTML, survives hydration, and prints cleanly.
	// Children must be <Step> elements.
	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();
</script>

<ol class="acrolls-steps">
	{@render children?.()}
</ol>
