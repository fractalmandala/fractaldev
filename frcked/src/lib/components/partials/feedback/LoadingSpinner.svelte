<script lang="ts">
	let {
		text = 'Loading...',
		size = 'md',
		color = 'blue',
		centered = true,
		class: className = ''
	}: {
		text?: string;
		size?: 'sm' | 'md' | 'lg';
		color?: 'blue' | 'gray' | 'green' | 'red' | 'yellow';
		centered?: boolean;
		class?: string;
	} = $props();

	const sizeClasses = {
		sm: 'square-16',
		md: 'square-32',
		lg: 'square-48'
	};

	const colorClasses = {
		blue: 'text-primary',
		gray: 'text-muted',
		green: 'text-success',
		red: 'text-danger',
		yellow: 'text-warning'
	};

	let spinnerClasses = $derived(
		`${sizeClasses[size]} animate-spin radius-full border-b-2 ${colorClasses[color]}`
	);
	let containerClasses = $derived(centered ? 'row ycenter xcenter pad-y-3xl' : 'row ycenter');
</script>

<div class="{containerClasses} {className}">
	<div class={spinnerClasses}></div>
	{#if text}
		<span class="marg-left-8 text-secondary">{text}</span>
	{/if}
</div>
