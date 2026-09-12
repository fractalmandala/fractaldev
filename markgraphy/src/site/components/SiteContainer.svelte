<script lang="ts">
	import type { Snippet } from 'svelte';
	import SiteCorners from './SiteCorners.svelte';
	import SiteRule from './SiteRule.svelte';
	import type { Corner } from './SiteCorners.svelte';

	let {
		borderTop = true,
		corners,
		children
	}: {
		borderTop?: boolean;
		corners?: Corner[];
		children: Snippet;
	} = $props();

	const marks = $derived(corners ?? (borderTop ? (['tl', 'tr'] as Corner[]) : []));
</script>

<div class="container">
	{#if borderTop}
		<SiteRule placement="top" />
	{/if}
	<div class="inner">
		<SiteRule orientation="y" placement="left" />
		<SiteRule orientation="y" placement="right" />
		<SiteCorners corners={marks} />
		<div class="content">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.container {
		position: relative;
	}

	.inner {
		position: relative;
		isolation: isolate;
		width: 100%;
		max-width: var(--site-max);
		margin-inline: auto;
		padding-inline: 1rem;
	}

	@media (min-width: 640px) {
		.inner {
			padding-inline: 1.5rem;
		}
	}

	@media (min-width: 1024px) {
		.inner {
			padding-inline: 2rem;
		}
	}

	.content {
		padding-block: 3rem;
	}

	@media (min-width: 640px) {
		.content {
			padding-block: 4rem;
		}
	}
</style>
