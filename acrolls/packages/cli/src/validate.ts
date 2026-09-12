import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import { compile } from 'mdsvex';
import { compile as compileSvelte } from 'svelte/compiler';
import {
	compileDiagnostic,
	createAcrollsMdsvexOptions,
	normalizeAcrollsMarkdown,
	inspectAcrollsDocument,
	renderAcrollsArticleHtml,
	safetyFindingDiagnostic,
	type AcrollsDocumentDiagnostic,
	type AcrollsDocumentMode,
	type AcrollsDocumentStatus,
	type AcrollsInvalidDocumentPolicy
} from '@acrolls/mdsvex';

export type CorpusValidationOptions = {
	root: string;
	files?: string[];
	mode: AcrollsDocumentMode;
	onInvalid: AcrollsInvalidDocumentPolicy;
	strict: boolean;
	report?: string;
};

export type DocumentValidationResult = {
	file: string;
	status: AcrollsDocumentStatus;
	diagnostics: AcrollsDocumentDiagnostic[];
};

export type CorpusValidationResult = {
	root: string;
	documents: DocumentValidationResult[];
	summary: {
		discovered: number;
		ready: number;
		normalized: number;
		rejected: number;
	};
};

type ValidatedDocument = DocumentValidationResult & {
	links: readonly string[];
};

