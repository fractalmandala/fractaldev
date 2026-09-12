<script lang="ts">
	import type { Snippet } from 'svelte';
	import Chevron from '$lib/icons/chevron-right.svelte'

	export interface AccordionItem {
		id: string;
		label: string;
	}

	interface Props {
		items: AccordionItem[];
		/** Ids that start open. */
		open?: string[];
		/** Only one panel at a time. */
		single?: boolean;
		panel: Snippet<[string]>;
	}

	let { items, open = $bindable<string[]>([]), single = false, panel }: Props = $props();
	const id = $props.id();

	function toggle(itemId: string) {
		if (open.includes(itemId)) open = open.filter((v) => v !== itemId);
		else open = single ? [itemId] : [...open, itemId];
	}
</script>

<div class="accordion">
	{#each items as item (item.id)}
		<div class="accordion-item">
			<button
				type="button"
				class="accordion-trigger"
				aria-expanded={open.includes(item.id)}
				aria-controls={`${id}-${item.id}`}
				onclick={() => toggle(item.id)}
			>
				{item.label}
				<span class="accordion-icon"><Chevron rotate={open.includes(item.id)}/></span>
			</button>
			{#if open.includes(item.id)}
				<div class="accordion-panel" id={`${id}-${item.id}`}>{@render panel(item.id)}</div>
			{/if}
		</div>
	{/each}
</div>
