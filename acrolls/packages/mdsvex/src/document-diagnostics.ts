import type { AcrollsSafetyFinding } from './source-safety.js';

export type AcrollsDocumentMode = 'authored' | 'migration';
export type AcrollsInvalidDocumentPolicy = 'fail' | 'error-page';
export type AcrollsDocumentStatus = 'ready' | 'normalized' | 'rejected';
export type AcrollsDocumentDiagnostic = {
	code: string;
	severity: 'warning' | 'error';
	phase: 'normalize' | 'metadata' | 'compile' | 'render';
	file?: string;
	line?: number;
	column?: number;
	message: string;
	remediation?: string;
};

export function safetyFindingDiagnostic(
	finding: AcrollsSafetyFinding,
	file?: string
): AcrollsDocumentDiagnostic {
	return {
		code: `source-safety/${finding.kind}`,
		severity: 'warning',
		phase: 'normalize',
		file,
		line: finding.line,
		column: finding.column,
		message: finding.message,
		remediation: 'Keep intentional code in a fenced or inline code span, or use .svx for executable Svelte.'
	};
}

export function compileDiagnostic(error: unknown, file?: string): AcrollsDocumentDiagnostic {
	const message = error instanceof Error ? error.message : String(error);
	const location = extractErrorLocation(error) ?? extractLocation(message);
	return {
		code: 'mdsvex/compile-error',
		severity: 'error',
		phase: 'compile',
		file,
		line: location?.line,
		column: location?.column,
		message,
		remediation: 'Fix the Markdown/Svelte syntax or use migration error-page mode for this document.'
	};
}

export function diagnosticError(diagnostic: AcrollsDocumentDiagnostic): Error {
	const location = diagnostic.line !== undefined
		? `:${diagnostic.line}${diagnostic.column !== undefined ? `:${diagnostic.column}` : ''}`
		: '';
	const file = diagnostic.file ? `${diagnostic.file}${location}` : diagnostic.code;
	return new Error(`${file} [${diagnostic.code}] ${diagnostic.message}`);
}

/**
 * Generate a safe Svelte module for migration mode when a Markdown document cannot compile.
 * Keep this output independent from the host's layout so the document remains routable.
 */
export function renderInvalidDocumentModule(diagnostic: AcrollsDocumentDiagnostic): string {
	const file = escapeSvelteText(diagnostic.file ?? 'document');
	const message = escapeSvelteText(diagnostic.message);
	const remediation = escapeSvelteText(diagnostic.remediation ?? 'Review the source document.');
	return `<script module>\n\texport const metadata = {};\n</script>\n\n<svelte:head><title>Document unavailable</title></svelte:head>\n<article class="acrolls acrolls-document-error">\n\t<h1>Document unavailable</h1>\n\t<p>Acrolls could not compile <code>${file}</code>.</p>\n\t<pre>${message}</pre>\n\t<p>${remediation}</p>\n</article>`;
}

function extractLocation(message: string): { line: number; column: number } | undefined {
	const match = message.match(/(?:line\s+|:)(\d+)(?::|,?\s+column\s+)(\d+)/i);
	if (!match) return undefined;
	return { line: Number(match[1]), column: Number(match[2]) };
}

function extractErrorLocation(error: unknown): { line: number; column: number } | undefined {
	if (!error || typeof error !== 'object') return undefined;
	const start = (error as { start?: { line?: number; column?: number } }).start;
	if (start?.line !== undefined && start.column !== undefined) {
		return { line: start.line, column: start.column };
	}
	const position = (error as { position?: { line?: number; column?: number } }).position;
	if (position?.line !== undefined && position.column !== undefined) {
		return { line: position.line, column: position.column };
	}
	return undefined;
}

function escapeSvelteText(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('{', '&#123;')
		.replaceAll('}', '&#125;');
}
