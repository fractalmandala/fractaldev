<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import { TABS, type TabsContext } from './tabs-context.js';

	// A single tab panel. Must be a child of <Tabs> (or <CodeGroup>). It claims its
	// index once, in document order, and links to the matching tab button through
	// the shared deterministic groupId. Inactive panels are `hidden` (not merely
	// visually hidden) so assistive tech and Pagefind only surface the active one.
	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();

	// getContext returns undefined when used outside <Tabs>; we degrade to a plain
	// panel rather than throwing, so a stray <Tab> never breaks a build.
	const ctx = getContext<TabsContext | undefined>(TABS);
	const index = ctx ? ctx.claim() : 0;
</script>

{#if ctx}
	<div
		role="tabpanel"
		class="acrolls-tabs__panel"
		id="{ctx.groupId}-panel-{index}"
		aria-labelledby="{ctx.groupId}-tab-{index}"
		hidden={!ctx.isActive(index)}
		tabindex="0"
	>
		{@render children?.()}
	</div>
{:else}
	<div class="acrolls-tabs__panel">
		{@render children?.()}
	</div>
{/if}
