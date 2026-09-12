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
	};

	let { items, label = 'Animated list' }: Props = $props();

	const listVariants: Variants = {
		hidden: {},
		visible: { transition: { delayChildren: 0.04, staggerChildren: 0.05 } }
	};

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 8 },
		visible: { opacity: 1, y: 0 }
	};
</script>

<MotionUl class="motion-list" aria-label={label} variants={listVariants} initial="hidden" whileInView="visible" transition={tweenContent}>
	{#each items as item (item.id)}
		<MotionLi variants={itemVariants} class="motion-list-item" transition={tweenContent}>
			<strong>{item.title}</strong>
			{#if item.description}<span>{item.description}</span>{/if}
		</MotionLi>
	{/each}
</MotionUl>
