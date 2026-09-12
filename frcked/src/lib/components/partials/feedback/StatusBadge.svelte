<script lang="ts">
	let {
		status,
		variant = 'gray',
		size = 'sm',
		rounded = true,
		dot = false,
		customColors,
		class: className = ''
	}: {
		status: string;
		variant?: 'success' | 'warning' | 'error' | 'info' | 'gray' | 'update' | 'custom';
		size?: 'xs' | 'sm' | 'md' | 'lg';
		rounded?: boolean;
		dot?: boolean;
		customColors?: {
			bg: string;
			text: string;
		};
		class?: string;
	} = $props();

	const sizeVariants = {
		xs: 'pad-x-6 pad-y-2 text-xs',
		sm: 'pad-x-8 pad-y-4 text-xs',
		md: 'pad-x-12 pad-y-6 text-sm',
		lg: 'pad-x-12 pad-y-8 text-sm'
	};

	const colorVariants = $derived({
		success: 'text-success border',
		warning: 'text-warning border',
		error: 'text-danger border',
		info: 'text-theme border',
		update: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
		gray: 'text-secondary border',
		custom: customColors ? `${customColors.bg} ${customColors.text}` : 'text-secondary border'
	});

	const dotVariants = $derived({
		success: 'bg-success',
		warning: 'bg-warning',
		error: 'bg-danger',
		info: 'bg-info',
		update: 'bg-purple-500',
		gray: 'bg-gray-400',
		custom: customColors?.bg || 'bg-gray-400'
	});

	let badgeClasses = $derived(
		[
			'badge weight-500',
			sizeVariants[size],
			colorVariants[variant],
			rounded ? 'radius-full' : '',
			className
		]
			.filter(Boolean)
			.join(' ')
	);

	let dotClasses = $derived(['square-8 radius-full marg-right-6', dotVariants[variant]].join(' '));
</script>

<span class={badgeClasses}>
	{#if dot}
		<span class={dotClasses}></span>
	{/if}
	{status}
</span>
