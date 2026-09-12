<script lang="ts">
	/**
	 * Default mdsvex layout — mdsvex injects frontmatter as props and content as a snippet.
	 */
	import type { Snippet } from 'svelte';
	import Publication from './Publication.svelte';

	interface Props {
		title?: string;
		description?: string;
		brief?: string;
		eyebrow?: string;
		series?: string;
		project?: string;
		reading?: string;
		image?: string;
		imageAlt?: string;
		children?: Snippet;
		// mdsvex / host may pass extra frontmatter
		[key: string]: unknown;
	}

	let {
		title,
		description,
		brief,
		eyebrow,
		series,
		project,
		reading,
		image,
		imageAlt,
		children,
		...rest
	}: Props = $props();

	const desc = $derived(description ?? brief);
	const eye = $derived(eyebrow ?? series ?? project);
</script>

<Publication {...rest}>
	{#if title}
		<header class="acrolls-banner">
			<div class="acrolls-banner__text">
				{#if eye}
					<p class="acrolls-banner__eyebrow">{eye}</p>
				{/if}
				<h1 class="acrolls-banner__title">{title}</h1>
				{#if desc}
					<p class="acrolls-banner__description">{desc}</p>
				{/if}
				{#if reading}
					<p class="acrolls-banner__meta">{reading}</p>
				{/if}
			</div>
			{#if image}
				<div class="acrolls-banner__media">
					<img src={image} alt={typeof imageAlt === 'string' ? imageAlt : ''} />
				</div>
			{/if}
		</header>
	{/if}
	{@render children?.()}
</Publication>
