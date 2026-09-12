<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ThemeTokenName } from '#lib/styles/index.ts';

	export type ThemeTokens = Partial<Record<ThemeTokenName, string | number>>;

	type Props = {
		theme?: 'system' | 'light' | 'dark';
		tokens?: ThemeTokens;
		children?: Snippet;
	};

	let { theme = 'system', tokens = {}, children }: Props = $props();
	let style = $derived(Object.entries(tokens).map(([name, value]) => `${name}: ${value}`).join('; '));
</script>

<div class="ui-theme" data-theme={theme === 'system' ? undefined : theme} {style}>
	{@render children?.()}
</div>
