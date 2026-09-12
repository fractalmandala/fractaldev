import remarkGfm from 'remark-gfm';
import { mdsvex } from 'mdsvex';
import { compile as compileSvelte } from 'svelte/compiler';
import { Parser } from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import rehypeSlug from 'rehype-slug';
import { createAcrollsHighlighter, type HighlightOptions } from './highlighter.js';
import { rehypeAcrollsTableWrap } from './rehype-table-wrap.js';
import { rehypeAcrollsHeadingAnchors } from './rehype-heading-anchors.js';
import { rehypeAcrollsHeadings, type AcrollsHeadingsOptions } from './rehype-headings.js';
import { remarkAcrollsMermaidGuard } from './remark-mermaid-guard.js';
import { normalizeAcrollsMarkdown } from './source-safety.js';
import {
	inspectAcrollsDocument,
	suppressInitialMarkdownH1,
	type AcrollsDocumentFacts
} from './document-facts.js';
import {
	compileDiagnostic,
	diagnosticError,
	renderInvalidDocumentModule,
	safetyFindingDiagnostic,
	type AcrollsDocumentDiagnostic,
	type AcrollsInvalidDocumentPolicy
} from './document-diagnostics.js';

export { parseFenceMeta, parseRangeList } from './code-meta.js';
export { createAcrollsHighlighter } from './highlighter.js';
export type { HighlightOptions } from './highlighter.js';
export { rehypeAcrollsTableWrap } from './rehype-table-wrap.js';
export { rehypeAcrollsHeadingAnchors } from './rehype-heading-anchors.js';
export { rehypeAcrollsHeadings } from './rehype-headings.js';
export type { AcrollsHeading, AcrollsHeadingsOptions } from './rehype-headings.js';
export { rehypeAcrollsCode } from './rehype-code.js';
export { remarkAcrollsCodeMeta } from './remark-code-meta.js';
export { remarkAcrollsMermaidGuard } from './remark-mermaid-guard.js';
export {
	normalizeAcrollsMarkdown,
	type AcrollsSafetyFinding,
	type AcrollsSafetyFindingKind,
	type AcrollsSourceSafetyResult
} from './source-safety.js';
export {
	compileDiagnostic,
	diagnosticError,
	renderInvalidDocumentModule,
	safetyFindingDiagnostic
} from './document-diagnostics.js';
export type {
	AcrollsDocumentDiagnostic,
	AcrollsDocumentMode,
	AcrollsDocumentStatus,
	AcrollsInvalidDocumentPolicy
} from './document-diagnostics.js';
export { renderAcrollsArticleHtml } from './render-html.js';
export type { RenderHtmlResult } from './render-html.js';
export { splitFrontmatter, renderBannerHtml } from './frontmatter.js';
export type { Frontmatter } from './frontmatter.js';
export { inspectAcrollsDocument, suppressInitialMarkdownH1 } from './document-facts.js';
export type { AcrollsDocumentFacts } from './document-facts.js';

export type AcrollsMdsvexOptions = HighlightOptions & {
  /** Path to Publication layout (host or package). */
	layout?: string | Record<string, string>;
	extensions?: string[];
	/** What to do when a Markdown document cannot compile. */
	onInvalidDocument?: AcrollsInvalidDocumentPolicy;
	/** Receive source and compiler diagnostics without changing the default behavior. */
	onDiagnostic?: (diagnostic: AcrollsDocumentDiagnostic) => void;
	/** Opt-in contract for a generated authored Markdown docs corpus. */
	docs?: {
		mode?: 'authored' | 'migration';
		leadingH1?: 'suppress-and-warn' | 'preserve';
	};
	/**
	 * Collect headings into `metadata.headings` for a server-rendered table of contents. On by
	 * default (h2–h4). Pass `false` to disable, or a level range to tune what is collected.
	 */
	toc?: false | AcrollsHeadingsOptions;
};

