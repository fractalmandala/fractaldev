<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { BannerVariant } from '#lib/data/componentTypes.ts';

	type Props = {
		open?: boolean;
		variant?: BannerVariant;
		title: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};

	let {
		open = $bindable(true),
		variant = 'info',
		title,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(`toast ${className}`.trim());
</script>

{#if open}
	<div class={rootClass} data-variant={variant} role="status" {...rest}>
		<div>
			<strong>{title}</strong>
			<div class="toast-content">{@render children?.()}</div>
		</div>
		<button
			type="button"
			class="toast-close"
			aria-label="Dismiss notification"
			onclick={() => (open = false)}
		>
			×
		</button>
	</div>
{/if}

<style lang="sass">

.toast
	display: flex
	align-items: flex-start
	justify-content: space-between
	gap: calc(var(--space-xs) * var(--gap-scale, 1))
	width: 100%
	max-width: 420px
	padding: calc(var(--space-xs) * var(--pad-scale, 1))
	background: var(--bg-popover, var(--bg-surface))
	border: 1px solid var(--border)
	border-left-width: 3px
	border-radius: var(--radius-md)
	box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15))
	font-family: inherit
	font-size: var(--text-sm)

	strong
		display: block
		font-weight: 600
		color: var(--text-primary)

	&-content
		margin-top: 2px
		color: var(--text-secondary)

	&-close
		flex-shrink: 0
		width: 24px
		height: 24px
		display: inline-flex
		align-items: center
		justify-content: center
		background: none
		border: 0
		border-radius: var(--radius-sm)
		color: var(--text-muted)
		cursor: pointer
		font-size: var(--text-md)
		line-height: 1
		transition: background var(--motionin1), color var(--motionin1)

		&:hover
			background: var(--state-hover)
			color: var(--text-primary)

		&:focus-visible
			outline: 2px solid var(--ring)
			outline-offset: 1px

	&[data-variant='default']
		border-left-color: var(--border-strong)

	&[data-variant='themed']
		border-left-color: var(--theme-color)

	&[data-variant='info']
		border-left-color: var(--info)

	&[data-variant='success']
		border-left-color: var(--success)

	&[data-variant='warning']
		border-left-color: var(--warning)

	&[data-variant='danger']
		border-left-color: var(--danger)
</style>
