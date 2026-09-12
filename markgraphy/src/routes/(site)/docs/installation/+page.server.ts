// Build-time shiki highlighting for the installation page snippets.
import { ACCENT_CODE, LAYOUT_CODE, PAGE_CODE, SVX_CODE } from '$site/docs/install-code';
import { highlight } from '$site/lib/highlight';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [layout, page, svx, accent] = await Promise.all([
		highlight(LAYOUT_CODE, 'typescript'),
		highlight(PAGE_CODE, 'svelte'),
		highlight(SVX_CODE, 'markdown'),
		highlight(ACCENT_CODE, 'css')
	]);

	return { layout, page, svx, accent };
};
