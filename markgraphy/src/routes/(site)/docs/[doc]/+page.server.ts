import type { PageServerLoad } from './$types';

export const prerender = true;

export function entries() {
	const modules = import.meta.glob('../../../../docs/content/*.svx', { eager: true });
	return Object.keys(modules).map((key) => {
		const slug = key.split('/').pop()!.replace('.svx', '');
		return { doc: slug };
	});
}

export const load: PageServerLoad = async ({ params }) => {
	return { doc: params.doc };
};
