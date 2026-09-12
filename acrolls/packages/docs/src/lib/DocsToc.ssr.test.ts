import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import DocsToc from './DocsToc.svelte';

describe('DocsToc server rendering', () => {
	it('renders provided headings into the server HTML', () => {
		const { body } = render(DocsToc, {
			props: {
				headings: [
					{ id: 'install', text: 'Install', level: 2 },
					{ id: 'usage', text: 'Usage', level: 2 }
				]
			}
		});
		expect(body).toContain('<nav');
		expect(body).toContain('href="#install"');
		expect(body).toContain('Install');
		expect(body).toContain('href="#usage"');
	});

	it('renders nothing on the server without headings or a DOM to scan', () => {
		const { body } = render(DocsToc, { props: {} });
		expect(body).not.toContain('acrolls-docs-toc__link');
	});
});
