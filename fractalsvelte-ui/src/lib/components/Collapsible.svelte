<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luChevronDown } from 'fractalicons/lucide';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		/** Trigger label. */
		label?: Snippet;
		/** Custom trigger (overrides label). */
		trigger?: Snippet;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		label,
		trigger,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const contentId = `k-collapsible-${Math.random().toString(36).slice(2, 8)}`;
	const triggerId = `k-collapsible-trigger-${contentId}`;
	const rootClass = $derived(`k-collapsible ${className}`.trim());

	function toggle() {
		open = !open;
		onOpenChange?.(open);
	}
</script>

<div class={rootClass} {...rest}>
	{#if trigger}
		{@render trigger?.()}
	{:else}
		<button
			type="button"
			class="k-collapsible-trigger"
			id={triggerId}
			data-state={open ? 'open' : 'closed'}
			aria-expanded={open}
			aria-controls={contentId}
			onclick={toggle}
		>
			<span>{#if label}{@render label?.()}{:else}Toggle{/if}</span>
			<Icon icon={luChevronDown} class="k-collapsible-chevron" size={16} />
		</button>
	{/if}
	{#if open}
		<div class="k-collapsible-content" id={contentId} role="region" aria-labelledby={triggerId}>
			{@render children?.()}
		</div>
	{/if}
</div>

<style lang="sass">

.k-collapsible
	display: flex
	flex-direction: column
	width: 100%

.k-collapsible-trigger
	display: flex
	align-items: center
	justify-content: space-between
	gap: 8px
	width: 100%
	padding: 12px 16px
	font-family: inherit
	font-size: var(--text-md)
	font-weight: 500
	text-align: left
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	background: var(--bg-surface)
	color: var(--text-primary)
	cursor: pointer
	transition: background var(--motionin1), border-color var(--motionin1)

	&:hover
		background: var(--bg)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

	:global(.k-collapsible-chevron)
		transition: transform var(--motionin1)

	&[data-state='open']
		border-bottom-left-radius: 0
		border-bottom-right-radius: 0

		:global(.k-collapsible-chevron)
			transform: rotate(180deg)

.k-collapsible-content
	padding: 12px 16px
	border: 1px solid var(--border)
	border-top: none
	border-radius: 0 0 var(--radius-md) var(--radius-md)
	background: var(--bg)
	font-family: inherit
	font-size: var(--text-md)
	color: var(--text-secondary)
</style>
