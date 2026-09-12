import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { rehypeAcrollsHeadingAnchors } from './rehype-heading-anchors.js';
import { rehypeAcrollsTableWrap } from './rehype-table-wrap.js';
import { rehypeAcrollsCode } from './rehype-code.js';
import { remarkAcrollsCodeMeta } from './remark-code-meta.js';
import { renderBannerHtml, splitFrontmatter } from './frontmatter.js';
import type { HighlightOptions } from './highlighter.js';

export type RenderHtmlResult = {
  html: string;
  frontmatter: Record<string, string>;
  /** Body only (no banner) */
  bodyHtml: string;
};

/**
 * Markdown → publication HTML (for Studio preview / CLI).
 * Strips simple Svelte script blocks so .svx markdown body can still preview.
 */
export async function renderAcrollsArticleHtml(
  source: string,
  options: HighlightOptions = {}
): Promise<RenderHtmlResult> {
  const { frontmatter, body } = splitFrontmatter(source);
  // Drop mdsvex script blocks for HTML preview (executable SVX is host territory)
  const markdown = body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\{@html[\s\S]*?\}/g, '');

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkAcrollsCodeMeta)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAcrollsHeadingAnchors)
    .use(rehypeAcrollsTableWrap)
    .use(rehypeAcrollsCode, options)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  const bodyHtml = String(file);
  const banner = renderBannerHtml(frontmatter);
  const html = `<article class="acrolls">${banner}${bodyHtml}</article>`;

  return { html, frontmatter, bodyHtml };
}
