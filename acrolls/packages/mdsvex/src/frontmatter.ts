export type Frontmatter = Record<string, string>;

/**
 * Minimal YAML-ish frontmatter (key: value lines only).
 * Enough for Studio banners and validate metadata.
 */
export function splitFrontmatter(source: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { frontmatter: {}, body: source };

  const frontmatter: Frontmatter = {};
  for (const line of (match[1] ?? '').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2] ?? '';
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[m[1]!] = value;
  }

  return { frontmatter, body: source.slice(match[0].length) };
}

export function renderBannerHtml(fm: Frontmatter): string {
  const title = fm.title;
  if (!title) return '';
  const description = fm.description ?? fm.brief;
  const eyebrow = fm.eyebrow ?? fm.series ?? fm.project;
  const reading = fm.reading ?? fm.metadata;
  const image = fm.image;
  const imageAlt = fm.imageAlt ?? '';

  const parts = ['<header class="acrolls-banner"><div class="acrolls-banner__text">'];
  if (eyebrow) parts.push(`<p class="acrolls-banner__eyebrow">${escape(eyebrow)}</p>`);
  parts.push(`<h1 class="acrolls-banner__title">${escape(title)}</h1>`);
  if (description) {
    parts.push(`<p class="acrolls-banner__description">${escape(description)}</p>`);
  }
  if (reading) parts.push(`<p class="acrolls-banner__meta">${escape(reading)}</p>`);
  parts.push('</div>');
  if (image) {
    parts.push(
      `<div class="acrolls-banner__media"><img src="${escape(image)}" alt="${escape(imageAlt)}" /></div>`
    );
  }
  parts.push('</header>');
  return parts.join('');
}

function escape(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
