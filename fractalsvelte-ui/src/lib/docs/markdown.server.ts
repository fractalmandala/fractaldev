import { highlightCode } from './shiki.server.ts';

function escapeHtml(value: string) {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function inline(value: string) {
	return value
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
			const target = href.endsWith('.md') ? `/guides/${href.split('/').pop()?.replace(/\.md$/, '') ?? ''}` : href;
			return `<a href="${target}">${label}</a>`;
		});
}

function headingId(value: string) {
	return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function renderMarkdown(markdown: string) {
	const lines = markdown.replace(/\r/g, '').split('\n');
	const output: string[] = [];
	let inCode = false;
	let code: string[] = [];
	let codeLanguage = 'text';
	let list: 'ul' | 'ol' | undefined;

	function closeList() {
		if (list) output.push(`</${list}>`);
		list = undefined;
	}

	async function closeCode() {
		output.push(await highlightCode(code.join('\n'), codeLanguage));
		code = [];
		codeLanguage = 'text';
		inCode = false;
	}

	for (let index = 0; index < lines.length; index += 1) {
		const rawLine = lines[index];
		const line = escapeHtml(rawLine);
		const fence = rawLine.match(/^```(?:\s*([A-Za-z0-9_+-]+))?\s*$/);
		if (fence) {
			if (inCode) await closeCode();
			else {
				closeList();
				inCode = true;
				codeLanguage = fence[1] ?? 'text';
			}
			continue;
		}
		if (inCode) {
			code.push(rawLine);
			continue;
		}
		if (line.startsWith('|') && lines[index + 1]?.trim().startsWith('|') && /^\|?\s*:?-{3,}/.test(lines[index + 1].trim())) {
			closeList();
			const rows = [line];
			index += 2;
			while (index < lines.length && lines[index].trim().startsWith('|')) {
				rows.push(escapeHtml(lines[index]));
				index += 1;
			}
			const cells = (row: string) => row.split('|').slice(1, -1).map((cell) => `<td>${inline(cell.trim())}</td>`).join('');
			const headings = rows[0].split('|').slice(1, -1).map((cell) => `<th scope="col">${inline(cell.trim())}</th>`).join('');
			const body = rows.slice(1).map((row) => `<tr>${cells(row)}</tr>`).join('');
			output.push(`<table><thead><tr>${headings}</tr></thead><tbody>${body}</tbody></table>`);
			index -= 1;
			continue;
		}
		if (!line.trim()) {
			closeList();
			continue;
		}
		const heading = line.match(/^(#{1,3})\s+(.+)$/);
		const rawHeading = rawLine.match(/^(#{1,3})\s+(.+)$/);
		if (heading && rawHeading) {
			closeList();
			const level = heading[1].length;
			output.push(`<h${level} id="${headingId(rawHeading[2])}">${inline(heading[2])}</h${level}>`);
			continue;
		}
		const unordered = line.match(/^[-*]\s+(.+)$/);
		const ordered = line.match(/^\d+\.\s+(.+)$/);
		if (unordered || ordered) {
			const nextList = unordered ? 'ul' : 'ol';
			if (list !== nextList) {
				closeList();
				list = nextList;
				output.push(`<${list}>`);
			}
			output.push(`<li>${inline((unordered ?? ordered)![1])}</li>`);
			continue;
		}
		closeList();
		output.push(`<p>${inline(line)}</p>`);
	}
	closeList();
	if (inCode) await closeCode();
	return output.join('\n');
}
