<script lang="ts">
	import { untrack } from 'svelte';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import { useId } from '../../use-id.js';
	import type { BouncyAccordionProps } from './types.js';
	import BouncyAccordionRow from './BouncyAccordionRow.svelte';

	let {
		items,
		value,
		defaultValue = null,
		onValueChange,
		collapsible = true,
		class: className,
		classNames
	}: BouncyAccordionProps = $props();

	const reduce = useReducedMotion();
	const baseId = useId();

	let internalValue = $state<string | null>(untrack(() => defaultValue));

	const isControlled = $derived(value !== undefined);
	const activeValue = $derived(isControlled ? value ?? null : internalValue);
	const activeIndex = $derived(items.findIndex((item) => item.id === activeValue));

	function setActiveValue(next: string | null) {
		if (!isControlled) internalValue = next;
		onValueChange?.(next);
	}

	function toggleItem(id: string) {
		if (activeValue === id) {
			if (collapsible) setActiveValue(null);
			return;
		}
		setActiveValue(id);
	}
</script>

<div data-slot="bouncy-accordion" class={[classNames?.root, className].filter(Boolean).join(' ')}>
	{#each items as item, index (item.id)}
		{@const open = activeValue === item.id}
		{@const previousIsOpen = activeIndex === index - 1}
		{@const nextIsOpen = activeIndex === index + 1}
		{@const startsGroup = open || index === 0 || previousIsOpen}
		{@const endsGroup = open || index === items.length - 1 || nextIsOpen}
		{@const separatedFromPrevious = index > 0 && (open || previousIsOpen)}
		{@const contentId = `${baseId}-${item.id}-content`}
		{@const triggerId = `${baseId}-${item.id}-trigger`}
		<BouncyAccordionRow
			{item}
			{open}
			{startsGroup}
			{endsGroup}
			{separatedFromPrevious}
			{contentId}
			{triggerId}
			reduce={reduce.current}
			{classNames}
			onToggle={() => toggleItem(item.id)}
		/>
	{/each}
</div>

<style lang="sass">
[data-slot='bouncy-accordion']
	display: flex
	flex-direction: column
	gap: var(--space-2xs)
	width: 100%

:global([data-slot='bouncy-accordion-item'])
	overflow: hidden
	background: var(--bg-surface)
	border: 1px solid var(--border)
	border-radius: var(--radius-6)

:global([data-slot='bouncy-accordion-trigger'])
	display: flex
	align-items: center
	gap: var(--space-xs)
	width: 100%
	padding: var(--space-xs) var(--space-sm)
	border: 0
	background: transparent
	color: var(--text-primary)
	font-size: var(--text-md)
	font-weight: 500
	text-align: left
	cursor: pointer

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: -2px

:global([data-slot='bouncy-accordion-icon'])
	display: inline-flex
	color: var(--text-muted)

:global([data-slot='bouncy-accordion-title'])
	flex: 1 1 auto

:global([data-slot='bouncy-accordion-chevron'])
	display: inline-flex
	color: var(--text-muted)

:global([data-slot='bouncy-accordion-content'])
	overflow: hidden
	padding: 0

:global([data-slot='bouncy-accordion-description'])
	padding: 0 var(--space-sm) var(--space-xs)
	color: var(--text-secondary)
	font-size: var(--text-sm)
	line-height: 1.55
</style>
