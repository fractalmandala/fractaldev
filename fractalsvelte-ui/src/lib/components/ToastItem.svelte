<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luX, luInfo, luCircleCheck, luTriangleAlert, luCircleAlert } from 'fractalicons/lucide';
	import IconButton from './IconButton.svelte';
	import type { Snippet } from 'svelte';
	import type { BannerVariant } from '#lib/data/componentTypes.ts';

	interface Props {
		variant?: BannerVariant;
		title?: string;
		description?: string;
		/** Auto-dismiss after this many ms. 0 disables. */
		duration?: number;
		/** Fired when the toast asks to be removed (auto or manual). */
		onDismiss?: () => void;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		variant = 'default',
		title,
		description,
		duration = 4000,
		onDismiss,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	let timer: ReturnType<typeof setTimeout> | undefined = $state();
	const rootClass = $derived(`k-toast ${className}`.trim());

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
	class={rootClass}
	data-variant={variant}
	role={variant === 'danger' ? 'alert' : 'status'}
	{...rest}
>
	<Icon icon={iconData} size={18} class="k-toast-icon" />
	<div class="k-toast-body">
		{#if title}<strong class="k-toast-title">{title}</strong>{/if}
		{#if description}<span class="k-toast-desc">{description}</span>{/if}
		{@render children?.()}
	</div>
	<IconButton label="Dismiss toast" size="sm" onclick={() => onDismiss?.()}>
		<Icon icon={luX} size={14} />
	</IconButton>
</div>

<style lang="sass">

.k-toast
	display: flex
	align-items: flex-start
	gap: 10px
	padding: 12px 16px
	background: var(--bg-popover, var(--bg-surface))
	color: var(--text-primary)
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.15))
	font-family: inherit
	font-size: var(--text-md)

	&[data-variant='success']
		border-left: 3px solid var(--success)

	&[data-variant='warning']
		border-left: 3px solid var(--warning)

	&[data-variant='danger']
		border-left: 3px solid var(--danger)

	&[data-variant='info']
		border-left: 3px solid var(--info)

	&[data-variant='themed']
		border-left: 3px solid var(--theme-color)

	:global(.k-toast-icon)
		margin-top: 2px
		color: var(--text-muted)
		flex-shrink: 0

	&-body
		display: flex
		flex-direction: column
		flex-grow: 1

	&-title
		font-weight: 600
		font-size: var(--text-md)

	&-desc
		font-size: var(--text-sm)
		color: var(--text-secondary)
</style>
