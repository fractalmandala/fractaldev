<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { BannerVariant } from '#lib/data/componentTypes.ts';

	type Props = {
		variant?: BannerVariant;
		title?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};

	let {
		variant = 'info',
		title,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(`alert ${className}`.trim());
</script>

<section class={rootClass} data-variant={variant} role="status" {...rest}>
	<div class="alert-icon" aria-hidden="true">
		{variant === 'success' ? '✓' : variant === 'warning' ? '!' : variant === 'danger' ? '×' : variant === 'themed' ? '★' : 'i'}
	</div>
	<div>
		{#if title}<strong>{title}</strong>{/if}
		<div class="alert-content">{@render children?.()}</div>
	</div>
</section>

<style lang="sass">

.alert
	display: flex
	align-items: flex-start
	gap: calc(var(--space-2xs) * var(--gap-scale, 1))
	padding: calc(var(--space-xs) * var(--pad-scale, 1))
	border: 1px solid var(--border)
	border-left-width: 3px
	border-radius: var(--radius-md)
	background: var(--bg-surface)
	font-family: inherit
	font-size: var(--text-sm)

	strong
		display: block
		font-weight: 600

	&-icon
		display: inline-flex
		align-items: center
		justify-content: center
		flex-shrink: 0
		width: 20px
		height: 20px
		border-radius: var(--radius-full)
		font-size: var(--text-xs)
		font-weight: 700
		color: var(--text-inverse)

	&-content
		margin-top: 2px
		color: var(--text-secondary)

	&[data-variant='info']
		border-left-color: var(--info)
		.alert-icon
			background: var(--info)

	&[data-variant='success']
		border-left-color: var(--success)
		.alert-icon
			background: var(--success)

	&[data-variant='warning']
		border-left-color: var(--warning)
		.alert-icon
			background: var(--warning)

	&[data-variant='danger']
		border-left-color: var(--danger)
		.alert-icon
			background: var(--danger)

	&[data-variant='default']
		border-left-color: var(--border-strong)
		.alert-icon
			background: var(--text-muted)

	&[data-variant='themed']
		border-left-color: var(--theme-color)
		.alert-icon
			background: var(--theme-color)
</style>
