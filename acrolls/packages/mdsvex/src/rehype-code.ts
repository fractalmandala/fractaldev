import type { Root, Element, Text } from 'hast';
import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import { createAcrollsHighlighter, type HighlightOptions } from './highlighter.js';

/**
 * Replace raw <pre><code class="language-…"> with Acrolls Shiki frames (HTML pipeline / Studio).
 */
export function rehypeAcrollsCode(options: HighlightOptions = {}) {
  const highlight = createAcrollsHighlighter(options);

  return async (tree: Root) => {
    const jobs: Array<Promise<void>> = [];

    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'pre' || !parent || typeof index !== 'number') return;
      const codeEl = node.children.find(
        (c): c is Element => c.type === 'element' && c.tagName === 'code'
      );
      if (!codeEl) return;

      const className = codeEl.properties?.className as
        | string
        | Array<string | number>
        | null
        | undefined;
      const classes: string[] = Array.isArray(className)
        ? className.map((c) => String(c))
        : typeof className === 'string'
          ? className.split(/\s+/)
          : [];
      const langClass = classes.find((c: string) => c.startsWith('language-'));
      const lang = langClass?.replace(/^language-/, '') || 'text';
      const props = (codeEl.properties ?? {}) as Record<string, unknown>;
      const meta =
        typeof props.metastring === 'string'
          ? props.metastring
          : typeof props.meta === 'string'
            ? props.meta
            : undefined;
      const source = toString(codeEl);

      jobs.push(
        (async () => {
          const html = await highlight(source, lang, meta);
          // Insert as raw HTML node so rehype-stringify keeps it
          parent.children[index] = {
            type: 'raw',
            value: html
          } as unknown as Element;
        })()
      );
    });

    await Promise.all(jobs);
  };
}
