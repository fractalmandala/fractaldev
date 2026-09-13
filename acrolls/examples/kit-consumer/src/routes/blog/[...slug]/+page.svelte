<script lang="ts">
	import { DocsPageHeader, PostTags } from 'acrolls/docs';
	import { blogTagOptions } from '../../../lib/blog/source';
	let { data } = $props();
</script>

<DocsPageHeader title={data.title} description={data.description} />
{#if data.date || data.author}
	<p class="blog-meta">
		{#if data.date}<time datetime={data.date}>{data.date}</time>{/if}
		{#if data.author}<span> · {data.author}</span>{/if}
	</p>
{/if}
<PostTags tags={data.tags} baseHref={blogTagOptions.baseHref} tagsPath={blogTagOptions.tagsPath} />
{#if data.Article}
	<data.Article />
{/if}
