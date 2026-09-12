import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatValidationDiagnostic, validateCorpus, validationExitCode } from './validate.js';

const fixtureRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../fixtures/corpus');
const invalidSvx = resolve(fixtureRoot, 'invalid.svx');
const authoredFixtureRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../fixtures/authored');

describe('validateCorpus', () => {
	it('aggregates valid, normalized, and rejected documents', async () => {
		const result = await validateCorpus({
			root: fixtureRoot,
			mode: 'migration',
			onInvalid: 'error-page',
			strict: false
		});

		expect(result.summary).toEqual({ discovered: 3, ready: 1, normalized: 1, rejected: 1 });
		expect(result.documents.find((document) => document.file.endsWith('invalid.md'))?.diagnostics[0]).toMatchObject({
			code: 'mdsvex/compile-error',
			phase: 'compile'
		});
	});

	it('fails authored validation on safe-normalization findings', async () => {
		const result = await validateCorpus({
			root: fixtureRoot,
			mode: 'authored',
			onInvalid: 'fail',
			strict: false
		});

		expect(result.summary.rejected).toBe(3);
		expect(validationExitCode(result, 'fail', { mode: 'authored' })).toBe(1);
		expect(validationExitCode(result, 'error-page', { mode: 'authored' })).toBe(1);
		expect(validationExitCode(result, 'error-page', { mode: 'migration' })).toBe(0);
		expect(validationExitCode(result, 'error-page', { mode: 'migration', strict: true })).toBe(1);
	});

	it('reports authored frontmatter, ignored index title, and links to rejected documents together', async () => {
		const result = await validateCorpus({
			root: authoredFixtureRoot,
			mode: 'authored',
			onInvalid: 'fail',
			strict: false
		});

		expect(result.summary).toEqual({ discovered: 3, ready: 1, normalized: 0, rejected: 2 });
		expect(result.documents.find((document) => document.file.endsWith('index.md'))?.diagnostics).toContainEqual(
			expect.objectContaining({ code: 'ACROLLS_INDEX_TITLE_IGNORED', severity: 'warning' })
		);
		expect(result.documents.find((document) => document.file.endsWith('missing.md'))?.diagnostics).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ code: 'ACROLLS_FRONTMATTER_REQUIRED' }),
				expect.objectContaining({ code: 'ACROLLS_TITLE_REQUIRED' })
			])
		);
		expect(result.documents.find((document) => document.file.endsWith('valid.md'))?.diagnostics).toContainEqual(
			expect.objectContaining({ code: 'ACROLLS_LINK_TO_REJECTED_DOCUMENT' })
		);
		expect(validationExitCode(result, 'fail', { mode: 'authored' })).toBe(1);
	});

	it('does not let migration error-page mode pass a rejected executable SVX file', async () => {
		const result = await validateCorpus({
			root: fixtureRoot,
			files: [invalidSvx],
			mode: 'migration',
			onInvalid: 'error-page',
			strict: false
		});

		expect(result.summary).toEqual({ discovered: 1, ready: 0, normalized: 0, rejected: 1 });
		expect(validationExitCode(result, 'error-page', { mode: 'migration' })).toBe(1);
	});

	it('preserves zero-based compiler columns in human diagnostics', () => {
		expect(
			formatValidationDiagnostic(
				{
					code: 'mdsvex/compile-error',
					severity: 'error',
					phase: 'compile',
					file: `${fixtureRoot}/invalid.md`,
					line: 3,
					column: 0,
					message: 'Unexpected token'
				},
				fixtureRoot
			)
		).toContain('invalid.md:3:0');
	});
});
