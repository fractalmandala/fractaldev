import { readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import type { Args } from './util.js';
import { exists } from './util.js';
import { detectHost } from './integrate.js';
import { DOCS_STARTER_INDEX_MD } from './starter.js';

export type OnboardingOptions = {
	root: string;
	docsDir: string;
	baseHref: string;
	mode: 'foundation' | 'default';
	style: 'css' | 'sass';
};

export type OnboardingStep = {
	id: string;
	title: string;
	file?: string;
	action: string;
	command?: string;
	code?: string;
	caution?: string;
	verify: string;
	completed: boolean;
};

/**
 * Plan version 3: the content checkpoint's snippet comes from the shared `DOCS_STARTER_INDEX_MD`
 * constant — the same text `acrolls docs init` writes — and its action names that command.
 * Checkpoint ids, ordering, and every JSON field name are unchanged; only the `content` step's
 * `code`/`action` text changed shape, which PRODUCT.md behavior 63 requires be versioned rather
 * than silently altered.
 *
 * Plan version 2: the generated-source checkpoint emits the `content({ loader: markdownGlob() })`
 * two-glob form instead of the legacy three-glob `createDocsContentSource` snippet.
 */
export type OnboardingPlan = {
	version: 3;
	root: string;
	host: {
		kind: string;
		hasKit: boolean;
		hasSvelte: boolean;
		hasMdsvex: boolean;
		hasAcrolls: boolean;
		hasDocs: boolean;
	};
	docsDir: string;
	baseHref: string;
	mode: 'foundation' | 'default';
	style: 'css' | 'sass';
	steps: OnboardingStep[];
};

export async function buildOnboardingPlan(options: OnboardingOptions): Promise<OnboardingPlan> {
	const root = resolve(options.root);
	const detectedHost = await detectHost(root);
	const host = 'hasKit' in detectedHost
		? detectedHost
		: {
				...detectedHost,
				hasKit: false,
				hasSvelte: false,
				hasMdsvex: false,
				hasAcrolls: false,
				deps: {},
				viteConfig: null,
				svelteConfig: null,
				layout: null
			};
	const docsDir = options.docsDir.replace(/^\.?\//, '').replace(/\\/g, '/').replace(/\/$/, '') || 'docs';
	const baseHref = normalizeBaseHref(options.baseHref);
	const mode = options.mode;
	const style = options.style;
	const docsAbsolute = resolve(root, docsDir);
	const sourceDirectory = resolve(root, 'src/lib/docs');
	const globRoot = toPosix(relative(sourceDirectory, docsAbsolute));
	const contentGlob = globRoot.startsWith('.') ? globRoot : `./${globRoot}`;
	const contentPrefix = `${contentGlob.replace(/^\.\//, '')}/`;
	const configFile = host.viteConfig ?? host.svelteConfig ?? 'vite.config.ts';
	const layoutFile = host.layout ?? 'src/routes/+layout.svelte';
	const routeDirectory = baseHref === '/' ? 'src/routes' : `src/routes${baseHref}`;
	const docsLayoutFile = `${routeDirectory}/+layout.svelte`;
	const configSource = await readOptional(resolve(root, configFile));
	const layoutSource = await readOptional(resolve(root, layoutFile));
	const docsLayoutSource = await readOptional(resolve(root, docsLayoutFile));
	const hostDeps = 'deps' in host ? (host.deps as Record<string, string>) : {};
	const hasDocs = Boolean(hostDeps.acrolls);
	const nestedHref = baseHref === '/' ? '/<nested-slug>' : `${baseHref}/<nested-slug>`;

	const sourceFile = 'src/lib/docs/source.ts';
	const documentPageFile = 'src/lib/docs/DocumentPage.svelte';
	const rootRouteLoadFile = `${routeDirectory}/+page.ts`;
	const rootRouteFile = `${routeDirectory}/+page.svelte`;
	const catchAllSvelteFile = `${routeDirectory}/[...slug]/+page.svelte`;
	const catchAllLoadFile = `${routeDirectory}/[...slug]/+page.ts`;
	const sourceSource = await readOptional(resolve(root, sourceFile));
	const docsLayoutSourceForCheck = await readOptional(resolve(root, docsLayoutFile));
	const documentPageSource = await readOptional(resolve(root, documentPageFile));
	const rootRouteLoadSource = await readOptional(resolve(root, rootRouteLoadFile));
	const rootRouteSource = await readOptional(resolve(root, rootRouteFile));
	const catchAllLoadSource = await readOptional(resolve(root, catchAllLoadFile));
	const catchAllSvelteSource = await readOptional(resolve(root, catchAllSvelteFile));
	// A migrated host uses `content({ loader: markdownGlob({ body, metadata, facts, root }) })`; a host that
	// has not migrated still uses `createDocsContentSource`/`createAcrollsDocsSource` with an eager
	// `import: 'metadata'` glob. Both must be recognized as complete — `--check` must never regress
	// an un-migrated host.
	// `[(<]` so an explicitly parameterized call — `markdownGlob<DocsArticle>({ ... })` — still matches.
	const namedMetadataFactsReady =
		sourceSource.includes("import: 'metadata'") &&
		sourceSource.includes("import: '__acrollsDocument'");
	const collectionSourceReady =
		/\bcontent\s*[(<]/.test(sourceSource) &&
		/\bmarkdownGlob\s*[(<]/.test(sourceSource) &&
		sourceSource.includes('body') &&
		sourceSource.includes('eager: true') &&
		(sourceSource.includes('modules') || namedMetadataFactsReady);
	const legacySourceReady =
		(sourceSource.includes('createDocsContentSource') || sourceSource.includes('createAcrollsDocsSource')) &&
		sourceSource.includes("import: 'metadata'") &&
		sourceSource.includes('metadata') &&
		((sourceSource.includes('key:') && sourceSource.includes('load')) ||
			(sourceSource.includes('modules') && sourceSource.includes('metadata')));
	const sourceReady =
		(collectionSourceReady || legacySourceReady) &&
		sourceSource.includes('import.meta.glob') &&
		sourceSource.includes(contentGlob) &&
		(sourceSource.includes(contentPrefix) ||
			sourceSource.includes('contentRoot') ||
			sourceSource.includes('root:'));
	const docsLayoutReady =
		/(DocsShell|DocsSidebar)/.test(docsLayoutSourceForCheck) &&
		docsLayoutSourceForCheck.includes('docs.nav');
	// Two supported shapes for resolving the article body:
	//   1. load-resolved (recommended) — the route `load` awaits `document.loader()` and passes the
	//      component in, so the page prerenders with real content. The renderer takes it as a prop.
	//   2. legacy in-component `{#await document.loader()}` — still recognized, but it renders only
	//      the pending branch during prerender, so SSR/SEO/search see an empty article.
	const documentPageResolvesBody =
		documentPageSource.includes('loader') ||
		/\bArticle\b/.test(documentPageSource) ||
		catchAllLoadSource.includes('loader()');
	const documentPageReady =
		documentPageSource.includes('docs.get') &&
		documentPageResolvesBody &&
		(documentPageSource.includes('Publication') ||
			configSource.includes('PublicationLayout') ||
			configSource.includes('createAcrollsSvelteKitMdsvexPreprocessor'));
	const routesReady =
		rootRouteLoadSource.includes('loader()') &&
		rootRouteSource.includes('DocumentPage') &&
		rootRouteSource.includes('data.Article') &&
		catchAllLoadSource.includes('entries') &&
		catchAllLoadSource.includes('loader()') &&
		catchAllLoadSource.includes('docs.get') &&
		catchAllLoadSource.includes('error(404') &&
		catchAllSvelteSource.includes('DocumentPage') &&
		catchAllSvelteSource.includes('data.slug');

	const sourceCode = docsSourceSnippet({ contentGlob, baseHref });
	const docsSourceImport = relativeImport(routeDirectory, sourceFile);
	const documentPageImport = relativeImport(routeDirectory, documentPageFile);
	const nestedDocumentPageImport = relativeImport(`${routeDirectory}/[...slug]`, documentPageFile);
	const nestedDocsSourceImport = relativeImport(`${routeDirectory}/[...slug]`, sourceFile);
	const docsLayoutCode = docsLayoutSnippet({ docsSourceImport });
	const documentPageCode = documentPageSnippet();
	const rootRouteLoadCode = rootRouteLoadSnippet(docsSourceImport);
	const catchAllLoadCode = catchAllLoadSnippet(nestedDocsSourceImport);
	const catchAllSvelteCode = catchAllSvelteSnippet(nestedDocumentPageImport);

	const steps: OnboardingStep[] = [
		{
			id: 'install',
			title: 'Install the host dependencies',
			action: 'Run this from the existing SvelteKit project root. The command is read-only until you execute it.',
			command: installCommand(),
			caution:
				'Install the public acrolls package only. Its supported subpath exports provide the compiler, components, styles, docs shell, and CLI.',
			verify: 'package.json contains acrolls and the host already contains SvelteKit/Svelte.',
			completed: Boolean(host.hasAcrolls && host.hasSvelte && hasDocs)
		},
		{
			id: 'preprocessor',
			title: 'Wire the Acrolls Markdown preprocessor',
			file: configFile,
			action:
				'Open this file. Merge the import and preprocessor into the existing config; keep your adapter and kit settings.',
			code: preprocessorSnippet(),
			caution:
				'For SvelteKit 3, merge these options into sveltekit() in vite.config.ts. SvelteKit 2.62+ supports the same shape. Use createAcrollsMdsvexPreprocessor from acrolls/mdsvex. Keep .svelte in the extensions array; the preprocessor extensions option lists only .md and .svx. If the config already calls mdsvex(...), replace that call rather than adding a second Markdown preprocessor. Preserve the host adapter and other Vite plugins.',
			verify:
				'The exported SvelteKit config keeps extensions: [\'.svelte\', \'.md\', \'.svx\'] and its preprocess includes vitePreprocess() plus createAcrollsMdsvexPreprocessor() (or the acrolls/sveltekit wrapper).',
			completed:
				(configSource.includes('createAcrollsMdsvexPreprocessor') ||
					configSource.includes('createAcrollsSvelteKitMdsvexPreprocessor')) &&
				configSource.includes('preprocess') &&
				configSource.includes('.svelte') &&
				configSource.includes('.md') &&
				configSource.includes('.svx')
		},
		{
			id: 'styles',
			title: 'Add the Acrolls style preset',
			file: docsLayoutFile,
			action: `Add this style entrypoint once to the docs surface. The recommended location is ${docsLayoutFile}; choose the ${mode} preset and do not load both presets.`,
			code: `import 'acrolls/styles/${mode}.${style}';`,
			caution:
				'Load one Acrolls style preset exactly once per docs/blog surface. Sass imports belong in a layout script or another global Sass entry, not a component style block; make sure the host has sass installed. If the root layout already owns the preset, leave this line out of the docs layout instead of loading it twice.',
			verify: `The chosen acrolls/styles/${mode}.${style} import appears exactly once in the docs surface.`,
			completed:
				layoutSource.includes(`acrolls/styles/${mode}.${style}`) ||
				docsLayoutSource.includes(`acrolls/styles/${mode}.${style}`)
		},
		{
			id: 'content',
			title: 'Create the first docs content',
			file: `${docsDir}/index.md`,
			action: `Create this file (run \`acrolls docs init\` to write it), or use your existing Markdown directory instead of ${docsDir}/.`,
			code: DOCS_STARTER_INDEX_MD,
			caution:
				'Frontmatter is optional in migration mode, but title and description are recommended for navigation, page metadata, and the visible banner. Keep executable Svelte in .svx, not ordinary .md prose.',
			verify: `The file exists and opens as Markdown at ${baseHref}.`,
			completed: await exists(resolve(root, docsDir, 'index.md'))
		},
		{
			id: 'source',
			title: 'Create the generated docs source',
			file: sourceFile,
			action: `Create this file. It maps the ${docsDir}/ corpus into a serializable Acrolls page tree.`,
			code: sourceCode,
			caution:
				'The lazy body, metadata, and facts globs must use the identical pattern, and root must match that same pattern or every route key will be wrong. Keep the body glob lazy and use named eager metadata/facts imports so compiled article components and Shiki stay out of the eager graph. Filesystem folders are discovered automatically; add folders only for label/order/presentation overrides. This starter discovers .md only; .svx is intentionally explicit.',
			verify:
				'The source exports docs, the two glob patterns are identical, and root matches that pattern.',
			completed: sourceReady
		},
		{
			id: 'docs-layout',
			title: 'Add the docs shell layout',
			file: docsLayoutFile,
			action: 'Create this route layout around the docs pages.',
			code: docsLayoutCode,
			caution:
				'DocsShell owns the docs chrome. If your site already owns the outer three-column shell, use DocsSidebar instead and do not nest a second DocsShell inside the center column.',
			verify: `The docs layout renders DocsShell with docs.nav and imports acrolls/docs/styles.css.`,
			completed: docsLayoutReady
		},
		{
			id: 'document-page',
			title: 'Add the document renderer',
			file: documentPageFile,
			action: 'Create this shared page component. It keeps document loading lazy and wraps articles with Publication.',
			code: documentPageCode,
			caution:
				'Keep the Publication wrapper. It mounts code-frame and Mermaid enhancers; CSS alone does not provide those behaviors.',
			verify: 'The component resolves docs.get(slug), receives the route-resolved Article component, and renders <Publication>.',
			completed: documentPageReady
		},
		{
			id: 'routes',
			title: 'Add the docs routes',
			file: `${rootRouteLoadFile}, ${rootRouteFile}, ${catchAllLoadFile}, ${catchAllSvelteFile}`,
			action: 'Create the root page and the nested catch-all route. Copy each snippet into its named file.',
			code: `// ${rootRouteLoadFile}\n${rootRouteLoadCode}\n\n// ${rootRouteFile}\n${rootRouteSnippet(documentPageImport)}\n\n// ${catchAllLoadFile}\n${catchAllLoadCode}\n\n// ${catchAllSvelteFile}\n${catchAllSvelteCode}`,
			caution:
				'The root route handles the empty slug. The catch-all entries must exclude the empty root slug, or the same page will be generated twice.',
			verify: `Both ${baseHref} and a nested ${baseHref}/<slug> route return a page; unknown slugs return 404.`,
			completed: routesReady
		},
		{
			id: 'preflight',
			title: 'Preflight the corpus before starting the host',
			action: 'Run this from the host root and fix the report before deployment.',
			command: `pnpm exec acrolls validate ./${docsDir} --mode migration --on-invalid error-page --report ./.acrolls-report.json`,
			caution:
				'Use authored mode or --on-invalid fail for an all-or-nothing corpus. error-page is a visible Markdown fallback, not true import exclusion. Invalid .svx remains fail-fast.',
			verify: 'The summary has no unexpected rejected documents, or every rejected Markdown page is intentionally visible as a diagnostic page.',
			completed: false
		},
		{
			id: 'local-check',
			title: 'Run the local docs check',
			action: 'Start the host, then exercise the root, a nested page, refresh, and an unknown slug.',
			command: 'pnpm dev',
			caution:
				'If the browser shows a compiler avalanche, stop and inspect the first source file in the preflight report. Do not repair dozens of generated Svelte errors one by one.',
			verify: `Open ${baseHref}, ${nestedHref}, refresh both, and confirm the browser console has no runtime errors.`,
			completed: false
		},
		{
			id: 'deploy',
			title: 'Build, deploy, and verify the docs URL',
			action: 'Run the production build, deploy using the host platform, and verify the public docs route.',
			command: 'pnpm build',
			caution:
				'Acrolls does not choose your adapter or deployment provider. Keep the host adapter, environment variables, base path, and SPA/SSR routing rules under host ownership.',
			verify: `After deployment, check ${baseHref}, ${nestedHref}, direct refreshes, code highlighting, Mermaid, navigation, and a deliberate 404.`,
			completed: false
		}
	];

	return {
		version: 3,
		root,
		host: {
			kind: host.kind,
			hasKit: Boolean(host.hasKit),
			hasSvelte: Boolean(host.hasSvelte),
			hasMdsvex: Boolean(host.hasMdsvex),
			hasAcrolls: Boolean(host.hasAcrolls),
			hasDocs
		},
		docsDir,
		baseHref,
		mode,
		style,
		steps
	};
}

export function renderOnboardingPlan(plan: OnboardingPlan): string {
	const lines = onboardingHeader(plan);

	for (const [index, step] of plan.steps.entries()) {
		lines.push(...renderStepLines(plan, index, step), '');
	}

	return lines.join('\n');
}

/** Render one checkpoint for the interactive terminal walkthrough. */
export function renderOnboardingStep(plan: OnboardingPlan, index: number, step: OnboardingStep): string {
	return renderStepLines(plan, index, step).join('\n');
}

/** Render a completed checkpoint without repeating its full instructions. */
export function renderCompletedOnboardingStep(
	plan: OnboardingPlan,
	index: number,
	step: OnboardingStep
): string {
	return [`Step ${index + 1} of ${plan.steps.length}`, `[done] ${step.title}`, 'Already complete — continuing.'].join('\n');
}

function onboardingHeader(plan: OnboardingPlan): string[] {
	return [
		'Acrolls onboarding',
		'=================',
		`Host: ${plan.host.kind} at ${plan.root}`,
		`Docs: ${plan.docsDir} → ${plan.baseHref}`,
		`Style mode: ${plan.mode}`,
		'',
		'Run each step in order. This command is guidance-only; it does not edit host files.',
		'Use `pnpm exec acrolls onboard --check` to rescan completed checkpoints or `--json` for a modal/UI client.',
		''
	];
}

function renderStepLines(plan: OnboardingPlan, index: number, step: OnboardingStep): string[] {
	const lines = [`Step ${index + 1} of ${plan.steps.length}`, `[${step.completed ? 'done' : '    '}] ${step.title}`];
	if (step.file) lines.push(`FILE: ${step.file}`);
	lines.push(step.action);
	if (step.command) lines.push(`\nCOMMAND:\n  ${step.command}`);
	if (step.code) lines.push(`\nCODE:\n${indent(step.code)}`);
	if (step.caution) lines.push(`\nWATCH OUT:\n  ${step.caution}`);
	lines.push(`\nCHECK:\n  ${step.verify}`);
	return lines;
}

export async function cmdOnboard(args: Args): Promise<number> {
	const modeValue = String(args.flags.mode ?? 'default');
	if (modeValue !== 'foundation' && modeValue !== 'default') {
		console.error('Invalid --mode. Use foundation or default.');
		return 2;
	}
	const styleValue = String(args.flags.style ?? 'css');
	if (styleValue !== 'css' && styleValue !== 'sass') {
		console.error('Invalid --style. Use css or sass.');
		return 2;
	}
	const root = process.cwd();
	const plan = await buildOnboardingPlan({
		root,
		docsDir: String(args.flags['docs-dir'] ?? 'docs'),
		baseHref: String(args.flags['base-href'] ?? '/docs'),
		mode: modeValue,
		style: styleValue
	});

	if (!plan.host.hasKit) {
		console.error(`Acrolls onboarding expects an existing SvelteKit host; detected ${plan.host.kind}.`);
		console.error('Use the SvelteKit adapter first, then rerun `pnpm exec acrolls onboard`.');
		return 1;
	}

	if (args.flags.json) {
		console.log(JSON.stringify(plan, null, 2));
		return 0;
	}

	const checkOnly = Boolean(args.flags.check);
	const interactive =
		!checkOnly &&
		!args.flags['non-interactive'] &&
		(args.flags.interactive === true || (Boolean(process.stdin.isTTY) && Boolean(process.stdout.isTTY)));

	if (!interactive) {
		console.log(renderOnboardingPlan(plan));
		console.log('Non-interactive mode: complete the steps above, then rerun `pnpm exec acrolls onboard --check`.');
		return 0;
	}

	console.log(onboardingHeader(plan).join('\n'));
	console.log('Interactive mode: one checkpoint at a time. Press Enter or type "next" to move forward; type "q" to pause.');
	const readline = await import('node:readline/promises');
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	try {
		for (const [index, step] of plan.steps.entries()) {
			if (step.completed) {
				console.log(`\n${renderCompletedOnboardingStep(plan, index, step)}`);
				continue;
			}
			console.log(`\n${renderOnboardingStep(plan, index, step)}`);
			let answer = await rl.question('\nMove to next? [Enter/next] · [q] pause: ');
			while (!isNextCommand(answer)) {
				if (isQuitCommand(answer)) {
					console.log('Onboarding paused. Rerun `pnpm exec acrolls onboard --check` to resume from the remaining checkpoints.');
					return 0;
				}
				console.log('Please press Enter, type "next", or type "q" to pause.');
				answer = await rl.question('Move to next? [Enter/next] · [q] pause: ');
			}
		}
	} finally {
		rl.close();
	}

	console.log('\nOnboarding walkthrough complete. Run `pnpm exec acrolls onboard --check`, then deploy and verify the docs URL.');
	return 0;
}

function normalizedAnswer(answer: string): string {
	return answer.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isNextCommand(answer: string): boolean {
	const value = normalizedAnswer(answer);
	return value === '' || value === 'n' || value === 'next' || value === 'move to next';
}

function isQuitCommand(answer: string): boolean {
	const value = normalizedAnswer(answer);
	return value === 'q' || value === 'quit' || value === 'exit';
}

function normalizeBaseHref(value: string): string {
	const trimmed = value.trim();
	if (!trimmed || trimmed === '/') return '/';
	return `/${trimmed.replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

function installCommand(): string {
	return 'pnpm add acrolls@latest';
}

function preprocessorSnippet(): string {
	return `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { createAcrollsMdsvexPreprocessor } from 'acrolls/mdsvex';
import { defineConfig } from 'vite';

const acrolls = createAcrollsMdsvexPreprocessor({
  extensions: ['.md', '.svx'],
  // For an existing corpus only, opt in deliberately:
  // onInvalidDocument: 'error-page'
});

// Merge these options into the host's existing sveltekit() call.
export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.md', '.svx'],
      preprocess: [vitePreprocess(), acrolls]
    })
  ]
});`;
}

function docsSourceSnippet({ contentGlob, baseHref }: { contentGlob: string; baseHref: string }): string {
	return `import type { Component } from 'svelte';
import { content, markdownGlob } from 'acrolls/content';
import { defineDocsConfig, type DocsDocumentFacts, type DocsMetadata } from 'acrolls/docs/content';

type DocsArticle = Component;

const body = import.meta.glob('${contentGlob}/**/*.md', { import: 'default' }) as Record<
  string,
  () => Promise<DocsArticle>
>;
const metadata = import.meta.glob('${contentGlob}/**/*.md', {
  eager: true,
  import: 'metadata'
}) as Record<string, DocsMetadata>;
const facts = import.meta.glob('${contentGlob}/**/*.md', {
  eager: true,
  import: '__acrollsDocument'
}) as Record<string, DocsDocumentFacts>;

export const docs = content({
  loader: markdownGlob({
    body,
    metadata,
    facts,
    root: '${contentGlob}'
  }),
  config: defineDocsConfig({
    title: 'Documentation',
    baseHref: '${baseHref}',
    subtitle: 'Generated from Markdown'
  })
}).sourceSync();`;
}

function docsLayoutSnippet({
	docsSourceImport
}: {
	docsSourceImport: string;
}): string {
	return `<script lang="ts">
  import 'acrolls/docs/styles.css';
  import { page } from '$app/state';
  import { DocsShell } from 'acrolls/docs';
  import { docs } from '${docsSourceImport}';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
  // Derive the index check from the configured base href — never hardcode the route.
  const base = docs.nav.baseHref;
  const isIndex = $derived(page.url.pathname === base || page.url.pathname === \`\${base}/\`);
</script>

<DocsShell nav={docs.nav} pathname={page.url.pathname} showToc={!isIndex} showPager={!isIndex}>
  {@render children()}
</DocsShell>`;
}

function documentPageSnippet(): string {
	return `<script lang="ts">
  import type { Component } from 'svelte';
  import { docs } from './source';
  import { Publication } from 'acrolls/svelte';

  let { slug, Article }: { slug: string; Article?: Component } = $props();
  const document = $derived(docs.get(slug));
</script>

{#if document}
  <Publication>
    {#if Article}<Article />{/if}
  </Publication>
{:else}
  <p>Documentation page not found.</p>
{/if}`;
}

function rootRouteLoadSnippet(docsSourceImport: string): string {
	return `import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { docs } from '${docsSourceImport}';

export const load: PageLoad = async () => {
  const document = docs.get('');
  if (!document) error(404, 'Documentation index not found');
  const Article = await document.loader();
  return { slug: '', Article };
};`;
}

function rootRouteSnippet(documentPageImport: string): string {
	return `<script lang="ts">
  import DocumentPage from '${documentPageImport}';
  let { data } = $props();
</script>

<DocumentPage slug={data.slug} Article={data.Article} />`;
}

function catchAllLoadSnippet(docsSourceImport: string): string {
	return `import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { docs } from '${docsSourceImport}';

export const entries: EntryGenerator = () =>
  docs.documents.filter((document) => document.slug).map((document) => ({ slug: document.slug }));

export const load: PageLoad = async ({ params }) => {
  const slug = params.slug ?? '';
  const document = docs.get(slug);
  if (!document) error(404, \`Documentation page "\${slug || 'index'}" not found\`);
  const Article = await document.loader();
  return { slug, Article };
};`;
}

function catchAllSvelteSnippet(documentPageImport: string): string {
	return `<script lang="ts">
  import DocumentPage from '${documentPageImport}';
  let { data } = $props();
</script>

<DocumentPage slug={data.slug} Article={data.Article} />`;
}

async function readOptional(path: string): Promise<string> {
	try {
		return await readFile(path, 'utf8');
	} catch {
		return '';
	}
}

function indent(value: string): string {
	return value
		.split('\n')
		.map((line) => `  ${line}`)
		.join('\n');
}

function toPosix(value: string): string {
	return value.replaceAll('\\', '/');
}

function relativeImport(fromDirectory: string, target: string): string {
	const path = toPosix(relative(fromDirectory, target)).replace(/\.ts$/, '');
	return path.startsWith('.') ? path : `./${path}`;
}
