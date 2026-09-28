<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** CSS aspect-ratio value, e.g. '16/9', '1/1', '4/3'. */
		ratio?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { ratio = '16/9', class: className = '', children, ...rest }: Props = $props();

	const rootClass = $derived(`k-aspect ${className}`.trim());
</script>

<div class={rootClass} style={`--k-aspect-ratio:${ratio}`} {...rest}>
	<div class="k-aspect-inner">{@render children?.()}</div>
</div>

<style lang="sass">

.k-aspect
	position: relative
	width: 100%
	aspect-ratio: var(--k-aspect-ratio, 16 / 9)
	overflow: hidden
	border-radius: var(--radius-md)
	background: var(--bg-raised)
	border: 1px solid var(--border)

	.k-aspect-inner
		position: absolute
		inset: 0
		display: flex
		align-items: center
		justify-content: center

		:global(img),
		:global(video)
			width: 100%
			height: 100%
			object-fit: cover
</style>
