<script lang="ts">
	import { DocsPageHeader, PostTags } from 'acrolls/docs';
	import { blogTagOptions } from '../../../../lib/blog/source';
	let { data } = $props();
</script>

<DocsPageHeader
	title={`Tag: ${data.tag.label}`}
	description={`${data.tag.count} post${data.tag.count === 1 ? '' : 's'} tagged “${data.tag.label}”.`}
/>

<ul class="blog-index">
	{#each data.posts as post}
		<li class="blog-index__item">
			<a class="blog-index__link" href={post.href}>
				<span class="blog-index__title">{post.title}</span>
				{#if post.description}
					<span class="blog-index__desc">{post.description}</span>
				{/if}
			</a>
			<PostTags tags={post.tags} baseHref={blogTagOptions.baseHref} tagsPath={blogTagOptions.tagsPath} />
		</li>
	{/each}
</ul>

<p class="blog-index__feeds">
	<a href="/blog/tags">All tags</a>
	·
	<a href="/blog">All posts</a>
</p>
