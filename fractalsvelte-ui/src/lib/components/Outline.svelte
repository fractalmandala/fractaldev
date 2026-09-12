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
</script>

<nav class="k-outline {className}" aria-label={label}>
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
