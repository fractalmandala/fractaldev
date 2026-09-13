import { docsJsonFeed } from 'acrolls/docs';
import { blog, raw } from '../../../lib/blog/source';

export const prerender = true;

export function GET() {
	return new Response(
		docsJsonFeed(blog, {
			feedUrl: 'https://example.com/blog/feed.json',
			language: 'en-US',
			raw,
			undated: 'include'
		}),
		{ headers: { 'content-type': 'application/feed+json; charset=utf-8' } }
	);
}
