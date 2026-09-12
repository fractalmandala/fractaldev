<script lang="ts">
	let {
		value = 0,
		max = 100,
		label,
		showPercentage = true,
		color = 'blue',
		size = 'md',
		animated = true,
		striped = false,
		autoColor = false,
		class: className = ''
	}: {
		value?: number;
		max?: number;
		label?: string;
		showPercentage?: boolean;
		color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'orange';
		size?: 'sm' | 'md' | 'lg';
		animated?: boolean;
		striped?: boolean;
		autoColor?: boolean;
		class?: string;
	} = $props();

	let percentage = $derived.by(() => {
		// Validate inputs to prevent NaN values
		const safeValue = isNaN(value) || !isFinite(value) ? 0 : value;
		const safeMax = isNaN(max) || !isFinite(max) || max <= 0 ? 100 : max;

		const calculated = (safeValue / safeMax) * 100;

		// Ensure the result is a valid number within bounds
		if (isNaN(calculated) || !isFinite(calculated)) {
			return 0;
		}

		return Math.min(Math.max(calculated, 0), 100);
	});

	// Auto color logic based on percentage
	let dynamicColor = $derived.by(() => {
		if (!autoColor) return color;

		if (percentage <= 25) return 'red';
		if (percentage <= 45) return 'orange';
		if (percentage <= 75) return 'yellow';
		return 'green';
	});

	const sizeStyles = {
		sm: 'h-4',
		md: 'h-6',
		lg: 'h-8'
	};

	const colorStyles = {
		blue: 'bg-theme',
		green: 'bg-success',
		yellow: 'bg-warning',
		red: 'bg-danger',
		orange: 'bg-warning',
		gray: 'raised'
	};

	const backgroundStyles = 'raised';

	const animationStyles = $derived(animated ? 'transition-all duration-500 ease-out' : '');

	const stripedStyles = $derived(striped ? 'striped-progress' : '');

	let barClasses = $derived(
		`${sizeStyles[size]} ${colorStyles[dynamicColor]} ${stripedStyles} radius-full relative overflow-hidden`
	);

	let containerClasses = $derived(
		`relative wfull ${sizeStyles[size]} ${backgroundStyles} radius-full overflow-hidden`
	);

	let nativeProgressClasses = $derived(
		`absolute inset-0 wfull hfull opacity-0 pointer-events-none`
	);
</script>

<div class="box gap-md {className}">
	{#if label || showPercentage}
		<div class="row ycenter xbetween text-sm">
			{#if label}
				<span class="text-xs weight-500 tt-u text-secondary">{label}</span>
			{/if}
			{#if showPercentage}
				<span class="radius-md border surface pad-x-8 pad-y-2 mono text-xs text-secondary">
					{Math.round(percentage)}%
				</span>
			{/if}
		</div>
	{/if}

	<div class={containerClasses}>
		<!-- Native progress element for semantics and accessibility (invisible) -->
		<progress
			class={nativeProgressClasses}
			{value}
			{max}
			aria-label={label || `Progress: ${Math.round(percentage)}%`}
		>
			{Math.round(percentage)}%
		</progress>

		<!-- Custom animated progress bar (visible) -->
		<div
			class={barClasses}
			style="width: {percentage}%; {animated && !striped
				? 'transition: width 500ms ease-out;'
				: ''}"
			role="presentation"
		></div>
	</div>
</div>

<style lang="sass">
.striped-progress
	background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 8px, transparent 8px, transparent 16px)
	background-size: 16px 16px
	animation: stripe-move 1s linear infinite

:global([data-theme='dark']) .striped-progress
	background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2) 8px, transparent 8px, transparent 16px)

@keyframes stripe-move
	0%
		background-position: 0 0
	100%
		background-position: 16px 0
</style>
