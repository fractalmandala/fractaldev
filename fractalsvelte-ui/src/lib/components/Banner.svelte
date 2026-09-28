<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luX } from 'fractalicons/lucide';
	import IconButton from './IconButton.svelte';
	import type { Snippet } from 'svelte';
	import type { BannerVariant, BannerLayout } from '#lib/data/componentTypes.ts';

	interface Props {
		variant?: BannerVariant;
		title?: string;
		layout?: BannerLayout;
		dismissible?: boolean;
		onDismiss?: () => void;
		class?: string;
		children?: Snippet;
		/** Leading icon snippet. */
		icon?: Snippet;
		/** Action buttons rendered at the end. */
		action?: Snippet;
		[key: string]: unknown;
	}

	let {
		variant = 'default',
		title,
		layout = 'inline',
		dismissible = false,
		onDismiss,
		class: className = '',
		children,
		icon,
		action,
		...rest
	}: Props = $props();

	let visible = $state(true);
	const rootClass = $derived(`k-banner ${className}`.trim());
</script>

{#if visible}
	<div
		class={rootClass}
		data-variant={variant}
		data-layout={layout}
		role={variant === 'danger' ? 'alert' : 'status'}
		{...rest}
	>
		{#if icon}<span class="k-banner-icon">{@render icon?.()}</span>{/if}
		<div class="k-banner-content">
			{#if title}<strong class="k-banner-title">{title}</strong>{/if}
			<div class="k-banner-body">{@render children?.()}</div>
		</div>
		{#if action}<div class="k-banner-actions">{@render action?.()}</div>{/if}
		{#if dismissible}
			<IconButton
				label="Dismiss banner"
				size="sm"
				onclick={() => {
					visible = false;
					onDismiss?.();
				}}
			>
				<Icon icon={luX} size={14} />
			</IconButton>
		{/if}
	</div>
{/if}

<style lang="sass">

.k-banner
	display: flex
	align-items: flex-start
	gap: 12px
	padding: 12px 16px
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	background: var(--bg-surface)
	color: var(--text-primary)
	font-family: inherit
	font-size: var(--text-md)

	&[data-variant='success']
		border-color: color-mix(in srgb, var(--success) 40%, var(--border))
		background: color-mix(in srgb, var(--success) 8%, var(--bg-surface))

	&[data-variant='warning']
		border-color: color-mix(in srgb, var(--warning) 40%, var(--border))
		background: color-mix(in srgb, var(--warning) 8%, var(--bg-surface))

	&[data-variant='danger']
		border-color: color-mix(in srgb, var(--danger) 40%, var(--border))
		background: color-mix(in srgb, var(--danger) 8%, var(--bg-surface))

	&[data-variant='info']
		border-color: color-mix(in srgb, var(--info) 40%, var(--border))
		background: color-mix(in srgb, var(--info) 8%, var(--bg-surface))

	&[data-variant='themed']
		border-color: color-mix(in srgb, var(--theme-color) 40%, var(--border))
		background: color-mix(in srgb, var(--theme-color) 8%, var(--bg-surface))

	&[data-layout='stacked']
		flex-direction: column
		align-items: stretch

	&-icon
		margin-top: 2px
		display: inline-flex
		align-items: center
		flex-shrink: 0

	&-content
		display: flex
		flex-direction: column
		gap: 2px
		flex-grow: 1

	&-title
		font-weight: 600
		font-size: var(--text-md)

	&-body
		font-size: var(--text-md)
		color: var(--text-secondary)

	&-actions
		display: flex
		align-items: center
		gap: var(--space-2xs)
		flex-shrink: 0
</style>
