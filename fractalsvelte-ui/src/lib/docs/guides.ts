export type Guide = {
	slug: string;
	title: string;
	markdown: string;
};

const sources = import.meta.glob('/docs/guides/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

function slugFromPath(path: string) {
	return path.split('/').pop()?.replace(/\.md$/, '') ?? '';
}

export const guides: Guide[] = Object.entries(sources)
	.map(([path, markdown]) => ({
		slug: slugFromPath(path),
		title: markdown.match(/^#\s+(.+)$/m)?.[1] ?? slugFromPath(path),
		markdown
	}))
	.sort((a, b) => a.slug.localeCompare(b.slug));

export const guideBySlug = (slug: string) => guides.find((guide) => guide.slug === slug);
