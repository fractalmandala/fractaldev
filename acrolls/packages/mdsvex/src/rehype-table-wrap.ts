import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Wrap bare tables in a keyboard-focusable overflow region.
 * Uses role=region so tabindex is a11y-valid for scroll containers.
 */
export function rehypeAcrollsTableWrap() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || typeof index !== 'number') return;
      if (parent.type === 'element') {
        const p = parent as Element;
        const cn = p.properties?.className;
        const classes = Array.isArray(cn) ? cn.map(String) : String(cn ?? '');
        if (classes.includes('acrolls-table-wrap')) return;
      }

      const wrap: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['acrolls-table-wrap'],
          tabIndex: 0,
          role: 'region',
          // hast uses camelCase; stringify emits aria-label
          ariaLabel: 'Scrollable table'
        },
        children: [node]
      };
      parent.children[index] = wrap;
    });
  };
}
