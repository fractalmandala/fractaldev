<script lang="ts">
	/* The nav tree, rendered. A pure function of the `nav` data the docs layout
	   loaded: one block per section, one link per page, active row marked with
	   aria-current so styling and assistive tech read the same state. */
	import { page } from '$app/state';
	import type { DocGroup } from '$site/docs';

	let { nav = [] }: { nav?: DocGroup[] } = $props();
</script>

<nav class="navtree wfull gap-lg" aria-label="Documentation">
	{#each nav as group (group.slug)}
		<div class="box gap-xs nav-section">
			<span class="nav-label text-sm text-muted">{group.label}</span>
			{#each group.items as item (item.slug)}
				<a
					class="nav-l1"
					class:is-active={page.url.pathname === item.href}
					aria-current={page.url.pathname === item.href ? 'page' : undefined}
					href={item.href}
				>
					{item.title}
				</a>
			{/each}
		</div>
	{/each}
</nav>
