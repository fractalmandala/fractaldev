<script lang="ts">
	type Props = {
		value: number;
		from?: number;
		duration?: number;
		locale?: string;
		class?: string;
		[key: string]: unknown;
	};

	let {
		value,
		from = 0,
		duration = 700,
		locale,
		class: className = '',
		...rest
	}: Props = $props();

	let display = $state(0);
	let hasAnimated = false;
	const rootClass = $derived(`counter ${className}`.trim());
	let formatter = $derived(
		new Intl.NumberFormat(locale, { maximumFractionDigits: Number.isInteger(value) ? 0 : 2 })
	);

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

<output class={rootClass} {...rest}>{formatter.format(display)}</output>

<style lang="sass">

.counter
	font-family: inherit
	font-variant-numeric: tabular-nums
	display: inline-block
</style>
