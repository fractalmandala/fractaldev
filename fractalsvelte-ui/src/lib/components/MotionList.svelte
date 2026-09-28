<script lang="ts">
	import { MotionLi, MotionUl, type Variants } from '@humanspeak/svelte-motion';
	import { tweenContent } from '#lib/motion/presets.ts';

	type MotionListItem = {
		id: string;
		title: string;
		description?: string;
	};

	type Props = {
		items: MotionListItem[];
		label?: string;
		class?: string;
	};

	let { items, label = 'Animated list', class: className = '' }: Props = $props();

	const rootClass = $derived(['motion-list', className].filter(Boolean).join(' '));

	const listVariants: Variants = {
		hidden: {},
		visible: { transition: { delayChildren: 0.04, staggerChildren: 0.05 } }
	};

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 8 },
		visible: { opacity: 1, y: 0 }
	};
</script>

<MotionUl class={rootClass} aria-label={label} variants={listVariants} initial="hidden" whileInView="visible" transition={tweenContent}>
	{#each items as item (item.id)}
		<MotionLi variants={itemVariants} class="motion-list-item" transition={tweenContent}>
			<strong>{item.title}</strong>
			{#if item.description}<span>{item.description}</span>{/if}
		</MotionLi>
	{/each}
</MotionUl>

<style lang="sass">
:global(.motion-list)
	display: flex
	flex-direction: column
	gap: calc(var(--space-2xs) * var(--gap-scale, 1))
	list-style: none
	margin: 0
	padding: 0

:global(.motion-list-item)
	will-change: transform, opacity
</style>
