<script lang="ts">
	import { motion, useTransform } from '@humanspeak/svelte-motion';

	interface Props {
		char: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		progress: any;
		index: number;
		total: number;
		stagger?: number;
		direction?: 'left' | 'right';
		distance?: number;
	}

	let {
		char,
		progress,
		index,
		total,
		stagger = 0.045,
		direction = 'right',
		distance = 120
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const x = useTransform(progress, (p: number) => {
		const maxStaggerWindow = Math.min(0.7, stagger * (total > 1 ? total / (total + 4) : 0.5));
		const charStart = total > 1 ? (index / (total - 1)) * maxStaggerWindow : 0;
		const charEnd = total > 1 ? charStart + (1 - maxStaggerWindow) : 1;
		const dirMultiplier = direction === 'left' ? -1 : 1;

		if (p <= charStart) return distance * dirMultiplier;
		if (p >= charEnd) return 0;
		const frac = (p - charStart) / (charEnd - charStart);
		return (1 - frac) * distance * dirMultiplier;
	});

	// svelte-ignore state_referenced_locally
	const opacity = useTransform(progress, (p: number) => {
		const maxStaggerWindow = Math.min(0.7, stagger * (total > 1 ? total / (total + 4) : 0.5));
		const charStart = total > 1 ? (index / (total - 1)) * maxStaggerWindow : 0;
		const charEnd = total > 1 ? charStart + (1 - maxStaggerWindow) : 1;

		if (p <= charStart) return 0;
		if (p >= charEnd) return 1;
		const frac = (p - charStart) / (charEnd - charStart);
		return Math.min(1, frac * 1.5);
	});
</script>

<motion.span class="stacking-letters-char" style={{ x, opacity }}>
	{char === ' ' ? '\u00A0' : char}
</motion.span>
