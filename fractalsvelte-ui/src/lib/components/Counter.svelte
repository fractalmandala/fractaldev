<script lang="ts">
	type Props = {
		value: number;
		from?: number;
		duration?: number;
		locale?: string;
	};

	let { value, from = 0, duration = 700, locale }: Props = $props();
	let display = $state(0);
	let hasAnimated = false;
	let formatter = $derived(new Intl.NumberFormat(locale, { maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }));

	$effect(() => {
		const startedAt = performance.now();
		const initial = hasAnimated ? display : from;
		hasAnimated = true;
		let frame = 0;
		function tick(now: number) {
			const progress = Math.min(1, (now - startedAt) / Math.max(1, duration));
			const eased = 1 - Math.pow(1 - progress, 3);
			display = initial + (value - initial) * eased;
			if (progress < 1) frame = requestAnimationFrame(tick);
		}
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});
</script>

<output class="counter">{formatter.format(display)}</output>
