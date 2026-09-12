<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		description?: string;
		eyebrow?: string;
		metadata?: string;
		image?: string;
		imageAlt?: string;
		imagePosition?: 'start' | 'end';
		accent?: string;
		children?: Snippet;
	};

	let {
		title,
		description,
		eyebrow,
		metadata,
		image,
		imageAlt = '',
		imagePosition = 'end',
		accent,
		children
	}: Props = $props();
</script>


<header
	class="acrolls-banner"
	data-image-position={image ? imagePosition : undefined}
	style:--acrolls-banner-accent={accent}
>
	<div class="acrolls-banner__text">
		{#if eyebrow}
			<p class="acrolls-banner__eyebrow">{eyebrow}</p>
		{/if}
		<h1 class="acrolls-banner__title">{title}</h1>
		{#if description}
			<p class="acrolls-banner__description">{description}</p>
		{/if}
		{#if metadata}
			<p class="acrolls-banner__meta">{metadata}</p>
		{/if}
		{#if children}
			<div class="acrolls-banner__extra">
				{@render children()}
			</div>
		{/if}
	</div>
	{#if image}
		<div class="acrolls-banner__media">
			<img src={image} alt={imageAlt} />
		</div>
	{/if}
</header>
