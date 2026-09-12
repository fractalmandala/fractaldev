import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
	buildOnboardingPlan,
	renderCompletedOnboardingStep,
	renderOnboardingPlan,
	renderOnboardingStep
} from './onboarding.js';

const exampleRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../examples/kit-consumer');

describe('Acrolls onboarding plan', () => {
	it('derives host-aware checkpoints and exact docs paths', async () => {
		const plan = await buildOnboardingPlan({
			root: exampleRoot,
			docsDir: 'src/content',
			baseHref: '/handbook',
			mode: 'foundation',
			style: 'css'
		});

		expect(plan.host.kind).toBe('sveltekit');
		expect(plan.host.hasDocs).toBe(true);
		expect(plan.baseHref).toBe('/handbook');
		expect(plan.steps.find((step) => step.id === 'routes')?.file).toContain('src/routes/handbook/');
		expect(plan.steps.find((step) => step.id === 'routes')?.code).toContain(
			"from '../../lib/docs/DocumentPage.svelte'"
		);
		expect(plan.steps.find((step) => step.id === 'docs-layout')?.code).toContain(
			"from '../../lib/docs/source'"
		);
		expect(renderOnboardingPlan(plan)).not.toContain("from '$lib/");
		expect(plan.steps.find((step) => step.id === 'preprocessor')?.file).toBe('vite.config.ts');
		expect(plan.steps.map((step) => step.id)).toEqual([
			'install',
			'preprocessor',
			'styles',
			'content',
			'source',
			'docs-layout',
			'document-page',
			'routes',
			'preflight',
			'local-check',
			'deploy'
		]);

		const source = plan.steps.find((step) => step.id === 'source');
		expect(source?.code).toContain("import { content, markdownGlob } from 'acrolls/content';");
		expect(source?.code).toContain(
			"const body = import.meta.glob('../../content/**/*.md', { import: 'default' })"
		);
		expect(source?.code).toContain(
			"import: 'metadata'"
		);
		expect(source?.code).toContain("import: '__acrollsDocument'");
		expect(source?.code).toContain('metadata,');
		expect(source?.code).toContain('facts,');
		expect(source?.code).toContain("root: '../../content'");
		expect(source?.code).toContain('.sourceSync();');
		expect(source?.code).not.toContain('createDocsContentSource');
		expect(source?.code).not.toContain('folders:');
		expect(source?.caution).toContain('identical pattern');
		expect(source?.caution).toContain('named eager metadata/facts imports');
		expect(plan.version).toBe(3);
		const preprocessor = plan.steps.find((step) => step.id === 'preprocessor');
		expect(preprocessor?.code).toContain("extensions: ['.svelte', '.md', '.svx']");
		expect(preprocessor?.code).toContain("extensions: ['.md', '.svx']");
		expect(preprocessor?.verify).toContain('vitePreprocess()');
		expect(plan.steps.find((step) => step.id === 'preprocessor')?.completed).toBe(true);
		expect(plan.steps.find((step) => step.id === 'routes')?.completed).toBe(false);

		const completePlan = await buildOnboardingPlan({
			root: exampleRoot,
			docsDir: 'src/content',
			baseHref: '/docs',
			mode: 'default',
			style: 'css'
		});
		expect(completePlan.steps.find((step) => step.id === 'source')?.completed).toBe(true);
		expect(completePlan.steps.find((step) => step.id === 'docs-layout')?.completed).toBe(true);
		expect(completePlan.steps.find((step) => step.id === 'document-page')?.completed).toBe(true);
		expect(completePlan.steps.find((step) => step.id === 'routes')?.completed).toBe(true);
	});

	it('renders cautions and deployment checks for a terminal walkthrough', async () => {
		const plan = await buildOnboardingPlan({
			root: exampleRoot,
			docsDir: 'src/content',
			baseHref: '/docs',
			mode: 'default',
			style: 'css'
		});
		const output = renderOnboardingPlan(plan);

		expect(output).toContain('WATCH OUT:');
		expect(output).toContain('pnpm add acrolls@latest');
		expect(output).toContain('pnpm exec acrolls validate');
		expect(output).toContain('Install the public acrolls package only.');
		expect(output).not.toContain('file:');
		expect(output).not.toContain('@acrolls/');
		expect(output).toContain('pnpm build');
		expect(output).toContain('sveltekit({');
		expect(output).toContain('After deployment, check /docs');
	});

	it('renders one checkpoint at a time for interactive mode', async () => {
		const plan = await buildOnboardingPlan({
			root: exampleRoot,
			docsDir: 'src/content',
			baseHref: '/docs',
			mode: 'default',
			style: 'css'
		});
		const step = plan.steps[1]!;
		const output = renderOnboardingStep(plan, 1, step);

		expect(output).toContain('Step 2 of 11');
		expect(output).toContain(step.title);
		expect(output).not.toContain('Step 3 of 11');
		expect(renderOnboardingPlan(plan)).toContain('[done] Install the host dependencies');
		const completed = plan.steps[3]!;
		expect(renderCompletedOnboardingStep(plan, 3, completed)).toContain('Step 4 of 11');
		expect(renderCompletedOnboardingStep(plan, 3, completed)).toContain('Already complete — continuing.');
	});

	it('marks the generated source complete for both the legacy three-glob and the content() host', async () => {
		const legacySource = `import type { Component } from 'svelte';
import { createAcrollsDocsSource, defineDocsConfig, type DocsDocumentFacts, type DocsMetadata } from 'acrolls/sveltekit';

type DocsArticle = Component;
const modules = import.meta.glob('../../content/**/*.md', { import: 'default' }) as Record<string, () => Promise<DocsArticle>>;
const metadata = import.meta.glob('../../content/**/*.md', { eager: true, import: 'metadata' }) as Record<string, DocsMetadata>;
const facts = import.meta.glob('../../content/**/*.md', { eager: true, import: '__acrollsDocument' }) as Record<string, DocsDocumentFacts>;

export const docs = createAcrollsDocsSource({
  modules,
  metadata,
  facts,
  contentRoot: '../../content',
  config: defineDocsConfig({ title: 'Docs', baseHref: '/docs' })
});`;

		const legacyRoot = await makeHost('acrolls-onboard-legacy-', legacySource);
		const legacyPlan = await buildOnboardingPlan({
			root: legacyRoot,
			docsDir: 'src/content',
			baseHref: '/docs',
			mode: 'default',
			style: 'css'
		});
		expect(legacyPlan.steps.find((step) => step.id === 'source')?.completed).toBe(true);

		// The emitted snippet itself must satisfy the same detection predicate.
		const migratedSource = legacyPlan.steps.find((step) => step.id === 'source')!.code!;
		expect(migratedSource).toContain('markdownGlob(');
		const migratedRoot = await makeHost('acrolls-onboard-content-', migratedSource);
		const migratedPlan = await buildOnboardingPlan({
			root: migratedRoot,
			docsDir: 'src/content',
			baseHref: '/docs',
			mode: 'default',
			style: 'css'
		});
		expect(migratedPlan.steps.find((step) => step.id === 'source')?.completed).toBe(true);
	});

	it('preserves a root base href and clean root route paths', async () => {
		const plan = await buildOnboardingPlan({
			root: exampleRoot,
			docsDir: 'src/content',
			baseHref: '/',
			mode: 'default',
			style: 'css'
		});

		expect(plan.baseHref).toBe('/');
		expect(plan.steps.find((step) => step.id === 'routes')?.file).toBe(
			'src/routes/+page.ts, src/routes/+page.svelte, src/routes/[...slug]/+page.ts, src/routes/[...slug]/+page.svelte'
		);
		expect(plan.steps.find((step) => step.id === 'deploy')?.verify).toContain('check /, /<nested-slug>');
	});
});

const temporaryRoots: string[] = [];

afterAll(async () => {
	await Promise.all(temporaryRoots.map((path) => rm(path, { recursive: true, force: true })));
});

/** Build a throwaway SvelteKit host whose only interesting file is src/lib/docs/source.ts. */
async function makeHost(prefix: string, source: string): Promise<string> {
	const root = await mkdtemp(resolve(tmpdir(), prefix));
	temporaryRoots.push(root);
	await writeFile(
		resolve(root, 'package.json'),
		JSON.stringify({
			name: 'onboard-fixture',
			type: 'module',
			devDependencies: { '@sveltejs/kit': '^2.0.0', svelte: '^5.0.0', acrolls: '^0.1.0' }
		}),
		'utf8'
	);
	await mkdir(resolve(root, 'src/lib/docs'), { recursive: true });
	await writeFile(resolve(root, 'src/lib/docs/source.ts'), source, 'utf8');
	return root;
}
