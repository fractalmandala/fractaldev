import { describe, expect, it } from 'vitest';
import { compile as compileSvelte } from 'svelte/compiler';
import { createAcrollsMdsvexPreprocessor, renderInvalidDocumentModule } from './index.js';

describe('createAcrollsMdsvexPreprocessor', () => {
	it('exports empty metadata when Markdown has no frontmatter', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({ content: '# Plain document', filename: 'plain.md' });

		expect(result?.code).toContain('export const metadata = {};');
		expect(result?.code).toContain('export const __acrollsDocument = {"hasFrontmatter":false,"leadingH1":"Plain document","links":[]};');
		expect(result?.code).not.toMatch(/acrolls-heading-anchor[^>]*>#/);
});

	it('preserves metadata generated from frontmatter', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: '---\ntitle: Frontmatter title\n---\n\n# Document',
			filename: 'frontmatter.md'
		});

		expect(result?.code).toContain('export const metadata = {"title":"Frontmatter title"};');
		expect(result?.code.match(/export const metadata/g)).toHaveLength(1);
	});

	it('marks authored document facts and suppresses only an initial H1', async () => {
		const processor = createAcrollsMdsvexPreprocessor({ docs: { mode: 'authored' } });
		const result = await processor.markup({
			content: '---\ntitle: Guide\n---\n\n# Guide\n\n[Missing](./missing.md)\n\n## Keep this heading',
			filename: 'guide.md'
		});

		expect(result?.code).toContain('"hasFrontmatter":true');
		expect(result?.code).toContain('"leadingH1":"Guide"');
		expect(result?.code).toContain('"links":["./missing.md"]');
		expect(result?.code).not.toMatch(/<h1[^>]*>Guide<\/h1>/);
		expect(result?.code).toContain('<h2 id="keep-this-heading">');
		expect(result?.code).toContain('>Keep this heading</h2>');
	});

	it('adds metadata to an existing module script without duplicating the script', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: '<script context="module">\n\texport const category = "guide";\n</script>\n\n# Document',
			filename: 'module.svx'
		});

		expect(result?.code).toContain('export const metadata = {};');
		expect(result?.code.match(/<script context="module">/g)).toHaveLength(1);
		expect(result?.code).toContain('export const category = "guide";');
	});

	it('does not inject a module export into an instance script', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: '<script src="./article-module.js"></script>\n\n# Document',
			filename: 'instance.svx'
		});

		expect(result?.code).toMatch(/^<script context="module">/);
		expect(result?.code).toContain('<script src="./article-module.js"></script>');
	});

	it('exports an existing metadata binding without redeclaring it', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: '<script context="module">\n\tconst metadata = { category: "guide" };\n</script>\n\n# Document',
			filename: 'local-metadata.svx'
		});

		expect(result?.code).toContain('const metadata = { category: "guide" };');
		expect(result?.code).toContain('export { metadata };');
		expect(result?.code).not.toContain('export const metadata = {};');
	});

	it('adds the named export when metadata is exported only under an alias', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: [
				'<script context="module">',
				'\tconst metadata = { category: "guide" };',
				'\texport { metadata as pageMetadata };',
				'</script>',
				'',
				'# Document'
			].join('\n'),
			filename: 'aliased-metadata.svx'
		});

		expect(result?.code).toContain('export { metadata as pageMetadata };');
		expect(result?.code).toContain('export { metadata };');
	});

	it('ignores metadata export text inside comments and strings', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: [
				'<script context="module">',
				'\t// export const metadata = { misleading: true };',
				'\texport const example = "export { metadata }";',
				'</script>',
				'',
				'# Document'
			].join('\n'),
			filename: 'metadata-text.svx'
		});

		expect(result?.code).toContain('export const metadata = {};');
	});

	it('supports Svelte 5 module scripts containing TypeScript', async () => {
		const processor = createAcrollsMdsvexPreprocessor();
		const result = await processor.markup({
			content: '<script module lang="ts">\n\tconst metadata: Record<string, string> = {};\n</script>\n\n# Document',
			filename: 'typescript-module.svx'
		});

		expect(result?.code).toContain('const metadata: Record<string, string> = {};');
		expect(result?.code).toContain('export { metadata };');
	});

	it('turns a Markdown Svelte parse error into a safe error page when requested', async () => {
		const diagnostics: Array<{ code: string; line?: number; column?: number }> = [];
		const processor = createAcrollsMdsvexPreprocessor({
			onInvalidDocument: 'error-page',
			onDiagnostic: (diagnostic) => diagnostics.push(diagnostic)
		});
		const result = await processor.markup({
			content: '<p>flowchart TD\nStart([“Start”]) —> CheckEnv{“FRACTAL_AGENTIC_ROOT set?“}</p>',
			filename: '/tmp/invalid.md'
		});

		expect(diagnostics[0]).toMatchObject({ code: 'mdsvex/compile-error' });
		expect(result?.code).toContain('<h1>Document unavailable</h1>');
		expect(result?.code).toContain('export const metadata = {};');
		expect(result?.code).toContain('/tmp/invalid.md');
		expect(() => compileSvelte(result?.code ?? '', { filename: '/tmp/invalid.md' })).not.toThrow();
	});

	it('reports and rethrows a Markdown Svelte parse error in the default fail mode', async () => {
		const diagnostics: Array<{ code: string }> = [];
		const processor = createAcrollsMdsvexPreprocessor({
			onDiagnostic: (diagnostic) => diagnostics.push(diagnostic)
		});

		await expect(
			processor.markup({
				content: '<p>flowchart TD\nStart([“Start”]) —> CheckEnv{“FRACTAL_AGENTIC_ROOT set?“}</p>',
				filename: '/tmp/invalid.md'
			})
		).rejects.toThrow('mdsvex/compile-error');
		expect(diagnostics).toContainEqual(expect.objectContaining({ code: 'mdsvex/compile-error' }));
	});

	it('does not swallow executable SVX when error-page mode is enabled', async () => {
		const processor = createAcrollsMdsvexPreprocessor({ onInvalidDocument: 'error-page' });
		await expect(
			processor.markup({
				content: '<script>const = 1;</script>\n\n# Document',
				filename: '/tmp/invalid.svx'
			})
		).rejects.toThrow('Unexpected token');
	});

	it('compiles prose containing nested object literals', async () => {
		// A nested literal used to be wrapped from the inside out, leaving the outer
		// braces for Svelte to parse. The document reported as normalized and then
		// failed the compile preflight, taking the whole build with it.
		const documents = [
			'# Config\n\nPass { a: { b: 1 } } to the helper.\n',
			'# Theme\n\nThe default is { theme: { mode: dark } } for now.\n',
			'# Deep\n\nUse { a: { b: { c: 1 } } } for nested config.\n'
		];

		for (const [index, content] of documents.entries()) {
			const processor = createAcrollsMdsvexPreprocessor();
			const result = await processor.markup({ content, filename: `nested-${index}.md` });
			expect(result?.code).toBeTruthy();
		}
	});

	it('escapes diagnostic values before placing them in a fallback module', () => {
		const code = renderInvalidDocumentModule({
			code: 'test',
			severity: 'error',
			phase: 'compile',
			file: '<bad.md>',
			message: '</pre>{evil}',
			remediation: 'Use `{code}`.'
		});

		expect(code).toContain('&lt;bad.md&gt;');
		expect(code).toContain('&#123;evil&#125;');
		expect(code).not.toContain('</pre>{evil}');
	});
});
