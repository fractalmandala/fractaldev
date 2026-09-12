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
</script>

<a class="k-megacard {className}" {href}>
	{#if image}<span class="k-megacard-image">{@render image?.()}</span>{/if}
	<span class="box gap-3xs">
		{#if eyebrow}<span class="k-megacard-eyebrow">{eyebrow}</span>{/if}
		<span class="k-megacard-title">{title}</span>
		{#if description}<span class="k-megacard-desc">{description}</span>{/if}
		{#if cta}<span class="k-megacard-cta">{cta} →</span>{/if}
	</span>
</a>
