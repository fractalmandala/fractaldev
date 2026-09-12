import type { EntryGenerator, RequestHandler } from './$types';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { read } from '$app/server';
import interRegularUrl from '@fontsource/inter/files/inter-latin-400-normal.woff?url';
import interBoldUrl from '@fontsource/inter/files/inter-latin-700-normal.woff?url';
import { acrollsOgCard, docsOgEntries, docsOgSlug } from 'acrolls/docs';
import { docs } from '../../../lib/docs/source';

export const prerender = true;

export const entries: EntryGenerator = () => docsOgEntries(docs);

type FontSpec = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' };
let fonts: FontSpec[] | undefined;
async function loadFonts(): Promise<FontSpec[]> {
	if (fonts) return fonts;
	const [regular, bold] = await Promise.all([
		read(interRegularUrl).arrayBuffer(),
		read(interBoldUrl).arrayBuffer()
	]);
	fonts = [
		{ name: 'Inter', data: regular, weight: 400, style: 'normal' },
		{ name: 'Inter', data: bold, weight: 700, style: 'normal' }
	];
	return fonts;
}

export const GET: RequestHandler = async ({ params }) => {
	const flat = (params.slug ?? '').replace(/\.png$/, '');
	const document = docs.documents.find((doc) => docsOgSlug(doc) === flat);
	const card = acrollsOgCard({
		title: document?.title ?? docs.nav.title,
		description: document?.description ?? docs.nav.subtitle,
		eyebrow: docs.nav.title
	});
	// Satori's TS type wants a ReactNode; the plain-object element form is valid at runtime.
	const svg = await satori(card as unknown as Parameters<typeof satori>[0], {
		width: 1200,
		height: 630,
		fonts: await loadFonts()
	});
	const png = new Resvg(svg).render().asPng();
	return new Response(new Uint8Array(png), {
		headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=31536000, immutable' }
	});
};
