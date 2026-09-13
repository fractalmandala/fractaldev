<script lang="ts">
	import { DocsPageHeader } from 'acrolls/docs';
	let { data } = $props();
</script>

<DocsPageHeader
	title="Tags"
	description="Every distinct tag in this blog corpus, with post counts."
/>

<ul class="blog-tag-index" aria-label="Tags">
	{#each data.tags as tag}
		<li class="blog-tag-index__item">
			<a class="acrolls-post-tag-link" href={tag.href}>
				{tag.label}
				<span class="blog-tag-index__count">{tag.count}</span>
			</a>
		</li>
	{/each}
</ul>

<p class="blog-index__feeds"><a href="/blog">← All posts</a></p>
