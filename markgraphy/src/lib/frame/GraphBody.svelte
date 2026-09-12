<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		/** Compact padding for dense graphs like Table and Invoice. */
		tight?: boolean;
		children?: Snippet;
	}

	let { class: className = '', tight = false, children }: Props = $props();
</script>

<div class="body {className}" class:tight>
	{@render children?.()}
</div>
