<script lang="ts">
	import type { Snippet } from 'svelte';
	import Tabs from './Tabs.svelte';
	import type { TabItem } from './tabs-context.js';

	// A group of alternative code samples presented as tabs — a thin wrapper over
	// <Tabs variant="code"> so the panels share the compact code-group chrome. Each
	// <Tab> child is one variant, in the same order as `labels`. Context resolves to
	// the <Tabs> instance this renders, so <Tab> children link up exactly as under
	// a bare <Tabs>.
	type Props = {
		labels: TabItem[];
		id?: string;
		label?: string;
		defaultIndex?: number;
		children?: Snippet;
	};

	let { labels, id, label = 'Code variants', defaultIndex = 0, children }: Props = $props();
</script>

<Tabs items={labels} {id} {label} {defaultIndex} variant="code">
	{@render children?.()}
</Tabs>