/**
 * Options object for mdsvex(...).
 * Layout should point at a Svelte component that wraps slot content in Publication.
 */
export function createAcrollsMdsvexOptions(options: AcrollsMdsvexOptions = {}) {
  const {
    strict = false,
    layout,
    extensions = ['.svx', '.md'],
    toc = {}
  } = options;

  // Collect headings right after rehype-slug assigns ids, and before the anchor pass, so the
  // ids match the in-page anchors and the collected text carries no anchor markup. The tuple form
  // hands unified the attacher plus its options — passing the built transformer would make unified
  // run it as an attacher against an undefined tree.
  const headingPlugins = toc === false ? [] : [[rehypeAcrollsHeadings, toc] as const];

  return {
    extensions,
    layout,
    remarkPlugins: [remarkGfm, remarkAcrollsMermaidGuard],
    rehypePlugins: [
      rehypeSlug,
      ...headingPlugins,
      rehypeAcrollsHeadingAnchors,
      rehypeAcrollsTableWrap
    ],
    highlight: {
      highlighter: createAcrollsHighlighter({ strict })
    }
  };
}

/**
 * Preprocessor for hosts that want source-safety normalization to run before
 * mdsvex parses Markdown. `.svx` sources remain available for intentional
 * Svelte components; only `.md` prose is normalized.
 */
export function createAcrollsMdsvexPreprocessor(options: AcrollsMdsvexOptions = {}) {
	const processor = mdsvex(createAcrollsMdsvexOptions(options) as never);
	const onInvalidDocument = options.onInvalidDocument ?? 'fail';
	return {
		name: 'acrolls-mdsvex',
		async markup(args: { content: string; filename?: string }) {
			const facts = inspectAcrollsDocument(args.content);
			const authoredDocs = options.docs?.mode === 'authored';
			const source = authoredDocs && options.docs?.leadingH1 !== 'preserve'
				? suppressInitialMarkdownH1(args.content)
				: args.content;
			const normalized = normalizeAcrollsMarkdown(source, { filename: args.filename });
			for (const finding of normalized.findings) {
				options.onDiagnostic?.(safetyFindingDiagnostic(finding, args.filename));
			}

			const handleInvalid = (error: unknown) => {
				const diagnostic = compileDiagnostic(error, args.filename);
				options.onDiagnostic?.(diagnostic);
				if (onInvalidDocument === 'error-page' && isMarkdownDocument(args.filename)) {
					return { code: renderInvalidDocumentModule(diagnostic) };
				}
				throw diagnosticError(diagnostic);
			};

			let result;
			try {
				result = await processor.markup({ ...args, content: normalized.source });
			} catch (error) {
				return handleInvalid(error);
			}
			if (!result || !isMarkdownFilename(args.filename)) return result;

			let output: typeof result;
			try {
				output = {
					...result,
					code: ensureAcrollsDocumentExport(ensureMetadataExport(result.code), facts)
				};
			} catch (error) {
				return handleInvalid(error);
			}

			try {
				compileSvelte(output.code, { filename: args.filename });
			} catch (error) {
				return handleInvalid(error);
			}
			return output;
		}
	};
}

function isMarkdownFilename(filename?: string): boolean {
	return filename?.endsWith('.md') === true || filename?.endsWith('.svx') === true;
}

function isMarkdownDocument(filename?: string): boolean {
	return filename?.endsWith('.md') === true;
}

/**
 * mdsvex omits its named `metadata` export when a document has no frontmatter.
 * Hosts commonly build navigation with an eager named-export glob, and bundlers
 * reject that glob if even one document lacks the export. Add an empty export to
 * the generated module script while leaving real or author-defined metadata alone.
 */
function ensureMetadataExport(code: string): string {
	return ensureNamedExport(code, 'metadata', '{}');
}

function ensureAcrollsDocumentExport(code: string, facts: AcrollsDocumentFacts): string {
	return ensureNamedExport(code, '__acrollsDocument', JSON.stringify(facts));
}

