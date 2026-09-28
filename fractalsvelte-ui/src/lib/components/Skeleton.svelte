<script lang="ts">
	type Props = {
		width?: string;
		height?: string;
		circle?: boolean;
		class?: string;
		[key: string]: unknown;
	};

	let {
		width = '100%',
		height = '1rem',
		circle = false,
		class: className = '',
		...rest
	}: Props = $props();

	const rootClass = $derived(`skeleton ${className}`.trim());
</script>

<span
	class={rootClass}
	data-circle={circle || undefined}
	style:width
	style:height
	aria-label="Loading"
	role="status"
	{...rest}
></span>

<style lang="sass">

.skeleton
	display: block
	width: 100%
	height: 1rem
	border-radius: var(--radius-sm)
	background: linear-gradient(90deg, var(--bg-raised) 25%, var(--state-hover) 50%, var(--bg-raised) 75%)
	background-size: 200% 100%
	animation: skeleton-shimmer 1.6s ease-in-out infinite

	&[data-circle]
		border-radius: var(--radius-full)

@keyframes skeleton-shimmer
	from
		background-position: 200% 0
	to
		background-position: -200% 0

@media (prefers-reduced-motion: reduce)
	.skeleton
		animation: none
</style>
