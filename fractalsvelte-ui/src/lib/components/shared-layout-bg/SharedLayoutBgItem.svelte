<script lang="ts">
	import { AnimatePresence, motion } from '@humanspeak/svelte-motion';
	import { SPRING_LAYOUT } from '../../ease.js';
	import { useId } from '../../use-id.js';
	import type { Snippet } from 'svelte';
	import { useSharedLayoutBg } from './context.js';

	let { class: className, children }: { class?: string; children?: Snippet } = $props();

	// React clones each row and derives the key from the child's key/index; in
	// Svelte each row generates its own stable id instead.
	const ctx = useSharedLayoutBg();
	const rowId = useId();

	function handleMouseEnter() {
		ctx?.setActive(rowId);
	}
</script>

{#if ctx}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class={className} onmouseenter={handleMouseEnter}>
		<AnimatePresence>
			{#if ctx.activeId === rowId}
				<motion.div
					key={rowId}
					initial={{ opacity: 0, filter: 'blur(6px)' }}
					animate={{ opacity: 1, filter: 'blur(0px)' }}
					exit={{ opacity: 0, filter: 'blur(6px)' }}
					data-slot="shared-layout-bg-pill-wrap"
					class={ctx.pillContainerClassName}
					style={`left:${-ctx.inset}px;right:${-ctx.inset}px`}
				>
					<motion.div
						layoutId={ctx.layoutId}
						transition={ctx.reduce ? { duration: 0 } : SPRING_LAYOUT}
						data-slot="shared-layout-bg-pill"
						class={ctx.pillClassName}
					/>
				</motion.div>
			{/if}
		</AnimatePresence>
		<div data-slot="shared-layout-bg-item-content">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
{:else}
	<div class={className}>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
