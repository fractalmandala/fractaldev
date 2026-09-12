<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		title: string;
		children: Snippet;
		frameClass: string;
	}
	let { title = '', children, frameClass = '' } = $props();
</script>

<div class="relative border-bottom {frameClass}">
	<div class="cap bg text-muted text-xs font-mono tt-u ta-c"><span class="text-theme">[ </span> {title} <span class="text-theme"> ] </span></div>
	{@render children()}
</div>
