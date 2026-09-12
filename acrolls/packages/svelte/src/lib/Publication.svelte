<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { enhanceCodeFrames } from './code-frame-enhance.js';
	import { enhanceMermaid } from './enhance-mermaid.js';

	type Props = {
		theme?: 'light' | 'dark' | 'auto';
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};

	let {
		theme = 'auto',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	let root: HTMLElement | undefined = $state();

	onMount(() => {
		if (!root) return;
		const cleanCode = enhanceCodeFrames(root);
		const cleanMermaid = enhanceMermaid(root);
		return () => {
			cleanCode();
			cleanMermaid();
		};
	});
</script>

<article
	bind:this={root}
	class={['acrolls', className].filter(Boolean).join(' ')}
	data-theme={theme === 'auto' ? undefined : theme}
	{...rest}
>
	{@render children?.()}
</article>
