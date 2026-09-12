import { docsSitemap } from 'acrolls/docs';
import { docs } from '../../lib/docs/source';

export const prerender = true;

export function GET() {
	return new Response(docsSitemap(docs), {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
}
