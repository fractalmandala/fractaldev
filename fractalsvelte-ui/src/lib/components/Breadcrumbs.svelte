<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luChevronRight } from 'fractalicons/lucide';
	import type { Snippet } from 'svelte';

	export interface Crumb {
		label: string;
		href?: string;
		leading?: Snippet;
	}

	interface Props {
		crumbs: Crumb[];
		class?: string;
		[key: string]: unknown;
	}

	let { crumbs, class: className = '', ...rest }: Props = $props();

	const rootClass = $derived(`k-breadcrumbs ${className}`.trim());
</script>

<nav class={rootClass} aria-label="Breadcrumb" {...rest}>
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

<style lang="sass">

.k-breadcrumbs
	display: flex
	align-items: center
	flex-wrap: wrap
	gap: 4px
	font-family: inherit
	font-size: var(--text-sm)

.k-breadcrumb-item
	display: inline-flex
	align-items: center
	gap: 4px

	a
		color: var(--text-secondary)
		text-decoration: none
		transition: color var(--motionin1)

		&:hover
			color: var(--theme-color)

	&[data-current='true']
		color: var(--text-primary)
		font-weight: 500

.k-breadcrumb-sep
	display: inline-flex
	align-items: center
	color: var(--text-muted)
</style>
