import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types.js';
import { iconFamilies } from '$lib/data/iconfamilies.js';

export const entries: EntryGenerator = () => {
	return iconFamilies.map((f) => ({ iconfamily: f.id }));
};

export function load({ params }) {
	const family = iconFamilies.find((f) => f.id === params.iconfamily);
	if (!family) {
		error(404, `Icon family "${params.iconfamily}" not found`);
	}
	return { family };
}
