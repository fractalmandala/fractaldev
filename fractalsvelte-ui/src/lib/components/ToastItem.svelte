<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luX, luInfo, luCircleCheck, luTriangleAlert, luCircleAlert } from 'fractalicons/lucide';
	import IconButton from './IconButton.svelte';

	type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';

	interface Props {
		variant?: Variant;
		title?: string;
		description?: string;
		/** Auto-dismiss after this many ms. 0 disables. */
		duration?: number;
		/** Fired when the toast asks to be removed (auto or manual). */
		onDismiss?: () => void;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'default',
		title,
		description,
		duration = 4000,
		onDismiss,
		class: className = '',
		children
	}: Props = $props();

	let timer: ReturnType<typeof setTimeout> | undefined = $state();

	const iconData = $derived.by(() => {
		switch (variant) {
			case 'success':
				return luCircleCheck;
			case 'warning':
				return luTriangleAlert;
			case 'danger':
				return luCircleAlert;
			case 'info':
				return luInfo;
			default:
				return luInfo;
		}
	});

	onMount(() => {
		if (duration > 0) {
			timer = setTimeout(() => onDismiss?.(), duration);
		}
		return () => clearTimeout(timer);
	});
</script>

<div
	class="k-toast {className}"
	data-variant={variant}
	role={variant === 'danger' ? 'alert' : 'status'}
>
	<Icon icon={iconData} size={18} class="k-toast-icon" />
	<div class="box grow">
		{#if title}<strong class="text-md">{title}</strong>{/if}
		{#if description}<span class="text-sm muted">{description}</span>{/if}
		{@render children?.()}
	</div>
	<IconButton label="Dismiss toast" size="sm" onclick={() => onDismiss?.()}>
		<Icon icon={luX} size={14} />
	</IconButton>
</div>
