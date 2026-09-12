import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

/** Mermaid diagram declarations that are commonly emitted without a fence. */
const MERMAID_DECLARATION = /^(?:(?:graph|flowchart)\s+(?:TB|TD|BT|RL|LR)\b|(?:sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|gitGraph|quadrantChart|timeline|mindmap|architecture|block-beta|packet-beta|xychart-beta|zenuml)(?:\s|$))/i;

type TextNode = {
	type: string;
	value?: string;
	children?: TextNode[];
};

function textContent(node: TextNode): string {
	if (typeof node.value === 'string') return node.value;
	return node.children?.map(textContent).join('') ?? '';
}

/**
 * Recover Mermaid blocks that arrive as unfenced Markdown paragraphs.
 *
 * Some generated documentation corpora lose their triple-backtick fences while
 * preserving the Mermaid source. Without this guard, mdsvex forwards the source
 * to Svelte's parser, where Mermaid arrows, braces, and labels can become syntax
 * errors. Converting only paragraphs whose first line is a known Mermaid
 * declaration keeps ordinary prose untouched and lets the normal Acrolls
 * highlighter/rendering fallback handle the recovered block.
 */
export function remarkAcrollsMermaidGuard() {
	return (tree: Root) => {
		visit(tree, 'paragraph', (node, index, parent) => {
			if (index === undefined || !parent) return;

			const source = textContent(node as TextNode).trim();
			if (!source || !MERMAID_DECLARATION.test(source)) return;

			parent.children[index] = {
				type: 'code',
				lang: 'mermaid',
				value: source,
				position: node.position
			};
		});
	};
}
