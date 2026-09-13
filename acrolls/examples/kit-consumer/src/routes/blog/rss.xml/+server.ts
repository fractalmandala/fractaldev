import { docsRss } from 'acrolls/docs';
import { blog, raw } from '../../../lib/blog/source';

export const prerender = true;

export function GET() {
	return new Response(
		docsRss(blog, {
			feedUrl: 'https://example.com/blog/rss.xml',
			language: 'en-US',
			raw,
			undated: 'include'
		}),
		{ headers: { 'content-type': 'application/rss+xml; charset=utf-8' } }
	);
}
