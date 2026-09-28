<script lang="ts">
	import type { Size } from '#lib/data/componentTypes.ts';

	type Props = {
		src?: string;
		alt?: string;
		name?: string;
		size?: Size;
		class?: string;
		[key: string]: unknown;
	};

	let {
		src,
		alt = '',
		name = '',
		size = 'md',
		class: className = '',
		...rest
	}: Props = $props();

	const initials = $derived(
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0])
			.join('')
			.toUpperCase()
	);

	const rootClass = $derived(`avatar ${className}`.trim());
</script>

<span class={rootClass} data-size={size} aria-label={alt || name} {...rest}>
	{#if src}
		<img {src} {alt} />
	{:else}
		{initials || '?'}
	{/if}
</span>

<style lang="sass">

.avatar
	display: inline-flex
	align-items: center
	justify-content: center
	flex-shrink: 0
	border-radius: var(--radius-full)
	overflow: hidden
	font-family: inherit
	font-weight: 600
	color: var(--text-inverse)
	background: var(--theme-color-alt)
	user-select: none

	img
		width: 100%
		height: 100%
		object-fit: cover

	&[data-size='sm']
		width: 28px
		height: 28px
		font-size: var(--text-xs)

	&[data-size='md']
		width: 40px
		height: 40px
		font-size: var(--text-sm)

	&[data-size='bs']
		width: 48px
		height: 48px
		font-size: var(--text-md)

	&[data-size='lg']
		width: 56px
		height: 56px
		font-size: var(--text-lg)
</style>
