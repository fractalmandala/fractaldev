import { docsLlmsFullTxt } from 'acrolls/docs';
import { docs, raw } from '../../lib/docs/source';

export const prerender = true;

export function GET() {
	return new Response(docsLlmsFullTxt(docs, raw), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
}
