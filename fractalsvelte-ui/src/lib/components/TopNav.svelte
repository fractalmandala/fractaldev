<script lang="ts">
	export interface TopNavItem {
		label: string;
		href?: string;
		active?: boolean;
		leading?: import('svelte').Snippet;
	}

	interface Props {
		items: TopNavItem[];
		label?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { items, label = 'Primary', class: className = '', children }: Props = $props();
</script>

<nav class="k-topnav {className}" aria-label={label}>
	{#each items as item (item.label)}
		{#if item.href}
			<a
				class="k-topnav-item"
				href={item.href}
				data-state={item.active ? 'active' : undefined}
				aria-current={item.active ? 'page' : undefined}
			>
				{#if item.leading}{@render item.leading?.()}{/if}
				{item.label}
			</a>
		{:else}
			<span class="k-topnav-item" data-state={item.active ? 'active' : undefined}>{item.label}</span
			>
		{/if}
	{/each}
	{#if children}
		<span class="grow"></span>
		<div class="row ycenter gap-2xs">{@render children?.()}</div>
	{/if}
</nav>
