<script lang="ts" module>
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
</script>

<script lang="ts">
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

	const rootClass = $derived(`k-sidenav ${className}`.trim());
</script>

<nav class={rootClass} aria-label="Side navigation">
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

<style lang="sass">
.k-sidenav
	display: flex
	flex-direction: column
	gap: 2px
	padding: 8px
	width: 240px
	background: var(--bg-surface)
	border: 1px solid var(--border)
	border-radius: var(--radius-12)

.k-sidenav-item
	display: flex
	align-items: center
	gap: 10px
	padding: 8px 12px
	font-size: var(--text-md)
	border: none
	border-radius: var(--radius-6)
	background: transparent
	color: var(--text-secondary)
	cursor: pointer
	text-decoration: none

	&:hover
		background: var(--state-hover)
		color: var(--text-primary)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

	&[data-state='active']
		background: color-mix(in srgb, var(--theme-color) 10%, var(--bg))
		color: var(--theme-color-alt)
		font-weight: 500

.k-sidenav-heading
	padding: 10px 12px 4px
	font-size: var(--text-xs)
	font-weight: 600
	text-transform: uppercase
	letter-spacing: 0.05em
	color: var(--text-muted)
</style>
