import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { versionsConfig } from '../../lib/versions/source';

export const load: PageLoad = async () => {
	redirect(308, `${versionsConfig.baseHref}/${versionsConfig.defaultVersion}`);
};
