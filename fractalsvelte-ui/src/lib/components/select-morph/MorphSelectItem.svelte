<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { Icon } from 'fractalicons';
	import { luCheck } from 'fractalicons/lucide';
	import { ITEM } from './utils.js';
	import { useMorphSelectContext } from './context.js';
	import type { MorphSelectItemProps } from './types.js';

	let {
		value,
		label: labelProp,
		disabled = false,
		class: className,
		children
	}: MorphSelectItemProps = $props();

	const ctx = useMorphSelectContext('MorphSelectItem');

	const selected = $derived(ctx.value === value);
	const label = $derived.by(() => labelProp ?? value);

	// Register the display label with the root so the trigger/header can
	// resolve the selected value without rendering the items.
	$effect.pre(() => {
		ctx.register(value, label);
		return () => ctx.unregister(value);
	});
</script>

<motion.li variants={ctx.reduce ? undefined : ITEM} data-slot="select-morph-item">
	<button
		type="button"
		role="option"
		aria-selected={selected}
		disabled={disabled}
		data-slot="select-morph-item-button"
		data-selected={selected ? 'true' : undefined}
		data-disabled={disabled ? 'true' : undefined}
		class={className}
		onclick={() => ctx.select(value)}
	>
		{@render children()}
		{#if selected}
			<Icon icon={luCheck} size={14} aria-hidden="true" />
		{/if}
	</button>
</motion.li>
