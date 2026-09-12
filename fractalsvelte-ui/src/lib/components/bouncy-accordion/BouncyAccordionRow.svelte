<script lang="ts">
	import { untrack } from 'svelte';
	import { motion } from '@humanspeak/svelte-motion';
	import { Icon } from 'fractalicons';
	import { luChevronDown } from 'fractalicons/lucide';
	import {
		CHEVRON_TRANSITION,
		CONTENT_CLOSE_TRANSITION,
		CONTENT_OPEN_TRANSITION,
		DESCRIPTION_TRANSITION,
		ROW_TRANSITION
	} from './utils.js';
	import type { BouncyAccordionRowProps } from './types.js';

	let {
		item,
		open,
		startsGroup,
		endsGroup,
		separatedFromPrevious,
		contentId,
		triggerId,
		reduce,
		classNames,
		onToggle
	}: BouncyAccordionRowProps = $props();

	// Measure the description block so the layout="size" wrapper can animate
	// between 0 and the natural height.
	let contentEl = $state<HTMLDivElement | null>(null);
	let contentHeight = $state(0);

	$effect(() => {
		const node = untrack(() => contentEl);
		if (!node) return;

		const updateHeight = () => {
			contentHeight = node.offsetHeight;
		};
		updateHeight();

		const observer = new ResizeObserver(updateHeight);
		observer.observe(node);

		return () => observer.disconnect();
	});
</script>

<motion.div
	layout="position"
	initial={false}
	style={`margin-top:${separatedFromPrevious ? 12 : 0}px`}
	transition={reduce ? { duration: 0 } : ROW_TRANSITION}
>
	<motion.div
		data-state={open ? 'open' : 'closed'}
		data-disabled={item.disabled ? 'true' : undefined}
		initial={false}
		animate={{
			borderTopLeftRadius: startsGroup ? 28 : 0,
			borderTopRightRadius: startsGroup ? 28 : 0,
			borderBottomLeftRadius: endsGroup ? 28 : 0,
			borderBottomRightRadius: endsGroup ? 28 : 0
		}}
		transition={reduce ? { duration: 0 } : ROW_TRANSITION}
		data-slot="bouncy-accordion-item"
		class={classNames?.item}
	>
		<button
			id={triggerId}
			type="button"
			disabled={item.disabled}
			aria-expanded={open}
			aria-controls={contentId}
			onclick={onToggle}
			data-slot="bouncy-accordion-trigger"
			class={classNames?.trigger}
		>
			{#if item.icon}
				<span data-slot="bouncy-accordion-icon" class={classNames?.icon}>
					{@render item.icon()}
				</span>
			{/if}
			<span data-slot="bouncy-accordion-title" class={classNames?.title}>
				{#if typeof item.title === 'string'}
					{item.title}
				{:else}
					{@render item.title()}
				{/if}
			</span>
			<motion.span
				aria-hidden="true"
				animate={{ rotate: open ? 180 : 0 }}
				transition={reduce ? { duration: 0 } : CHEVRON_TRANSITION}
				data-slot="bouncy-accordion-chevron"
				class={classNames?.chevron}
			>
				<Icon icon={luChevronDown} size={16} />
			</motion.span>
		</button>

		<motion.div
			layout="size"
			id={contentId}
			role="region"
			aria-labelledby={triggerId}
			aria-hidden={!open}
			inert={!open}
			initial={false}
			style={`height:${open && item.description ? contentHeight : 0}px`}
			transition={reduce
				? { duration: 0 }
				: open
					? CONTENT_OPEN_TRANSITION
					: CONTENT_CLOSE_TRANSITION}
			data-slot="bouncy-accordion-content"
			class={classNames?.content}
		>
			<motion.div
				bind:ref={contentEl}
				animate={{ opacity: open ? 1 : 0 }}
				transition={reduce ? { duration: 0 } : DESCRIPTION_TRANSITION}
				data-slot="bouncy-accordion-description-wrap"
			>
				<div data-slot="bouncy-accordion-description" class={classNames?.description}>
					{#if typeof item.description === 'string'}
						{item.description}
					{:else if item.description}
						{@render item.description()}
					{/if}
				</div>
			</motion.div>
		</motion.div>
	</motion.div>
</motion.div>
