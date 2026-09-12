<script lang="ts">
	import { MotionButton, MotionDiv } from '@humanspeak/svelte-motion';
	import CanvasMotion from './CanvasMotion.svelte';
	import { springFeedback, tweenContent } from '#lib/motion/presets.ts';

	type Category = 'animation' | 'background' | 'component' | 'text';
	type Props = {
		pattern: string;
		category?: Category;
		items?: string[];
		text?: string;
		label?: string;
	};

	let { pattern, category = 'animation', items = ['Explore', 'Compose', 'Share'], text = 'Make every interaction intentional', label }: Props = $props();
	let active = $state(false);
	const words = $derived(text.split(/(\s+)/));
</script>

{#if category === 'background'}
	<div class="bits-effect bits-effect--background" data-pattern={pattern}>
		<CanvasMotion pattern={`bits-${pattern}`} label={label ?? `${pattern.replaceAll('-', ' ')} animated background`} />
		<span>{pattern.replaceAll('-', ' ')}</span>
	</div>
{:else if category === 'text'}
	<MotionDiv class="bits-effect bits-effect--text" data-pattern={pattern} aria-label={label ?? text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={tweenContent}>
		{#each words as word, index (`${word}-${index}`)}
			<span data-word={word.trim() ? true : undefined}>{word}</span>
		{/each}
	</MotionDiv>
{:else if category === 'component'}
	<MotionDiv class="bits-effect bits-effect--component" data-pattern={pattern} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={tweenContent}>
		{#each items as item, index (item)}
			<MotionButton type="button" layout whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: .98 }} transition={{ ...springFeedback, delay: index * .03 }}><strong>{item}</strong><span>{pattern.replaceAll('-', ' ')}</span></MotionButton>
		{/each}
	</MotionDiv>
{:else}
	<div class="bits-effect bits-effect--animation" data-pattern={pattern}>
		<MotionDiv class="bits-effect__stage" animate={active ? { scale: [1, 1.03, 1], rotate: [0, 1, 0] } : { scale: 1, rotate: 0 }} transition={tweenContent}>
			{#each items as item, index (item)}<MotionDiv class="bits-effect__item" animate={active ? { y: [0, -8 - index * 2, 0], opacity: [1, .75, 1] } : { y: 0, opacity: 1 }} transition={{ ...tweenContent, delay: index * .05 }}>{item}</MotionDiv>{/each}
		</MotionDiv>
		<MotionButton type="button" class="bits-effect__trigger" whileTap={{ scale: .96 }} transition={springFeedback} onclick={() => active = !active}>{active ? 'Reset' : 'Preview'}</MotionButton>
	</div>
{/if}
