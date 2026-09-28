<script lang="ts">
	import docs from '$lib/data/docs.json' with { type: 'json' };
	import { GROUPS, GROUP_BY_SLUG } from '$lib/docs/groups.js';

	const grouped = GROUPS.map((group) => ({
		group,
		items: docs.components.filter((c) => GROUP_BY_SLUG[c.slug] === group)
	})).filter((section) => section.items.length > 0);
</script>

<header class="page-header">
	<h1 class="text-3xl bold">Documentation</h1>
	<p class="text-bs text-secondary">
		Svelte 5 components on the fractalthemer styling system. Every page pairs a live example with
		its source, a props table generated from the types, and keyboard / screen-reader notes. A
		component not documented is a component not shipped.
	</p>
</header>

<section class="box gp-lg">
{#each grouped as section (section.group)}
	<section class="box gp-md">
		<h2 class="text-xl">{section.group}</h2>
		<div class="row gp-sm wrap">
			{#each section.items as comp (comp.slug)}
				<a class="text-bs" href="/docs/{comp.slug}">{comp.name}</a>
			{/each}
		</div>
	</section>
{/each}
<section class="box gp-md">
	<h2 class="text-xl">Variant axes</h2>
	<p class="text-bs">
		Two levels of variant control, both pure token remaps from the modifiers layer
		(<em>styles/_09_modifiers.sass</em>) — no component restyling involved.
	</p>
	<div class="box">
		<p class="text-bs">Per instance — every component accepts two props</p>
		<ul>
			<li><em>shape</em> — corner geometry: <em>square</em>, <em>subtle</em>, <em>modern</em>, <em>round</em>, <em>pill</em>. Rewrites the radius ladder for that instance's subtree only.</li>
			<li><em>density</em> — airiness: <em>tight</em>, <em>normal</em>, <em>comfort</em>. Rewrites the space ladder and control heights for that instance.</li>
		</ul>
	</div>
	<div class="box">
		<p class="text-bs">Per page — set the attributes on any container</p>
		<ul>
			<li><em>data-shape</em> / <em>data-radius</em> (aliases <em>.radius-*</em>) and <em>data-density</em> (aliases <em>.density-*</em>) carry the same sets; <em>data-scale</em> (<em>compact</em> / <em>normal</em> / <em>expanded</em>) shifts font scale and is page-level only.</li>
			<li>Custom-property inheritance scopes a set to the subtree you put it on, so <em>&lt;html data-shape="pill"&gt;</em> re-shapes the whole page while a section attribute reshapes only that section. A component's own shape/density prop overrides the page set for that instance; unset always inherits.</li>
		</ul>
	</div>
</section>
</section>
