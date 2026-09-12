import type { PageLoad } from './$types';
import { docs } from '../../lib/docs/source';

export const load: PageLoad = async () => {
	const document = docs.get('');
	const Article = document ? await document.loader() : undefined;
	return { slug: '', Article };
};
