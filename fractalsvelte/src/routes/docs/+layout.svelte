<script lang="ts">
	import docs from '$lib/data/docs.json' with { type: 'json' };
	import { GROUPS, GROUP_BY_SLUG } from '$lib/docs/groups.js';
	import { page } from '$app/state';

	let { children } = $props();

	const grouped = $derived(
		GROUPS.map((group) => ({
			group,
			items: docs.components.filter((c) => GROUP_BY_SLUG[c.slug] === group)
		})).filter((section) => section.items.length > 0)
	);

	function isActive(slug: string) {
		return page.url.pathname === `/docs/${slug}`;
	}
</script>

<svelte:head>
	<title>fractalsvelte — docs</title>
</svelte:head>

<aside class="sidebar-left py-xl">
	<nav class="inside-bar box gp-lg" aria-label="Component documentation">
		<a
			class="sidebar-link"
			href="/docs"
			aria-current={page.url.pathname === '/docs' ? 'page' : undefined}
		>
			Overview
		</a>
		{#each grouped as section (section.group)}
			<div class="nav-section box gp-sm">
			<span class="text-md weight-500">{section.group}</span>
			<div class="nav-subsection box">
				{#each section.items as comp (comp.slug)}
					<a
						class="text-md nav-sublink"
						href="/docs/{comp.slug}"
						aria-current={isActive(comp.slug) ? 'page' : undefined}
					>
						{comp.name}
					</a>
				{/each}
			</div>
			</div>
		{/each}
	</nav>
</aside>

<div class="main-section py-xl">
	<div class="content-section narrow-half">
		{@render children()}
	</div>
</div>
