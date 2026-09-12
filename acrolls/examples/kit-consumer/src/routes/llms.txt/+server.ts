import { docsLlmsTxt } from 'acrolls/docs';
import { docs } from '../../lib/docs/source';

export const prerender = true;

export function GET() {
	return new Response(docsLlmsTxt(docs), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
}
