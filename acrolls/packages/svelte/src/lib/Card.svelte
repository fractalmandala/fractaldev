<script lang="ts">
	import type { Snippet } from 'svelte';

	// A single card. Renders as a link when `href` is set, otherwise a plain
	// container. `icon` and `children` are optional snippets; `title`/`description`
	// are plain strings so they stay indexable and SSR-stable.
	type Props = {
		href?: string;
		title?: string;
		description?: string;
		icon?: Snippet;
		children?: Snippet;
	};

	let { href, title, description, icon, children }: Props = $props();
</script>

{#snippet content()}
	{#if icon}
		<span class="acrolls-cards__icon" aria-hidden="true">{@render icon()}</span>
	{/if}
	<span class="acrolls-cards__content">
		{#if title}
			<span class="acrolls-cards__title">{title}</span>
		{/if}
		{#if description}
			<span class="acrolls-cards__desc">{description}</span>
		{/if}
		{#if children}
			<span class="acrolls-cards__body">{@render children()}</span>
		{/if}
	</span>
{/snippet}

{#if href}
	<a class="acrolls-cards__item" {href}>{@render content()}</a>
{:else}
	<div class="acrolls-cards__item">{@render content()}</div>
{/if}
