// sitemap.xml — static XML sitemap. The docs slugs are hardcoded here (the
// docs catalog is owned by another agent); the list mirrors /llms.txt plus
// graph-frame.

import { SITE_URL } from '$site/lib/site';

const DOC_SLUGS = [
	'graph-activity',
	'graph-bars',
	'graph-bullet',
	'graph-calendar',
	'graph-cells',
	'graph-compare',
	'graph-countdown',
	'graph-diff',
	'graph-flow',
	'graph-funnel',
	'graph-gantt',
	'graph-heatmap',
	'graph-invoice',
	'graph-kpi',
	'graph-latency',
	'graph-meter',
	'graph-plot',
	'graph-quota',
	'graph-rank',
	'graph-slope',
	'graph-slo',
	'graph-spark',
	'graph-spec',
	'graph-stack',
	'graph-stat',
	'graph-table',
	'graph-timeline',
	'graph-timer',
	'graph-tree',
	'graph-uptime',
	'graph-waffle',
	'graph-waterfall',
	'graph-frame',
	'ascii-diagram',
	'diagram-editor',
	'amplifier-diagram',
	'nested-radii-diagram',
	'prompt-loop-diagram',
	'metrics-table-diagram',
	'graph-typewriter',
	'graph-workflow',
	'graph-ticker',
	'graph-scope',
	'graph-sequence',
	'graph-stream',
	'graph-flow-player',
	'graph-ganga',
	'graph-japa',
	'graph-life',
	'graph-mandel',
	'graph-mandala',
	'graph-pulse',
	'graph-spinners',
	'graph-state',
	'graph-fire',
	'graph-flame',
	'graph-rain',
	'graph-agni',
	'graph-aum',
	'graph-boot',
	'graph-cron',
	'graph-damru',
	'graph-deps',
	'graph-diya',
	'graph-hash',
	'graph-scatter',
	'graph-surya',
	'graph-terminal'
];

const PATHS = ['/', '/docs', '/docs/installation', '/docs/examples', '/docs/animations', '/docs/editor', '/docs/skill'];

export const prerender = true;

export function GET() {
	const urls = [
		...PATHS,
		...DOC_SLUGS.map((slug) => `/docs/${slug}`)
	].map((path) => `\t<url><loc>${path === '/' ? SITE_URL : new URL(path, SITE_URL).toString()}</loc></url>`);

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}
