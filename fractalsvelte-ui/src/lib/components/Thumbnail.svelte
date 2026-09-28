<script lang="ts">
	import type { Shape } from '#lib/data/componentTypes.ts';

	interface Props {
		src?: string;
		alt?: string;
		/** Fallback text (e.g. initials) shown while the image is missing. */
		fallback?: string;
		shape?: Shape;
		width?: string;
		height?: string;
		class?: string;
	}

	let {
		src,
		alt = '',
		fallback = '?',
		shape = 'square',
		width = '96px',
		height = '96px',
		class: className = ''
	}: Props = $props();

	const rootClass = $derived(['k-thumbnail', className].filter(Boolean).join(' '));

	let failed = $state(false);
</script>

<span
	class={rootClass}
	data-shape={shape}
	style={`--k-thumb-w:${width};--k-thumb-h:${height}`}
>
	{#if src && !failed}
		<img {src} {alt} onerror={() => (failed = true)} />
	{:else}
		<span class="center full muted weight-600">{fallback}</span>
	{/if}
</span>

<style lang="sass">
.k-thumbnail
	display: inline-block
	width: var(--k-thumb-w, 96px)
	height: var(--k-thumb-h, 96px)
	overflow: hidden
	border-radius: var(--radius-md)
	border: 1px solid var(--border)
	background: var(--bg-raised)

	img
		display: block
		width: 100%
		height: 100%
		object-fit: cover

	&[data-shape='square']
		border-radius: 0

	&[data-shape='modern']
		border-radius: var(--radius-sm)

	&[data-shape='curved']
		border-radius: var(--radius-md)

	&[data-shape='round']
		border-radius: var(--radius-full)
</style>
