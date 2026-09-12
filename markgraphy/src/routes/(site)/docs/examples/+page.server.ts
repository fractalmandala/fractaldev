// Build-time shiki highlighting for the recipe usage snippets on the
// examples page.
import { recipeCopy, recipes } from '$site/docs/recipes';
import { highlight } from '$site/lib/highlight';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const usageHtml: Record<string, string> = {};
	await Promise.all(
		recipes.map(async (recipe) => {
			usageHtml[recipe.slug] = await highlight(recipeCopy(recipe));
		})
	);

	return { usageHtml };
};
