import { describe, expect, it } from 'vitest';
import { content } from './collection.js';
import type { ContentLoader, LoadedDocument } from './collection.js';
import { defineDocsConfig } from './content.js';
import { acrollsFields } from './fields.js';
import { listTags, postsForTag, resolveTag, tagHref, tagSlug, tagsOfPost } from './tags.js';

type Doc = string;
function loaderOf(documents: readonly LoadedDocument<Doc>[]): ContentLoader<Doc> {
	return { eager: true, list: () => [...documents] };
}

const blogConfig = defineDocsConfig({
	title: 'Blog',
	baseHref: '/blog',
	site: 'https://example.com'
});

const tagOpts = { baseHref: '/blog', undated: 'include' as const };

describe('tagSlug / tagHref / tagsOfPost', () => {
	it('slugifies labels and builds hrefs under baseHref/tags', () => {
		expect(tagSlug('Fractal Styler 2')).toBe('fractal-styler-2');
		expect(tagHref('essay', { baseHref: '/blog' })).toBe('/blog/tags/essay');
		expect(tagHref('essay', { baseHref: '/blog', tagsPath: 'topics' })).toBe('/blog/topics/essay');
	});

	it('reads tags from document metadata', () => {
		expect(tagsOfPost({ tags: ['a', 'b'] })).toEqual(['a', 'b']);
		expect(tagsOfPost({ tags: 'solo' })).toEqual(['solo']);
		expect(tagsOfPost({})).toEqual([]);
	});
});

describe('listTags / postsForTag / resolveTag', () => {
	async function source() {
		const loader = loaderOf([
			{
				key: 'a.md',
				data: { title: 'A', tags: ['Essay', 'AI'] },
				load: async () => 'a'
			},
			{
				key: 'b.md',
				data: { title: 'B', tags: ['ai', 'joke'] },
				load: async () => 'b'
			},
			{
				key: 'c.md',
				data: { title: 'C', tags: ['Essay'] },
				load: async () => 'c'
			},
			{
				key: 'd.md',
				data: { title: 'D' },
				load: async () => 'd'
			}
		]);
		return content({ loader, config: blogConfig, schema: acrollsFields.page }).source();
	}

	it('lists distinct tags with counts; collapses case via slug', async () => {
		const s = await source();
		const tags = listTags(s, tagOpts);
		const bySlug = Object.fromEntries(tags.map((t) => [t.slug, t]));
		expect(bySlug['essay']?.count).toBe(2);
		expect(bySlug['essay']?.label).toBe('Essay'); // first-seen
		expect(bySlug['ai']?.count).toBe(2);
		expect(bySlug['ai']?.label).toBe('AI');
		expect(bySlug['joke']?.count).toBe(1);
		expect(bySlug['essay']?.href).toBe('/blog/tags/essay');
		expect(tags.map((t) => t.slug).sort()).toEqual(['ai', 'essay', 'joke']);
	});

	it('postsForTag returns membership by slug', async () => {
		const s = await source();
		expect(postsForTag(s, 'essay', tagOpts).map((p) => p.document.title)).toEqual(['A', 'C']);
		expect(postsForTag(s, 'AI', tagOpts).map((p) => p.document.title)).toEqual(['A', 'B']);
		expect(postsForTag(s, 'missing', tagOpts)).toEqual([]);
	});

	it('resolveTag accepts slug or label', async () => {
		const s = await source();
		expect(resolveTag(s, 'essay', tagOpts)?.label).toBe('Essay');
		expect(resolveTag(s, 'Essay', tagOpts)?.slug).toBe('essay');
		expect(resolveTag(s, 'nope', tagOpts)).toBeUndefined();
	});
});
