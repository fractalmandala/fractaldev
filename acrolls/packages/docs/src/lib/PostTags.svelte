<script lang="ts">
	import { tagHref, type DocsTagsOptions } from './tags.js';

	type Props = {
		/** Tag labels from post frontmatter. */
		tags?: readonly string[] | null;
		/** Blog base href, e.g. `/blog`. */
		baseHref: string;
		/** Segment under baseHref. Default `tags`. */
		tagsPath?: string;
		/** Optional accessible name for the list. */
		label?: string;
		class?: string;
	};

	let {
		tags = [],
		baseHref,
		tagsPath = 'tags',
		label = 'Tags',
		class: className = ''
	}: Props = $props();

	const options = $derived({ baseHref, tagsPath } satisfies DocsTagsOptions);
	const items = $derived((tags ?? []).map((t) => t.trim()).filter(Boolean));
</script>

{#if items.length}
	<ul class={['acrolls-post-tags', className].filter(Boolean).join(' ')} aria-label={label}>
		{#each items as tag (tag)}
			<li class="acrolls-post-tag">
				<a class="acrolls-post-tag-link" href={tagHref(tag, options)}>{tag}</a>
			</li>
		{/each}
	</ul>
{/if}
