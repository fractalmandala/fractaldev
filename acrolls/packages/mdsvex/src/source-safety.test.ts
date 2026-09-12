import { describe, expect, it } from 'vitest';
import { normalizeAcrollsMarkdown } from './source-safety.js';

describe('normalizeAcrollsMarkdown', () => {
	it('wraps Svelte-shaped literals and generic types in Markdown prose', () => {
		const result = normalizeAcrollsMarkdown(
			'- Add <svelte:head> and return Result<T, String> for content/<Category>.'
		);

		expect(result.changed).toBe(true);
		expect(result.source).toContain('`<svelte:head>`');
		expect(result.source).toContain('`Result<T, String>`');
		expect(result.source).toContain('`<Category>`');
		expect(result.findings).toHaveLength(3);
	});

	it('preserves fenced and inline code', () => {
		const source = [
			'Inline `Result<T, String>` stays as written.',
			'',
			'```ts',
			'const value: Result<T, String> = getValue();',
			'```'
		].join('\n');

		const result = normalizeAcrollsMarkdown(source);

		expect(result.changed).toBe(false);
		expect(result.findings).toHaveLength(0);
		expect(result.source).toBe(source);
	});

	it('does not rewrite recovered Mermaid source before the remark guard', () => {
		const source = ['flowchart TD', '  Start{Record: string} --> End[Done]', '', 'Text'].join('\n');
		const result = normalizeAcrollsMarkdown(source);

		expect(result.changed).toBe(false);
		expect(result.findings).toHaveLength(0);
	});

	it('does not rewrite intentional components in SVX', () => {
		const source = '<Callout title="Careful">Use <svelte:head>.</Callout>';
		const result = normalizeAcrollsMarkdown(source, { filename: 'article.svx' });

		expect(result.changed).toBe(false);
		expect(result.findings).toHaveLength(0);
		expect(result.source).toBe(source);
	});

	it('wraps a nested object literal whole, not just its inner braces', () => {
		const result = normalizeAcrollsMarkdown('Pass { a: { b: 1 } } to the helper.');

		expect(result.source).toBe('Pass `{ a: { b: 1 } }` to the helper.');
		expect(result.findings).toHaveLength(1);
		expect(result.findings[0]).toMatchObject({
			kind: 'object-literal',
			text: '{ a: { b: 1 } }'
		});
	});

	it('leaves no unwrapped brace behind for Svelte to parse', () => {
		const sources = [
			'Pass { a: { b: 1 } } to it.',
			'Config { theme: { mode: dark } } wins.',
			'Use { a: { b: { c: 1 } } } for deep config.',
			'Both { a: 1 } and { b: { c: 2 } } are valid.'
		];

		for (const source of sources) {
			const { source: normalized } = normalizeAcrollsMarkdown(source);
			// Every brace that survives normalization must sit inside a code span.
			const outsideCode = normalized.split(/`[^`]*`/g).join('');
			expect(outsideCode, `unwrapped brace in: ${normalized}`).not.toMatch(/[{}]/);
		}
	});

	it('still wraps a flat object literal', () => {
		const result = normalizeAcrollsMarkdown('Pass { mode: dark } to it.');

		expect(result.source).toBe('Pass `{ mode: dark }` to it.');
		expect(result.findings).toHaveLength(1);
	});

	it('does not double-report a literal nested inside another', () => {
		const result = normalizeAcrollsMarkdown('Use { a: { b: 1 } } here.');

		expect(result.findings.filter((f) => f.kind === 'object-literal')).toHaveLength(1);
	});

	it('leaves an unbalanced brace alone rather than guessing an end', () => {
		const source = 'Open with { a: 1 and keep writing prose.';
		const result = normalizeAcrollsMarkdown(source);

		expect(result.source).toBe(source);
		expect(result.findings).toHaveLength(0);
	});

	it('does not swallow prose between two unrelated braces', () => {
		const source = `Start { a: 1 ${'x'.repeat(300)} } end.`;
		const result = normalizeAcrollsMarkdown(source);

		expect(result.source).toBe(source);
		expect(result.findings).toHaveLength(0);
	});

	it('prefers the enclosing generic over an object literal inside it', () => {
		const result = normalizeAcrollsMarkdown('Returns Record<string, { a: 1 }> today.');

		expect(result.source).toBe('Returns `Record<string, { a: 1 }>` today.');
		expect(result.findings).toHaveLength(1);
		expect(result.findings[0]).toMatchObject({ kind: 'generic-type-literal' });
	});

	it('reports source locations', () => {
		const result = normalizeAcrollsMarkdown('safe\n- Result<T, String> is literal.');

		expect(result.findings[0]).toMatchObject({ line: 2, column: 3, kind: 'generic-type-literal' });
	});
});
