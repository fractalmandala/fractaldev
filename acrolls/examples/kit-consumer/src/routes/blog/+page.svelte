<script lang="ts">
	import { DocsPageHeader, PostTags } from 'acrolls/docs';
	import { blogTagOptions } from '../../lib/blog/source';
	let { data } = $props();
</script>

<DocsPageHeader
	title="Sample blog"
	description="User-supplied Markdown corpus — wired through Acrolls with no content edits."
/>

<p class="blog-index__feeds">
	<a href="/blog/tags">Browse tags</a>
	·
	Feeds:
	<a href="/blog/rss.xml">RSS</a>
	·
	<a href="/blog/atom.xml">Atom</a>
	·
	<a href="/blog/feed.json">JSON Feed</a>
</p>

<ul class="blog-index">
	{#each data.posts as post}
		<li class="blog-index__item">
			<a class="blog-index__link" href={post.href}>
				{#if post.date}<span class="blog-index__date">{post.date}</span>{/if}
				<span class="blog-index__title">{post.title}</span>
				{#if post.description}
					<span class="blog-index__desc">{post.description}</span>
				{/if}
			</a>
			<PostTags tags={post.tags} baseHref={blogTagOptions.baseHref} tagsPath={blogTagOptions.tagsPath} />
		</li>
	{/each}
</ul>
