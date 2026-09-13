import type { PageLoad } from './$types';
import { listTags } from 'acrolls/docs';
import { blog, blogTagOptions } from '../../../lib/blog/source';

export const load: PageLoad = async () => {
	return {
		tags: listTags(blog, blogTagOptions)
	};
};
