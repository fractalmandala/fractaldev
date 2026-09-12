<script lang="ts">
	import { motion, useTransform } from '@humanspeak/svelte-motion';

	interface Props {
		word: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		progress: any;
		index: number;
		total: number;
		stagger?: number;
		direction?: 'left' | 'right';
		distance?: number;
	}

	let {
		word,
		progress,
		index,
		total,
		stagger = 0.15,
		direction = 'right',
		distance = 180
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const x = useTransform(progress, (p: number) => {
		const maxStaggerWindow = Math.min(0.6, stagger * (total > 1 ? total / (total + 2) : 0.5));
		const wordStart = total > 1 ? (index / (total - 1)) * maxStaggerWindow : 0;
		const wordEnd = total > 1 ? wordStart + (1 - maxStaggerWindow) : 1;
		const dirMultiplier = direction === 'left' ? -1 : 1;

		if (p <= wordStart) return distance * dirMultiplier;
		if (p >= wordEnd) return 0;
		const frac = (p - wordStart) / (wordEnd - wordStart);
		return (1 - frac) * distance * dirMultiplier;
	});

	// svelte-ignore state_referenced_locally
	const opacity = useTransform(progress, (p: number) => {
		const maxStaggerWindow = Math.min(0.6, stagger * (total > 1 ? total / (total + 2) : 0.5));
		const wordStart = total > 1 ? (index / (total - 1)) * maxStaggerWindow : 0;
		const wordEnd = total > 1 ? wordStart + (1 - maxStaggerWindow) : 1;

		if (p <= wordStart) return 0;
		if (p >= wordEnd) return 1;
		const frac = (p - wordStart) / (wordEnd - wordStart);
		return Math.min(1, frac * 1.5);
	});
</script>

<motion.span class="stacking-words-word" style={{ x, opacity }}>
	{word}&nbsp;
</motion.span>
