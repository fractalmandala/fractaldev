<script lang="ts" generics="T extends { id: string | number }">
	import { Card } from '$lib/components/partials';
	import { NavigationIcons } from '$lib/components/icons';
	import { transitionLink } from '$lib/utils';

	interface EmptyState {
		message: string;
		ctaText?: string;
		ctaHref?: string;
		secondaryText?: string;
	}

	let {
		title,
		items,
		viewAllHref,
		viewAllText = 'View all',
		emptyState,
		itemClass = 'row ycenter xbetween radius-8 surface pad-12 border',
		class: className = '',
		children
	}: {
		title: string;
		items: T[];
		viewAllHref?: string;
		viewAllText?: string;
		emptyState: EmptyState;
		itemClass?: string;
		class?: string;
		children?: import('svelte').Snippet<[T, number]>;
	} = $props();

	let hasItems = $derived(items && items.length > 0);
</script>

<Card class={className}>
	<div class="marg-bottom-16 row ycenter xbetween">
		<h3 class="text-lg weight-600 text-primary">{title}</h3>
		{#if viewAllHref}
			<a href={viewAllHref} use:transitionLink class="link row ycenter gap-4 text-sm">
				{viewAllText}
				<NavigationIcons name="link" size="square-12" />
			</a>
		{/if}
	</div>

	{#if !hasItems}
		<div class="pad-y-24 box xcenter">
			<p class="text-secondary">{emptyState.message}</p>
			{#if emptyState.ctaText && emptyState.ctaHref}
				<a href={emptyState.ctaHref} use:transitionLink class="marg-top-8 link text-sm">
					{emptyState.ctaText}
				</a>
			{/if}
			{#if emptyState.secondaryText}
				<p class="marg-top-8 text-xs text-muted">{emptyState.secondaryText}</p>
			{/if}
		</div>
	{:else}
		<div class="box gap-md">
			{#each items as item, index (item.id || index)}
				<div class={itemClass}>
					{#if children}
						{@render children(item, index)}
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</Card>
