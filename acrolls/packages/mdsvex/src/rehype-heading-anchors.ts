import type { Root, Element, Text } from 'hast';
import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';

/**
 * Inject accessible heading anchors without adding a visible Markdown marker.
 * Works with rehype-slug ids.
 */
export function rehypeAcrollsHeadingAnchors() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (!/^h[1-6]$/.test(node.tagName)) return;
      const id = node.properties?.id;
      if (!id || typeof id !== 'string') return;

      // avoid double inject
      if (
        node.children.some(
          (c) =>
            c.type === 'element' &&
            c.properties &&
            Array.isArray(c.properties.className) &&
            c.properties.className.includes('acrolls-heading-anchor')
        )
      ) {
        return;
      }

      const label = toString(node) || id;
      const anchor: Element = {
        type: 'element',
        tagName: 'a',
        properties: {
          className: ['acrolls-heading-anchor'],
          href: `#${id}`,
          ariaLabel: `Link to ${label}`
        },
        // The heading's `#` is Markdown syntax and must not be rendered as
        // visible content. The aria-label keeps the deep-link control named
        // for assistive technology while the heading id remains linkable.
        children: [] as Text[]
      };
      node.children.unshift(anchor);
    });
  };
}
