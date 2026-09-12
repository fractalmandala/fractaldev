// robots.txt — allow everything, point at the sitemap.

import { SITE_URL } from '$site/lib/site';

export const prerender = true;

export function GET() {
	const body = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
}
