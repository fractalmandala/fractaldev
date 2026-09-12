<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { Agentation, type AnnotationProps } from 'sv-agentation';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const workspaceRoot = '/Users/amrit/fractalmandala/fractalicons';
	const annotationProps: AnnotationProps = {
		workspaceRoot
	};
</script>

{#if browser && dev}
	<Agentation {...annotationProps} />
{/if}

{@render children()}
