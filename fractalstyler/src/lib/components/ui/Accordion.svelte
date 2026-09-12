<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition'
	import { quintIn, cubicOut } from 'svelte/easing'
	import Chevron from '$lib/icons/chevron-right.svelte'

	interface Props {
		label: string;
		open?: boolean;
		panel: Snippet;
		triggerClass: string;
	}

	let { open = false, label = '', panel, triggerClass = '' }: Props = $props();

	function toggle() {
		open = !open;
	}
</script>

<div class="accordion wfull">
		<div class="accordion-item wfull">
			<button
				type="button"
				class={triggerClass}
				aria-expanded={open}
				onclick={() => toggle()}
			>
				{label}
				<span class="accordion-icon"><Chevron rotate={open}/></span>
			</button>
			{#if open}
				<div class="accordion-panel" in:slide={{ easing: cubicOut, duration: 370 }} out:slide={{ easing: cubicOut, duration: 370 }}>
					{@render panel()}
				</div>
			{/if}
		</div>
</div>
