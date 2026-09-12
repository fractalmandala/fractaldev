---
title: Dynamic Routed Docs
---

> The minimal recipe: one flat folder of markdown, one dynamic slug, a nav you
> write by hand. For sections, ordering and an auto-grouped sidebar, use
> [Sectioned Docs Collection](./sectioned-docs-collection.md) instead.

Inside the `[doc]` slug (or `[post]` etc.) need `+page.ts` and `+page.svelte` files.

## For page ts

```ts
export async function load({ params }: { params: { doc: string } }) {
	const post = await import(`../${params.doc}.md`);
	const { title, tags, description } = post.metadata;
	const content = post.default;

	return {
		content,
		title,
		tags,
		description
	};
}
```

## For page svelte

```svelte
<script lang="ts">

	let { data } = $props()

</script>

<div>
	<h1>{data.title}</h1>
	<p>{data.description}</p>
	<div class="row">
		{#each data.tags as tag (tag)}
			<span>{tag}</span>
		{/each}
	</div>
	<data.content/>
</div>
```