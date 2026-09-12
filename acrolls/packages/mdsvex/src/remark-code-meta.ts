import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

/**
 * Copy fenced-code `meta` onto hast properties so rehypeAcrollsCode can read it.
 */
export function remarkAcrollsCodeMeta() {
  return (tree: Root) => {
    visit(tree, 'code', (node) => {
      if (!node.meta) return;
      node.data = node.data ?? {};
      const data = node.data as {
        hProperties?: Record<string, unknown>;
      };
      data.hProperties = {
        ...(data.hProperties ?? {}),
        meta: node.meta,
        metastring: node.meta
      };
    });
  };
}
