<script lang="ts">
	export interface SideNavItem {
		label: string;
		href?: string;
		/** Active state (or pass activeValue to compare). */
		active?: boolean;
		value?: string;
		leading?: import('svelte').Snippet;
		onclick?: () => void;
	}

	export interface SideNavGroup {
		heading?: string;
		items: SideNavItem[];
	}

	interface Props {
		groups: SideNavGroup[];
		/** Value of the currently active item, compared against item.value. */
		activeValue?: string;
		class?: string;
	}

	let { groups, activeValue, class: className = '' }: Props = $props();

	function isActive(item: SideNavItem) {
		if (item.active !== undefined) return item.active;
		if (activeValue !== undefined && item.value !== undefined) return item.value === activeValue;
		return false;
	}
</script>

<nav class="k-sidenav {className}" aria-label="Side navigation">
	{#each groups as group, gi (group.heading ?? gi)}
		{#if group.heading}<span class="k-sidenav-heading">{group.heading}</span>{/if}
		{#each group.items as item (item.label)}
			{#if item.href}
				<a
					class="k-sidenav-item"
					href={item.href}
					data-state={isActive(item) ? 'active' : undefined}
					aria-current={isActive(item) ? 'page' : undefined}
				>
					{#if item.leading}{@render item.leading?.()}{/if}
					{item.label}
				</a>
			{:else}
				<button
					type="button"
					class="k-sidenav-item"
					data-state={isActive(item) ? 'active' : undefined}
					aria-current={isActive(item) ? 'page' : undefined}
					onclick={item.onclick}
				>
					{#if item.leading}{@render item.leading?.()}{/if}
					{item.label}
				</button>
			{/if}
		{/each}
	{/each}
</nav>
