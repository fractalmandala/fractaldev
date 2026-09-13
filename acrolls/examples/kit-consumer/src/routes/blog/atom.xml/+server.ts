import { docsAtom } from 'acrolls/docs';
import { blog, raw } from '../../../lib/blog/source';

export const prerender = true;

export function GET() {
	return new Response(
		docsAtom(blog, {
			feedUrl: 'https://example.com/blog/atom.xml',
			language: 'en-US',
			raw,
			undated: 'include'
		}),
		{ headers: { 'content-type': 'application/atom+xml; charset=utf-8' } }
	);
}
