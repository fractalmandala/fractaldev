<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luChevronRight } from 'fractalicons/lucide';

	export interface Crumb {
		label: string;
		href?: string;
		leading?: import('svelte').Snippet;
	}

	interface Props {
		crumbs: Crumb[];
		class?: string;
	}

	let { crumbs, class: className = '' }: Props = $props();
</script>

<nav class="k-breadcrumbs {className}" aria-label="Breadcrumb">
	{#each crumbs as crumb, i (crumb.label + i)}
		{@const current = i === crumbs.length - 1}
		<span class="k-breadcrumb-item" data-current={current ? 'true' : undefined}>
			{#if crumb.leading}{@render crumb.leading()}{/if}
			{#if crumb.href && !current}
				<a href={crumb.href}>{crumb.label}</a>
			{:else}
				<span aria-current={current ? 'page' : undefined}>{crumb.label}</span>
			{/if}
		</span>
		{#if !current}
			<span class="k-breadcrumb-sep" aria-hidden="true">
				<Icon icon={luChevronRight} size={12} />
			</span>
		{/if}
	{/each}
</nav>