export async function validateCorpus(options: CorpusValidationOptions): Promise<CorpusValidationResult> {
	const root = resolve(options.root);
	const files = options.files?.map((file) => resolve(file)) ?? (await discoverMarkdownFiles(root));
	const detailedDocuments: ValidatedDocument[] = [];

	for (const file of files) {
		detailedDocuments.push(await validateDocument(file, root, options));
	}
	if (options.mode === 'authored') addRejectedDocumentLinkDiagnostics(detailedDocuments, root);
	for (const document of detailedDocuments) {
		document.status = documentStatus(document.diagnostics, document.status);
	}
	const documents: DocumentValidationResult[] = detailedDocuments.map(({ links: _links, ...document }) => document);

	const summary = {
		discovered: documents.length,
		ready: documents.filter((document) => document.status === 'ready').length,
		normalized: documents.filter((document) => document.status === 'normalized').length,
		rejected: documents.filter((document) => document.status === 'rejected').length
	};
	const result = { root, documents, summary };
	if (options.report) {
		await writeFile(resolve(options.report), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
	}
	return result;
}

export function validationExitCode(
	result: CorpusValidationResult,
	onInvalid: AcrollsInvalidDocumentPolicy,
	options: { mode?: AcrollsDocumentMode; strict?: boolean } = {}
): number {
	const rejectedDocuments = result.documents.filter((document) => document.status === 'rejected');
	const hasUnfallbackableRejectedDocument = rejectedDocuments.some(
		(document) => !document.file.toLowerCase().endsWith('.md')
	);
	return rejectedDocuments.length > 0 &&
		(onInvalid === 'fail' || options.mode === 'authored' || options.strict === true || hasUnfallbackableRejectedDocument)
		? 1
		: 0;
}

export function formatValidationDiagnostic(
	diagnostic: AcrollsDocumentDiagnostic,
	root: string
): string {
	const file = diagnostic.file ? relative(root, diagnostic.file) : '<document>';
	const location = diagnostic.line !== undefined
		? `:${diagnostic.line}${diagnostic.column !== undefined ? `:${diagnostic.column}` : ''}`
		: '';
	return `${diagnostic.severity.toUpperCase()} ${file}${location} [${diagnostic.code}] ${diagnostic.message}${
		diagnostic.remediation ? ` — ${diagnostic.remediation}` : ''
	}`;
}

async function validateDocument(
	file: string,
	root: string,
	options: CorpusValidationOptions
): Promise<ValidatedDocument> {
	const source = await readFile(file, 'utf8');
	const facts = inspectAcrollsDocument(source);
	const normalized = normalizeAcrollsMarkdown(source, { filename: file });
	const diagnostics = normalized.findings.map((finding) => {
		const diagnostic = safetyFindingDiagnostic(finding, file);
		return options.strict || options.mode === 'authored'
			? { ...diagnostic, severity: 'error' as const }
			: diagnostic;
	});

	let metadata: Record<string, unknown> = {};
	try {
		const result = await compile(normalized.source, {
			filename: file,
			...createAcrollsMdsvexOptions({
				strict: options.strict || options.mode === 'authored',
				extensions: ['.svx', '.md']
			})
		} as never);
		if (!result?.code) {
			throw new Error('mdsvex returned an empty compile result');
		}
		metadata = compiledMetadata(result.code);
		try {
			compileSvelte(result.code, { filename: file });
		} catch (error) {
			diagnostics.push(compileDiagnostic(error, file));
		}
		try {
			await renderAcrollsArticleHtml(normalized.source, {
				strict: options.strict || options.mode === 'authored'
			});
		} catch (error) {
			diagnostics.push({ ...compileDiagnostic(error, file), phase: 'render' });
		}
	} catch (error) {
		diagnostics.push(compileDiagnostic(error, file));
	}
	if (options.mode === 'authored') {
		diagnostics.push(...authoredFrontmatterDiagnostics(file, root, facts, metadata));
	}

	return {
		file,
		status: documentStatus(diagnostics, normalized.findings.length > 0 ? 'normalized' : 'ready'),
		diagnostics,
		links: facts.links
	};
}

function authoredFrontmatterDiagnostics(
	file: string,
	root: string,
	facts: ReturnType<typeof inspectAcrollsDocument>,
	metadata: Record<string, unknown>
): AcrollsDocumentDiagnostic[] {
	const relativeFile = relative(root, file).replaceAll('\\', '/');
	const isIndex = relativeFile.split('/').at(-1) === 'index.md';
	const diagnostics: AcrollsDocumentDiagnostic[] = [];
	if (!isIndex && !facts.hasFrontmatter) {
		diagnostics.push(metadataDiagnostic(
			'ACROLLS_FRONTMATTER_REQUIRED',
			file,
			'Ordinary authored docs pages require a YAML frontmatter block.',
			'Add YAML frontmatter with a non-empty string title.'
		));
	}
	if (!isIndex) {
		const title = metadata.title;
		if (title === undefined || title === null || (typeof title === 'string' && !title.trim())) {
			diagnostics.push(metadataDiagnostic(
				'ACROLLS_TITLE_REQUIRED',
				file,
				'Ordinary authored docs pages require a non-empty frontmatter title.',
				'Add title: Your page title to the YAML frontmatter.'
			));
		} else if (typeof title !== 'string') {
			diagnostics.push(metadataDiagnostic(
				'ACROLLS_TITLE_INVALID',
				file,
				'Frontmatter title must be a string.',
				'Replace title with a non-empty YAML string.'
			));
		}
	} else if (metadata.title !== undefined) {
		diagnostics.push({
			...metadataDiagnostic(
				'ACROLLS_INDEX_TITLE_IGNORED',
				file,
				'Index page title is derived from its folder/group and the frontmatter title is ignored.',
				'Remove title from this index page or configure its folder/group title.'
			),
			severity: 'warning'
		});
	}
	if (!isIndex && facts.leadingH1 && typeof metadata.title === 'string' &&
		normalizeTitle(facts.leadingH1) !== normalizeTitle(metadata.title)) {
		diagnostics.push({
			...metadataDiagnostic(
				'ACROLLS_LEADING_H1_MISMATCH',
				file,
				`Initial Markdown H1 "${facts.leadingH1}" differs from frontmatter title "${metadata.title}".`,
				'Use the frontmatter title as the page title, or remove the initial H1.'
			),
			severity: 'warning'
		});
	}
	return diagnostics;
}

function addRejectedDocumentLinkDiagnostics(documents: ValidatedDocument[], root: string): void {
	const rejected = new Set(
		documents.filter((document) => document.status === 'rejected').map((document) => document.file)
	);
	for (const document of documents) {
		if (document.status === 'rejected') continue;
		for (const link of document.links) {
			const target = resolveMarkdownLink(document.file, link);
			if (!target || !rejected.has(target)) continue;
			document.diagnostics.push(metadataDiagnostic(
				'ACROLLS_LINK_TO_REJECTED_DOCUMENT',
				document.file,
				`Markdown link "${link}" targets rejected document "${relative(root, target)}".`,
				'Fix the target document frontmatter or remove the link.'
			));
		}
	}
}

function resolveMarkdownLink(file: string, link: string): string | undefined {
	const target = link.split('#', 1)[0] ?? '';
	if (!target || target.startsWith('/') || target.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(target)) return undefined;
	const resolved = resolve(dirname(file), target);
	return extname(resolved) ? resolved : `${resolved}.md`;
}

function compiledMetadata(code: string): Record<string, unknown> {
	const match = /export const metadata\s*=\s*(\{[\s\S]*?\});/.exec(code);
	if (!match) return {};
	try {
		const value: unknown = JSON.parse(match[1] ?? '{}');
		return value && typeof value === 'object' && !Array.isArray(value)
			? value as Record<string, unknown>
			: {};
	} catch {
		return {};
	}
}

function metadataDiagnostic(
	code: string,
	file: string,
	message: string,
	remediation: string
): AcrollsDocumentDiagnostic {
	return { code, severity: 'error', phase: 'metadata', file, message, remediation };
}

function documentStatus(
	diagnostics: readonly AcrollsDocumentDiagnostic[],
	fallback: AcrollsDocumentStatus
): AcrollsDocumentStatus {
	return diagnostics.some((diagnostic) => diagnostic.severity === 'error') ? 'rejected' : fallback;
}

function normalizeTitle(value: string): string {
	return value.replaceAll(/\s+/g, ' ').trim().toLocaleLowerCase();
}

async function discoverMarkdownFiles(root: string): Promise<string[]> {
	const entries = await readdir(root, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
		if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.')) continue;
		const file = resolve(root, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await discoverMarkdownFiles(file)));
			continue;
		}
		if (entry.isFile() && extname(entry.name).toLowerCase() === '.md') files.push(file);
	}
	return files;
}
