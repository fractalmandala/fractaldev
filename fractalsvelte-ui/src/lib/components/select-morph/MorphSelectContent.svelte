<script lang="ts">
	import { AnimatePresence, motion } from '@humanspeak/svelte-motion';
	import { Icon } from 'fractalicons';
	import { luChevronDown } from 'fractalicons/lucide';
	import { LIST, MORPH } from './utils.js';
	import { useMorphSelectContext } from './context.js';
	import type { MorphSelectContentProps } from './types.js';

	let { class: className, children }: MorphSelectContentProps = $props();

	const ctx = useMorphSelectContext('MorphSelectContent');
	const label = $derived(ctx.labelFor(ctx.value));
</script>

<!-- Always-mounted, hidden — keeps item label registrations alive while
     closed so the trigger shows the selected value before first open. -->
<div aria-hidden="true" data-slot="select-morph-registrar">
	{@render children()}
</div>

<AnimatePresence initial={false} mode="popLayout">
	{#if ctx.open}
		<motion.div
			key="panel"
			layoutId={ctx.layoutId}
			id={ctx.listId}
			role="listbox"
			aria-labelledby={ctx.triggerId}
			transition={ctx.reduce ? { duration: 0 } : MORPH}
			style="border-radius:12px"
			data-slot="select-morph-panel"
			class={className}
		>
			<!-- Header mirrors the trigger (continuous morph) and collapses the
			     panel back into the trigger when clicked. -->
			<motion.button
				type="button"
				layout="position"
				aria-expanded="true"
				onclick={() => ctx.setOpen(false)}
				data-slot="select-morph-header"
			>
				<span
					data-slot="select-morph-header-label"
					data-empty={label ? undefined : 'true'}
				>
					{label ?? ctx.placeholder}
				</span>
				<motion.span
					animate={{ rotate: 180 }}
					transition={ctx.reduce ? { duration: 0 } : MORPH}
					data-slot="select-morph-header-chevron"
				>
					<Icon icon={luChevronDown} size={16} aria-hidden="true" />
				</motion.span>
			</motion.button>

			<div data-slot="select-morph-divider"></div>

			<motion.ul
				initial="hidden"
				animate="show"
				variants={ctx.reduce ? undefined : LIST}
				data-slot="select-morph-list"
			>
				{@render children()}
			</motion.ul>
		</motion.div>
	{/if}
</AnimatePresence>
