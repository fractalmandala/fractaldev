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
	const rootClass = $derived(`k-topnav ${className}`.trim());
</script>

<nav class={rootClass} aria-label={label}>
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
			<span class="k-topnav-item" data-state={item.active ? 'active' : undefined}>{item.label}</span>
		{/if}
	{/each}
	{#if children}
		<span class="grow"></span>
		<div class="row ycenter gap-2xs">{@render children?.()}</div>
	{/if}
</nav>

<style lang="sass">
.k-topnav
	display: flex
	align-items: center
	gap: 4px
	padding: 8px 16px
	background: var(--bg-surface)
	border: 1px solid var(--border)
	border-radius: var(--radius-12)

.k-topnav-item
	display: inline-flex
	align-items: center
	gap: 6px
	padding: 7px 12px
	font-size: var(--text-md)
	font-weight: 500
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
		color: var(--theme-color-alt)

	&[data-state='open']
		background: var(--state-hover)
		color: var(--text-primary)

.grow
	flex-grow: 1

.row
	display: flex
	flex-direction: row

	&.ycenter
		align-items: center

	&.gap-2xs
		gap: var(--space-2xs)
</style>
