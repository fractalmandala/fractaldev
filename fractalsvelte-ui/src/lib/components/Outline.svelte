<script lang="ts">
	export interface OutlineItem {
		label: string;
		href: string;
		level?: 2 | 3 | 4;
		active?: boolean;
	}

	interface Props {
		items: OutlineItem[];
		label?: string;
		class?: string;
	}

	let { items, label = 'On this page', class: className = '' }: Props = $props();
	const rootClass = $derived(`k-outline ${className}`.trim());
</script>

<nav class={rootClass} aria-label={label}>
	{#each items as item (item.href)}
		<a
			class="k-outline-item"
			href={item.href}
			data-level={item.level ?? 2}
			data-active={item.active ? 'true' : undefined}
			aria-current={item.active ? 'location' : undefined}
		>
			{item.label}
		</a>
	{/each}
</nav>

<style lang="sass">
.k-outline
	display: flex
	flex-direction: column
	gap: 2px
	padding: 8px
	border-left: 2px solid var(--border)

.k-outline-item
	display: block
	padding: 4px 10px
	font-size: var(--text-sm)
	color: var(--text-secondary)
	text-decoration: none
	border-radius: var(--radius-4)

	&:hover
		color: var(--theme-color)
		background: var(--state-hover)

	&[data-level='2']
		padding-left: 22px

	&[data-level='3']
		padding-left: 34px

	&[data-level='4']
		padding-left: 46px

	&[data-active='true']
		color: var(--theme-color)
		font-weight: 500
</style>
