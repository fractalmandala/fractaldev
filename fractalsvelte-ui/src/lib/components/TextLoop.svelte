<script lang="ts">
	import { MotionSpan, useReducedMotionConfig } from '@humanspeak/svelte-motion';
	import { tweenContent } from '#lib/motion/presets.ts';

	type Props = {
		texts: string[];
		interval?: number;
		label?: string;
		class?: string;
		[key: string]: unknown;
	};

	let {
		texts,
		interval = 2200,
		label = 'Rotating text',
		class: className = '',
		...rest
	}: Props = $props();

	let index = $state(0);
	const reducedMotion = useReducedMotionConfig();
	let text = $derived(texts[index % Math.max(texts.length, 1)] ?? '');
	const rootClass = $derived(`text-loop ${className}`.trim());

	$effect(() => {
		if (reducedMotion.current || texts.length < 2) return;
		const timer = window.setInterval(() => (index = (index + 1) % texts.length), interval);
		return () => window.clearInterval(timer);
	});
</script>

<MotionSpan
	class={rootClass}
	aria-label={label}
	key={`loop-${index}`}
	initial={{ opacity: 0, y: 6 }}
	animate={{ opacity: 1, y: 0 }}
	transition={tweenContent}
	{...rest}
>
	{text}
</MotionSpan>

<style lang="sass">

:global(.text-loop)
	display: inline-flex
	overflow: hidden
	vertical-align: bottom
	min-width: 5ch
	justify-content: flex-start
	font-weight: 600
</style>
