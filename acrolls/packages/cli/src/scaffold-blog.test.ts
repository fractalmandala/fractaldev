import { describe, expect, it } from 'vitest';
import { blogScaffoldFiles } from './scaffold-blog.js';
import { scaffoldFiles } from './scaffold.js';

const blogOpts = {
	href: '/blog',
	title: 'Example Blog',
	site: 'https://example.com',
	contentDir: 'src/content-blog'
};

function paths(files: ReturnType<typeof blogScaffoldFiles>) {
	return files.map((f) => f.path);
}

describe('blogScaffoldFiles', () => {
	it('generates the full blog surface', () => {
		const p = paths(blogScaffoldFiles(blogOpts));
		expect(p).toEqual(
			expect.arrayContaining([
				'src/lib/blog/source.ts',
				'src/routes/blog/+layout.svelte',
				'src/routes/blog/+page.ts',
				'src/routes/blog/+page.svelte',
				'src/routes/blog/[...slug]/+page.ts',
				'src/routes/blog/[...slug]/+page.svelte',
				'src/routes/blog/tags/+page.ts',
				'src/routes/blog/tags/+page.svelte',
				'src/routes/blog/tags/[tag]/+page.ts',
				'src/routes/blog/tags/[tag]/+page.svelte',
				'src/routes/blog/rss.xml/+server.ts',
				'src/routes/blog/atom.xml/+server.ts',
				'src/routes/blog/feed.json/+server.ts',
				'src/routes/blog/[...slug].md/+server.ts'
			])
		);
	});

	it('honors a custom blog href for routes and links', () => {
		const files = blogScaffoldFiles({ ...blogOpts, href: '/writing' });
		const p = paths(files);
		expect(p).toContain('src/routes/writing/+page.ts');
		expect(p).toContain('src/routes/writing/tags/[tag]/+page.svelte');
		const index = files.find((f) => f.path === 'src/routes/writing/+page.svelte')!.contents;
		expect(index).toContain('/writing/tags');
		expect(index).toContain('/writing/rss.xml');
	});

	it('writes starter posts under the content dir, and globs them relative to source.ts', () => {
		const files = blogScaffoldFiles(blogOpts);
		const p = paths(files);
		expect(p).toContain('src/content-blog/2025-01-01-welcome.md');
		expect(p).toContain('src/content-blog/2025-02-14-feeds-and-tags.md');
		// `src/lib/blog/source.ts` → `src/content-blog` is `../../content-blog`.
		const source = files.find((f) => f.path === 'src/lib/blog/source.ts')!.contents;
		expect(source).toContain("'../../content-blog/**/*.md'");
		expect(source).toContain("root: '../../content-blog'");
		expect(source).toContain('acrollsFields.post');
		expect(source).toContain('naming: dated()');
	});

	it('uses the product blog API instead of bespoke markup', () => {
		const files = blogScaffoldFiles(blogOpts);
		const byPath = Object.fromEntries(files.map((f) => [f.path, f.contents]));
		expect(byPath['src/routes/blog/+page.ts']).toContain('listPosts');
		expect(byPath['src/routes/blog/tags/+page.ts']).toContain('listTags');
		expect(byPath['src/routes/blog/tags/[tag]/+page.ts']).toContain('postsForTag');
		expect(byPath['src/routes/blog/tags/[tag]/+page.ts']).toContain('resolveTag');
		expect(byPath['src/routes/blog/rss.xml/+server.ts']).toContain('docsRss');
		expect(byPath['src/routes/blog/atom.xml/+server.ts']).toContain('docsAtom');
		expect(byPath['src/routes/blog/feed.json/+server.ts']).toContain('docsJsonFeed');
		expect(byPath['src/routes/blog/+page.svelte']).toContain('PostTags');
	});

	it('resolves relative imports at the correct depth for every route file', () => {
		const files = blogScaffoldFiles(blogOpts);
		const depth: Record<string, string> = {
			'src/routes/blog/+page.ts': "'../../lib/blog/source'",
			'src/routes/blog/[...slug]/+page.ts': "'../../../lib/blog/source'",
			'src/routes/blog/tags/+page.ts': "'../../../lib/blog/source'",
			'src/routes/blog/tags/[tag]/+page.ts': "'../../../../lib/blog/source'",
			'src/routes/blog/rss.xml/+server.ts': "'../../../lib/blog/source'",
			'src/routes/blog/[...slug].md/+server.ts': "'../../../lib/blog/source'"
		};
		for (const [file, specifier] of Object.entries(depth)) {
			const contents = files.find((f) => f.path === file)!.contents;
			expect(contents, file).toContain(specifier);
		}
	});

	it('omits feedUrl when no site origin is configured, and includes it when set', () => {
		const withSite = blogScaffoldFiles(blogOpts).find(
			(f) => f.path === 'src/routes/blog/rss.xml/+server.ts'
		)!.contents;
		expect(withSite).toContain("feedUrl: 'https://example.com/blog/rss.xml'");

		const noSite = blogScaffoldFiles({ ...blogOpts, site: undefined }).find(
			(f) => f.path === 'src/routes/blog/rss.xml/+server.ts'
		)!.contents;
		expect(noSite).toContain("feedUrl: '/blog/rss.xml'");
	});
});

describe('scaffoldFiles with blog enabled', () => {
	const base = {
		name: 'demo',
		title: 'Demo',
		baseHref: '/docs',
		mode: 'default' as const,
		packageManager: 'pnpm' as const,
		acrollsVersion: '0.9.0'
	};

	it('appends the blog surface only when requested', () => {
		const without = scaffoldFiles(base).map((f) => f.path);
		expect(without.some((p) => p.startsWith('src/routes/blog/'))).toBe(false);

		const withBlog = scaffoldFiles({ ...base, blog: true }).map((f) => f.path);
		expect(withBlog).toContain('src/routes/blog/+page.ts');
		expect(withBlog).toContain('src/routes/blog/tags/[tag]/+page.ts');
	});

	it('emits pnpm build-script approval for pnpm hosts only', () => {
		const pnpmFiles = scaffoldFiles({ ...base, packageManager: 'pnpm' }).map((f) => f.path);
		expect(pnpmFiles).toContain('pnpm-workspace.yaml');
		const npmFiles = scaffoldFiles({ ...base, packageManager: 'npm' }).map((f) => f.path);
		expect(npmFiles).not.toContain('pnpm-workspace.yaml');
	});

	it('respects a custom blog href', () => {
		const pathsOut = scaffoldFiles({ ...base, blog: true, blogHref: '/posts' }).map((f) => f.path);
		expect(pathsOut).toContain('src/routes/posts/+page.svelte');
	});
});