function ensureNamedExport(code: string, name: string, value: string): string {
	const moduleScriptPattern =
		/<script\b(?=[^>]*(?:\scontext\s*=\s*["']module["']|\smodule(?:\s|(?=>))))[^>]*>/i;
	const moduleScript = moduleScriptPattern.exec(code);

	if (!moduleScript) {
		return `<script context="module">\n\texport const ${name} = ${value};\n</script>\n\n${code}`;
	}

	const bodyStart = moduleScript.index + moduleScript[0].length;
	const bodyEnd = code.indexOf('</script>', bodyStart);
	if (bodyEnd === -1) return code;

	const moduleBody = code.slice(bodyStart, bodyEnd);
	const binding = analyzeBinding(moduleBody, name);
	if (binding.exported) return code;

	const declaration = binding.bound
		? `\n\texport { ${name} };`
		: `\n\texport const ${name} = ${value};`;

	return `${code.slice(0, bodyEnd)}${declaration}${code.slice(bodyEnd)}`;
}

type AstName = {
	type: string;
	name?: string;
	value?: unknown;
	left?: AstName;
	argument?: AstName;
	elements?: Array<AstName | null>;
	properties?: Array<{ type: string; value?: AstName; argument?: AstName }>;
};

type AstStatement = {
	type: string;
	id?: AstName | null;
	declaration?: AstStatement | null;
	declarations?: Array<{ id: AstName }>;
	specifiers?: Array<{ local?: AstName; exported?: AstName }>;
};

type AstProgram = { body: AstStatement[] };

const TypeScriptModuleParser = Parser.extend(tsPlugin());

function analyzeBinding(source: string, name: string): { bound: boolean; exported: boolean } {
	const program = TypeScriptModuleParser.parse(source, {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}) as unknown as AstProgram;

	let bound = false;
	let exported = false;

	for (const statement of program.body) {
		if (statementBindsName(statement, name)) bound = true;
		if (statementExportsName(statement, name)) exported = true;
	}

	return { bound, exported };
}

function statementBindsName(statement: AstStatement, name: string): boolean {
	if (statement.type === 'ExportNamedDeclaration' && statement.declaration) {
		return statementBindsName(statement.declaration, name);
	}

	if (statement.type === 'VariableDeclaration') {
		return statement.declarations?.some(({ id }) => patternBindsName(id, name)) === true;
	}

	if (statement.type === 'FunctionDeclaration' || statement.type === 'ClassDeclaration') {
		return statement.id?.name === name;
	}

	if (statement.type === 'ImportDeclaration') {
		return statement.specifiers?.some(({ local }) => local?.name === name) === true;
	}

	return false;
}

function statementExportsName(statement: AstStatement, name: string): boolean {
	if (statement.type !== 'ExportNamedDeclaration') return false;

	if (statement.declaration && statementBindsName(statement.declaration, name)) return true;

	return statement.specifiers?.some(({ exported }) => astName(exported) === name) === true;
}

function patternBindsName(pattern: AstName | undefined, name: string): boolean {
	if (!pattern) return false;
	if (pattern.type === 'Identifier') return pattern.name === name;
	if (pattern.type === 'AssignmentPattern') return patternBindsName(pattern.left, name);
	if (pattern.type === 'RestElement') return patternBindsName(pattern.argument, name);
	if (pattern.type === 'ArrayPattern') {
		return pattern.elements?.some((element) => patternBindsName(element ?? undefined, name)) === true;
	}
	if (pattern.type === 'ObjectPattern') {
		return pattern.properties?.some((property) =>
			property.type === 'RestElement'
				? patternBindsName(property.argument, name)
				: patternBindsName(property.value, name)
		) === true;
	}
	return false;
}

function astName(name: AstName | undefined): string | undefined {
	if (name?.type === 'Identifier') return name.name;
	return typeof name?.value === 'string' ? name.value : undefined;
}
