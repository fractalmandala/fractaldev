<script lang="ts">
	import { MotionSpan, useReducedMotionConfig } from '@humanspeak/svelte-motion';
	import { tweenContent } from '#lib/motion/presets.ts';

	type Props = {
		texts: string[];
		interval?: number;
		label?: string;
	};

	let { texts, interval = 2200, label = 'Rotating text' }: Props = $props();
	let index = $state(0);
	const reducedMotion = useReducedMotionConfig();
	let text = $derived(texts[index % Math.max(texts.length, 1)] ?? '');

	$effect(() => {
		if (reducedMotion.current || texts.length < 2) return;
		const timer = window.setInterval(() => index = (index + 1) % texts.length, interval);
		return () => window.clearInterval(timer);
	});
</script>

<MotionSpan class="text-loop" aria-label={label} key={`loop-${index}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={tweenContent}>{text}</MotionSpan>
