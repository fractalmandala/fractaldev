<script lang="ts">
	import { AnimatePresence, motion } from '@humanspeak/svelte-motion';
	import { Icon } from 'fractalicons';
	import { luCheck } from 'fractalicons/lucide';
	import { SPRING_PANEL } from '../../ease.js';
	import { getContextMenuContext } from './context-menu-context.js';
	import ContextMenuItemBase from './context-menu-item-base.svelte';
	import type { ContextMenuCheckboxItemProps } from './context-menu.types.js';

	// Checkbox toggles keep the menu open unless the consumer opts into closing.
	let { children, checked, onCheckedChange, closeOnSelect = false, ...rest }: ContextMenuCheckboxItemProps = $props();

	const ctx = getContextMenuContext('ContextMenuCheckboxItem');
</script>

<ContextMenuItemBase
	{...rest}
	role="menuitemcheckbox"
	ariaChecked={checked}
	{closeOnSelect}
	onSelect={() => onCheckedChange?.(!checked)}
>
	<span data-slot="context-menu-icon">
		<AnimatePresence initial={false}>
			{#if checked}
				<motion.span
					key="check"
					initial={ctx.reduce ? false : { opacity: 0, scale: 0.75 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: ctx.reduce ? 1 : 0.75 }}
					transition={ctx.reduce ? { duration: 0.08 } : SPRING_PANEL}
				>
					<Icon icon={luCheck} size={14} decorative />
				</motion.span>
			{/if}
		</AnimatePresence>
	</span>
	{@render children()}
</ContextMenuItemBase>
