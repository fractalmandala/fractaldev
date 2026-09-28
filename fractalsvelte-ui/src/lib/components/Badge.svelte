<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { BadgeVariant } from '#lib/data/componentTypes.ts';

	type Props = {
		variant?: BadgeVariant;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};

	let { variant = 'default', class: className = '', children, ...rest }: Props = $props();

	// Accept 'neutral' / 'accent' as backwards-compatible aliases
	const intent = $derived(
		variant === 'neutral' ? 'default' : variant === 'accent' ? 'themed' : variant
	);
	const rootClass = $derived(`badge ${className}`.trim());
</script>

<span class={rootClass} data-variant={intent} {...rest}>
	{@render children?.()}
</span>

<style lang="sass">

.badge
	display: inline-flex
	align-items: center
	gap: calc(var(--space-3xs) * var(--gap-scale, 1))
	padding-inline: calc(var(--space-2xs) * var(--pad-scale, 1))
	padding-block: 2px
	font-family: inherit
	font-size: var(--text-xs)
	font-weight: 500
	line-height: 1.2
	white-space: nowrap
	background: var(--bg-raised)
	color: var(--text-secondary)
	border: 1px solid var(--border)
	border-radius: var(--radius-sm)

	&[data-variant='default'],
	&[data-variant='neutral']
		background: var(--bg-raised)
		border-color: var(--border)
		color: var(--text-secondary)

	&[data-variant='themed'],
	&[data-variant='accent']
		background: color-mix(in srgb, var(--theme-color) 14%, transparent)
		border-color: color-mix(in srgb, var(--theme-color) 35%, transparent)
		color: var(--theme-color-alt)

	&[data-variant='info']
		background: color-mix(in srgb, var(--info) 14%, transparent)
		border-color: color-mix(in srgb, var(--info) 35%, transparent)
		color: color-mix(in srgb, var(--info-hover, var(--info)) 70%, var(--text-primary))

	&[data-variant='success']
		background: color-mix(in srgb, var(--success) 14%, transparent)
		border-color: color-mix(in srgb, var(--success) 35%, transparent)
		color: color-mix(in srgb, var(--success-hover) 70%, var(--text-primary))

	&[data-variant='warning']
		background: color-mix(in srgb, var(--warning) 16%, transparent)
		border-color: color-mix(in srgb, var(--warning) 40%, transparent)
		color: color-mix(in srgb, var(--warning-hover) 60%, var(--text-primary))

	&[data-variant='danger']
		background: color-mix(in srgb, var(--danger) 12%, transparent)
		border-color: color-mix(in srgb, var(--danger) 35%, transparent)
		color: var(--danger-hover)
</style>
