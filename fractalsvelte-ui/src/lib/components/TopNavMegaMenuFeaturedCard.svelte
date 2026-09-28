<script lang="ts">
	interface Props {
		eyebrow?: string;
		title: string;
		description?: string;
		href?: string;
		cta?: string;
		class?: string;
		/** Optional image/illustration snippet rendered at the top. */
		image?: import('svelte').Snippet;
	}

	let {
		eyebrow,
		title,
		description,
		href,
		cta = 'Learn more',
		class: className = '',
		image
	}: Props = $props();

	const rootClass = $derived(`k-megacard ${className}`.trim());
</script>

<a class={rootClass} {href}>
	{#if image}<span class="k-megacard-image">{@render image?.()}</span>{/if}
	<span class="box gap-3xs">
		{#if eyebrow}<span class="k-megacard-eyebrow">{eyebrow}</span>{/if}
		<span class="k-megacard-title">{title}</span>
		{#if description}<span class="k-megacard-desc">{description}</span>{/if}
		{#if cta}<span class="k-megacard-cta">{cta} →</span>{/if}
	</span>
</a>

<style lang="sass">
.k-megacard
	display: flex
	flex-direction: column
	gap: 10px
	padding: 16px
	background: var(--bg-surface)
	border: 1px solid var(--border)
	border-radius: var(--radius-12)
	color: inherit
	text-decoration: none
	transition: box-shadow 0.15s ease, border-color 0.15s ease

	&:hover
		border-color: var(--border-strong)
		box-shadow: var(--shadow-md)

.k-megacard-image
	display: block
	height: 120px
	border-radius: var(--radius-8)
	overflow: hidden
	background: var(--bg-raised)

	:global(img)
		width: 100%
		height: 100%
		object-fit: cover

.box
	display: flex
	flex-direction: column

	&.gap-3xs
		gap: var(--space-3xs)

.k-megacard-eyebrow
	font-size: var(--text-xs)
	font-weight: 600
	text-transform: uppercase
	letter-spacing: 0.05em
	color: var(--theme-color)

.k-megacard-title
	font-size: var(--text-lg)
	font-weight: 600

.k-megacard-desc
	font-size: var(--text-sm)
	color: var(--text-muted)

.k-megacard-cta
	font-size: var(--text-sm)
	font-weight: 500
	color: var(--theme-color-alt)
</style>
