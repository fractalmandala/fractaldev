<script lang="ts">
	import { AnimatePresence, motion } from '@humanspeak/svelte-motion';
	import { Icon } from 'fractalicons';
	import { luChevronDown } from 'fractalicons/lucide';
	import { MORPH } from './utils.js';
	import { useMorphSelectContext } from './context.js';
	import type { MorphSelectTriggerProps } from './types.js';

	let { class: className, children }: MorphSelectTriggerProps = $props();

	const ctx = useMorphSelectContext('MorphSelectTrigger');
</script>

<!-- Invisible sizer reserves the closed height (the morph surface is
     absolute, so this keeps surrounding layout from shifting). -->
<div aria-hidden="true" inert data-slot="select-morph-sizer" class={className}>
	{@render children()}
	<Icon icon={luChevronDown} size={16} aria-hidden="true" />
</div>

<AnimatePresence initial={false} mode="popLayout">
	{#if !ctx.open}
		<motion.button
			key="trigger"
			layoutId={ctx.layoutId}
			type="button"
			id={ctx.triggerId}
			disabled={ctx.disabled}
			aria-haspopup="listbox"
			aria-expanded={ctx.open}
			aria-controls={ctx.listId}
			onclick={() => ctx.setOpen(true)}
			transition={ctx.reduce ? { duration: 0 } : MORPH}
			style="border-radius:12px"
			data-slot="select-morph-trigger"
			class={className}
		>
			<motion.span layout="position" data-slot="select-morph-trigger-label">
				{@render children()}
			</motion.span>
			<motion.span layout="position" data-slot="select-morph-trigger-chevron">
				<Icon icon={luChevronDown} size={16} aria-hidden="true" />
			</motion.span>
		</motion.button>
	{/if}
</AnimatePresence>
