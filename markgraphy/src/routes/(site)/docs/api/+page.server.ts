export const prerender = true;

import metadata from '../../../../docs/component-metadata.json';

export function load() {
	return { metadata };
}
