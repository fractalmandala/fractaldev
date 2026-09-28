<script lang="ts">
	import type { Component } from 'svelte';
	import * as lib from '$lib/index.js';
	import DocsPropsTable from '$lib/docs/DocsPropsTable.svelte';
	import DocsAxes from '$lib/docs/DocsAxes.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';

	let { data } = $props();

	const component = $derived(data.component);
	const meta = $derived(data.meta);
	const Comp = $derived((lib as unknown as Record<string, Component | undefined>)[component.name]);
</script>

<header class="page-header">
	<h1 class="text-3xl bold">{component.name}</h1>
	{#if meta}
		<p class="text-bs text-secondary">{meta.description}</p>
	{/if}
</header>

<div class="box gp-lg">
<!-- The exhaustive reference, first on the page: every enumerated prop
	value, live, with the literal invocation. -->
<DocsAxes name={component.name} props={component.props} comp={Comp} />

<section class="box gp-md">
	<h2 class="text-lg weight-700 text-primary">Props</h2>
	<DocsPropsTable props={component.props} />
	<CodeBlock code={component.types} lang="typescript" />
</section>

{#if meta}
	<section class="box gp-md">
		<h2 class="text-lg weight-700 text-primary">Accessibility</h2>
		<div class="box gp-md border-subtle py-bs px-bs">
			<span class="text-sm weight-700 text-primary">Keyboard</span>
			<ul class="pl-lg box gp-xs text-sm text-secondary">
				{#each meta.keyboard as note (note)}
					<li>{note}</li>
				{/each}
			</ul>
		</div>
		<div class="box gp-md border-subtle py-bs px-bs">
			<span class="text-sm weight-700 text-primary">Screen reader</span>
			<ul class="pl-lg box gp-xs text-sm text-secondary">
				{#each meta.screenReader as note (note)}
					<li>{note}</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}
</div>
