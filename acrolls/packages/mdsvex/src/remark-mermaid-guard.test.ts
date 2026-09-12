import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { describe, expect, it } from 'vitest';
import { remarkAcrollsMermaidGuard } from './remark-mermaid-guard.js';

function guardedTree(markdown: string) {
	const tree = unified().use(remarkParse).parse(markdown);
	const transform = remarkAcrollsMermaidGuard();
	transform(tree);
	return tree;
}

describe('remarkAcrollsMermaidGuard', () => {
	it('recovers an unfenced Mermaid paragraph as a code node', () => {
		const tree = guardedTree('flowchart TD\nA[“Start”] --> B[End]');
		const node = tree.children[0];

		expect(node.type).toBe('code');
		if (node.type === 'code') {
			expect(node.lang).toBe('mermaid');
			expect(node.value).toContain('A[“Start”] --> B[End]');
		}
	});

	it('leaves ordinary paragraphs untouched', () => {
		const tree = guardedTree('flowchart diagrams are useful in documentation.');
		expect(tree.children[0].type).toBe('paragraph');
	});

	it('does not replace an already fenced Mermaid code block', () => {
		const tree = guardedTree('```mermaid\ngraph TD\nA --> B\n```');
		const node = tree.children[0];

		expect(node.type).toBe('code');
		if (node.type === 'code') expect(node.lang).toBe('mermaid');
	});
});
