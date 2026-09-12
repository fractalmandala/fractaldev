<script lang="ts">

	import type { Snippet } from 'svelte'

	interface Props {
		title: string;
		description?: string;
		children?: Snippet
	} 

	let {
		title = '',
		description = '',
		children
	}: Props = $props()

</script>

<header class="article-header box gap-bs marg-bottom-2xl">
	<h1 class="text-tight-lg">{title}</h1>
	<span class="text-muted text-lg lh15">{description}</span>
	{@render children?.()}
</header>

<style lang="sass">

.article-header h1
	font-size: var(--text-5xl)
	letter-spacing: -0.08rem
	font-weight: 600
	line-height: 1.14
	color: var(--text-primary)
	margin: 0
	scroll-margin-top: 6.5rem
	text-wrap: balance


</style>