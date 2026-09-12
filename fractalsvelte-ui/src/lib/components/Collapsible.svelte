<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luChevronDown } from 'fractalicons/lucide';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		/** Trigger label. */
		label?: import('svelte').Snippet;
		/** Custom trigger (overrides label). */
		trigger?: import('svelte').Snippet;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		label,
		trigger,
		class: className = '',
		children
	}: Props = $props();

	const contentId = `k-collapsible-${Math.random().toString(36).slice(2, 8)}`;
	const triggerId = `k-collapsible-trigger-${contentId}`;

	function toggle() {
		open = !open;
		onOpenChange?.(open);
	}
</script>

<div class="k-collapsible {className}">
	{#if trigger}
		{@render trigger?.()}
	{:else}
		<button
			type="button"
			class="k-collapsible-trigger"
			id={triggerId}
			aria-expanded={open}
			aria-controls={contentId}
			onclick={toggle}
		>
			<span
				>{#if label}{@render label?.()}{:else}Toggle{/if}</span
			>
			<Icon icon={luChevronDown} class="k-collapsible-chevron" size={16} />
		</button>
	{/if}
	{#if open}
		<div class="k-collapsible-content" id={contentId} role="region" aria-labelledby={triggerId}>
			{@render children?.()}
		</div>
	{/if}
</div>
