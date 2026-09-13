import { describe, expect, it } from 'vitest';
import { content } from './collection.js';
import type { ContentLoader, LoadedDocument } from './collection.js';
import { defineDocsConfig } from './content.js';
import { acrollsFields } from './fields.js';
import { docsAtom, docsJsonFeed, docsRss, isPost, listPosts, postDateOf } from './feeds.js';

type Doc = string;

function loaderOf(documents: readonly LoadedDocument<Doc>[]): ContentLoader<Doc> {
	return { eager: true, list: () => [...documents] };
}

const config = defineDocsConfig({
	title: 'Acrolls Blog',
	baseHref: '/blog',
	site: 'https://example.com',
	subtitle: 'Notes from the lab'
});

describe('postDateOf / isPost / listPosts', () => {
	it('prefers frontmatter date over filename prefix', async () => {
		const loader = loaderOf([
			{
				key: '2024-01-01-old-name.md',
				data: { title: 'Override', date: '2025-06-15', tags: ['ship'] },
				load: async () => 'body'
			}
		]);
		const source = await content({ loader, config, schema: acrollsFields.post }).source();
		const doc = source.documents[0];
		expect(postDateOf(doc)).toBe('2025-06-15');
		expect(isPost(doc)).toBe(true);
	});

	it('falls back to YYYY-MM-DD filename prefix', async () => {
		const loader = loaderOf([
			{
				key: '2025-03-10-hello.md',
				data: { title: 'Hello' },
				load: async () => 'body'
			}
		]);
		const source = await content({ loader, config, schema: acrollsFields.page }).source();
		expect(postDateOf(source.documents[0])).toBe('2025-03-10');
	});

	it('skips undated docs pages, drafts, and hidden posts; sorts newest first', async () => {
		const loader = loaderOf([
			{ key: 'guide.md', data: { title: 'Guide' }, load: async () => 'g' },
			{
				key: '2025-01-01-a.md',
				data: { title: 'A', date: '2025-01-01', author: 'Ada' },
				load: async () => 'a'
			},
			{
				key: '2025-02-01-b.md',
				data: { title: 'B', date: '2025-02-01', draft: true },
				load: async () => 'b'
			},
			{
				key: '2024-12-01-c.md',
				data: { title: 'C', date: '2024-12-01', hidden: true },
				load: async () => 'c'
			},
			{
				key: '2025-03-01-d.md',
				data: { title: 'D', date: '2025-03-01', tags: ['release', 'v1'] },
				load: async () => 'd'
			}
		]);
		const source = await content({ loader, config, schema: acrollsFields.page }).source();
		const posts = listPosts(source);
		expect(posts.map((p) => p.document.title)).toEqual(['D', 'A']);
		expect(posts[0].tags).toEqual(['release', 'v1']);
		expect(posts[1].author).toBe('Ada');
		expect(posts[0].url).toBe('https://example.com/blog/2025-03-01-d');
	});
});

describe('docsRss / docsAtom / docsJsonFeed', () => {
	async function blogSource() {
		const loader = loaderOf([
			{
				key: '2025-04-01-first.md',
				data: {
					title: 'First post',
					date: '2025-04-01',
					description: 'Opening notes',
					author: 'Ada',
					tags: ['intro']
				},
				load: async () => 'first'
			},
			{
				key: '2025-05-01-second.md',
				data: {
					title: 'Second post',
					date: '2025-05-01',
					description: 'Follow-up',
					author: 'Ada'
				},
				load: async () => 'second'
			}
		]);
		return content({ loader, config, schema: acrollsFields.post }).source();
	}

	const raw = {
		'2025-04-01-first.md': '# First\n\nHello world.',
		'2025-05-01-second.md': '# Second\n\nMore text.'
	};

	it('emits RSS 2.0 with items newest first', async () => {
		const source = await blogSource();
		const xml = docsRss(source, {
			feedUrl: 'https://example.com/blog/rss.xml',
			language: 'en-US',
			raw
		});
		expect(xml).toContain('<rss version="2.0"');
		expect(xml).toContain('<title>Acrolls Blog</title>');
		expect(xml).toContain('<title>Second post</title>');
		expect(xml).toContain('<title>First post</title>');
		expect(xml.indexOf('Second post')).toBeLessThan(xml.indexOf('First post'));
		expect(xml).toContain('<![CDATA[# Second');
		expect(xml).toContain('application/rss+xml');
	});

	it('emits Atom 1.0', async () => {
		const source = await blogSource();
		const xml = docsAtom(source, {
			feedUrl: 'https://example.com/blog/atom.xml',
			language: 'en-US'
		});
		expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
		expect(xml).toContain('xml:lang="en-US"');
		expect(xml).toContain('<entry>');
		expect(xml).toContain('<id>https://example.com/blog/2025-05-01-second</id>');
	});

	it('emits JSON Feed 1.1', async () => {
		const source = await blogSource();
		const json = JSON.parse(
			docsJsonFeed(source, {
				feedUrl: 'https://example.com/blog/feed.json',
				language: 'en-US',
				raw
			})
		);
		expect(json.version).toBe('https://jsonfeed.org/version/1.1');
		expect(json.title).toBe('Acrolls Blog');
		expect(json.feed_url).toBe('https://example.com/blog/feed.json');
		expect(json.items).toHaveLength(2);
		expect(json.items[0].title).toBe('Second post');
		expect(json.items[0].content_text).toContain('More text');
		expect(json.items[1].tags).toEqual(['intro']);
	});

	it('respects limit', async () => {
		const source = await blogSource();
		const json = JSON.parse(docsJsonFeed(source, { limit: 1 }));
		expect(json.items).toHaveLength(1);
		expect(json.items[0].title).toBe('Second post');
	});
});

describe('listPosts undated include', () => {
	it('includes documents without a date when requested', async () => {
		const loader = loaderOf([
			{ key: 'jokes/hi.md', data: { title: 'Hi', tags: ['joke'] }, load: async () => 'h' },
			{ key: 'essays/a.md', data: { title: 'Essay' }, load: async () => 'e' }
		]);
		const source = await content({
			loader,
			config: defineDocsConfig({ title: 'Blog', baseHref: '/blog', site: 'https://example.com' }),
			schema: acrollsFields.page
		}).source();
		expect(listPosts(source)).toHaveLength(0);
		const included = listPosts(source, { undated: 'include' });
		expect(included).toHaveLength(2);
		expect(included.every((p) => p.date === '1970-01-01')).toBe(true);
	});
});
