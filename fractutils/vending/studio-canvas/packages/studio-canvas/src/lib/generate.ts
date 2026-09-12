/**
 * generate.ts — the measured document compiled to real Svelte markup.
 *
 * Same document, two serializers: one emits a Svelte 5 component (the artifact an
 * AI or human keeps), one emits plain HTML (identical tree + CSS) for instant
 * preview. Everything is derived from the document — container membership, primitive
 * roles, and measured geometry (gaps, padding, columns) — deterministically: the
 * same document always produces the same bytes.
 *
 * Nesting rules:
 *  - `Group` (an unnamed container): children clustered into lines by y (row
 *    clustering, 24-unit tolerance); one line → row, several → column of rows.
 *  - role `row` / `col`: children sorted by x / y into a single flex axis.
 *  - role `grid`: children clustered into lines of `columns`, emitted as CSS grid.
 *  - leaves: `box` (framed block), `input`, `button`, `text` (`<p>`).
 *  - free containers at the root become sections of one flex column page.
 */

type Primitive = 'box' | 'row' | 'col' | 'grid' | 'input' | 'button' | 'text';

export interface GenEntity {
  id: string;
  tag?: string;
  role?: string;
  containerId?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  columns?: number;
  focal?: boolean;
  title?: { text?: string };
  texts?: { text?: string }[];
  style?: { fill?: string; stroke?: string; text?: string };
}

export interface GenConnection {
  id?: string;
  from: string;
  to: string;
  label?: string;
  style?: { fill?: string; stroke?: string; text?: string };
}

export interface GenDocument {
  entities: GenEntity[];
  connections?: GenConnection[];
}

export interface GenResult {
  svelte: string;
  html: string;
  warnings: string[];
}

const GAP_TOL = 24;

interface Node {
  e: GenEntity;
  label: string;
}

function labelOf(e: GenEntity): string {
  if (e.tag === 'Group') return e.title?.text ?? e.id;
  return e.texts?.[0]?.text ?? e.id;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function snap4(v: number): number {
  return Math.max(0, Math.round(v / 4) * 4);
}

/**
 * Per-entity color overrides (fill → background, stroke → border, text → color).
 * Appended after role defaults so an authored override always wins the cascade,
 * and so the emitted Svelte keeps the same contract the canvas drew.
 */
function styleCss(e: GenEntity): string[] {
  const s = e.style;
  if (!s) return [];
  const parts: string[] = [];
  if (s.fill) parts.push(`background: ${s.fill}`);
  if (s.stroke) parts.push(`border: 1px solid ${s.stroke}`);
  if (s.text) parts.push(`color: ${s.text}`);
  return parts;
}

function byId(doc: GenDocument): Map<string, GenEntity> {
  return new Map(doc.entities.map((e) => [e.id, e]));
}

function childrenOf(doc: GenDocument, id: string): GenEntity[] {
  return doc.entities
    .filter((e) => (e.containerId ?? null) === id)
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

/**
 * Cluster children into visual rows: sweeping by y, a child joins the current row
 * only if it vertically overlaps EVERY member already in it (min-bottom rule).
 * A gap tolerance would chain-merge wireframe rows (8px gaps are normal), so
 * overlap-with-all is the rule; small y misalignments still overlap.
 */
function clusterRows(children: GenEntity[]): GenEntity[][] {
  const rows: GenEntity[][] = [];
  let current: GenEntity[] = [];
  let minBottom = Infinity;
  for (const c of [...children].sort((a, b) => a.y - b.y || a.x - b.x)) {
    if (current.length === 0 || c.y < minBottom) {
      current.push(c);
      minBottom = Math.min(minBottom, c.y + c.height);
    } else {
      rows.push(current);
      current = [c];
      minBottom = c.y + c.height;
    }
  }
  if (current.length > 0) rows.push(current);
  for (const row of rows) row.sort((a, b) => a.x - b.x);
  return rows;
}

/** Geometric flex classes + spacing inferred from measured boxes. */
function containerCss(e: GenEntity, kids: GenEntity[], axis: 'row' | 'col', wrap = false): string {
  const parts: string[] = [`display: flex`, `flex-direction: ${axis === 'col' ? 'column' : 'row'}`];
  if (wrap) parts.push('flex-wrap: wrap');
  const xs = kids.map((k) => k.x - e.x);
  const ys = kids.map((k) => k.y - e.y);
  const padL = Math.max(0, Math.min(...xs));
  const padT = Math.max(0, Math.min(...ys));
  const padR = Math.max(0, e.width - Math.max(...kids.map((k) => k.x + k.width - e.x)));
  const padB = Math.max(0, e.height - Math.max(...kids.map((k) => k.y + k.height - e.y)));
  if (padL + padR + padT + padB > 0) {
    parts.push(`padding: ${snap4(padT)}px ${snap4(padR)}px ${snap4(padB)}px ${snap4(padL)}px`);
  }
  if (axis === 'row') {
    const gaps: number[] = [];
    for (let i = 1; i < kids.length; i++) gaps.push(kids[i].x - (kids[i - 1].x + kids[i - 1].width));
    const gap = gaps.length > 0 ? Math.min(...gaps.map(snap4)) : 0;
    if (gap > 0) parts.push(`gap: ${gap}px`);
  } else {
    const gaps: number[] = [];
    for (let i = 1; i < kids.length; i++) gaps.push(kids[i].y - (kids[i - 1].y + kids[i - 1].height));
    const gap = gaps.length > 0 ? Math.min(...gaps.map(snap4)) : 0;
    if (gap > 0) parts.push(`gap: ${gap}px`);
  }
  parts.push(...styleCss(e));
  return parts.join('; ');
}

function gridCss(e: GenEntity, z: number): string {
  const base = `display: grid; grid-template-columns: repeat(${z}, minmax(0, 1fr)); gap: 16px; padding: 16px`;
  const over = styleCss(e);
  return over.length > 0 ? `${base}; ${over.join('; ')}` : base;
}

function leafCss(e: GenEntity): string | null {
  switch (e.role) {
    case 'input':
      return [
        'display: flex',
        'align-items: center',
        `min-height: ${snap4(e.height)}px`,
        'padding: 0 12px',
        'border: 1px solid var(--rule-solid)',
        'border-radius: 8px',
        'background: var(--paper)',
        'color: var(--muted)',
        'font-size: 13px',
        ...styleCss(e),
      ].join('; ');
    case 'button':
      return [
        'display: flex',
        'align-items: center',
        'justify-content: center',
        `min-height: ${snap4(e.height)}px`,
        'padding: 0 16px',
        e.focal ? 'background: var(--accent)' : 'background: #fff',
        e.focal ? 'color: #fff' : 'color: var(--ink)',
        e.focal ? 'border: none' : 'border: 1px solid var(--rule-solid)',
        'border-radius: 8px',
        'font-size: 13px',
        'font-weight: 500',
        ...styleCss(e),
      ].join('; ');
    case 'text':
      return ['color: var(--muted)', 'font-size: 14px', 'line-height: 1.5', 'margin: 0', ...styleCss(e)].join('; ');
    default:
      // box — a framed block with its measured size as the minimum
      return [
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'border: 1px dashed var(--rule-solid)',
        'border-radius: 10px',
        'background: var(--paper)',
        'color: var(--soft)',
        'font-size: 12px',
        `min-height: ${snap4(e.height)}px`,
        ...styleCss(e),
      ].join('; ');
  }
}

/** Serialize one container subtree into shared-shape lines consumed by both emitters. */
interface El {
  tag: string;
  cls: string;
  text?: string;
  attrs?: string;
  css?: string;
  kids?: El[];
  comment?: string;
}

function buildEl(doc: GenDocument, e: GenEntity, incoming: Map<string, string[]>): El {
  const label = labelOf(e);
  const comment = incoming.get(e.id)?.length
    ? incoming.get(e.id)!.map((l) => `flow: ${l}`).join(', ')
    : undefined;
  const isContainerTag = e.tag === 'Group' || e.role === 'row' || e.role === 'col' || e.role === 'grid';
  if (isContainerTag) {
    const kids = childrenOf(doc, e.id);
    let el: El;
    if (e.role === 'row') {
      el = { tag: 'div', cls: e.id, css: containerCss(e, kids, 'row'), kids: kids.map((k) => buildEl(doc, k, incoming)) };
    } else if (e.role === 'col') {
      el = { tag: 'div', cls: e.id, css: containerCss(e, kids, 'col'), kids: kids.map((k) => buildEl(doc, k, incoming)) };
    } else if (e.role === 'grid') {
      const z = Math.max(1, Math.round(e.columns ?? 2));
      el = { tag: 'div', cls: e.id, css: gridCss(e, z), kids: kids.map((k) => buildEl(doc, k, incoming)) };
    } else {
      // Group: row-clustering → column of rows (a single row stays a row)
      const rows = clusterRows(kids);
      if (rows.length <= 1) {
        const flat = rows[0] ?? [];
        el = {
          tag: 'section',
          cls: e.id,
          css: containerCss(e, flat, 'row', true),
          kids: flat.map((k) => buildEl(doc, k, incoming)),
        };
      } else {
        const rowEls: GenEntity[][] = rows;
        // synthesize row wrappers from geometry (no source entity): pad from container
        const inner: El[] = rowEls.map((row) => {
          const synthetic: GenEntity = {
            ...e,
            id: `${e.id}-r${rowEls.indexOf(row) + 1}`,
            x: Math.min(...row.map((k) => k.x)),
            y: Math.min(...row.map((k) => k.y)),
            width: Math.max(...row.map((k) => k.x + k.width)) - Math.min(...row.map((k) => k.x)),
            height: Math.max(...row.map((k) => k.y + k.height)) - Math.min(...row.map((k) => k.y)),
          };
          return {
            tag: 'div',
            cls: synthetic.id,
            css: containerCss(synthetic, row, 'row'),
            kids: row.map((k) => buildEl(doc, k, incoming)),
          };
        });
        el = { tag: 'section', cls: e.id, css: containerCss(e, kids, 'col'), kids: inner };
      }
    }
    return { ...el, comment };
  }
  // leaves
  const role = (e.role ?? 'box') as Primitive;
  if (role === 'button') {
    return { tag: 'button', cls: e.id, text: label, attrs: 'type="button"', css: leafCss(e) ?? undefined, comment };
  }
  if (role === 'input') {
    return { tag: 'input', cls: e.id, attrs: `type="text" placeholder="${esc(label)}" aria-label="${esc(label)}"`, css: leafCss(e) ?? undefined, comment };
  }
  if (role === 'text') {
    return { tag: 'p', cls: e.id, text: label, css: leafCss(e) ?? undefined, comment };
  }
  return { tag: 'div', cls: e.id, text: label, css: leafCss(e) ?? undefined, comment };
}

function walkSvelte(el: El, indent: string, out: string[]): void {
  const selfClose = el.tag === 'input';
  const comment = el.comment ? `${indent}<!-- ${el.comment} -->\n` : '';
  if (selfClose) {
    out.push(`${comment}${indent}<input class="${el.cls}" ${el.attrs ?? ''} />`);
    return;
  }
  out.push(`${comment}${indent}<${el.tag} class="${el.cls}"${el.attrs ? ' ' + el.attrs : ''}>`);
  const inner = indent + '  ';
  if (el.text !== undefined) out.push(`${inner}${el.text}`);
  for (const k of el.kids ?? []) walkSvelte(k, inner, out);
  out.push(`${indent}</${el.tag}>`);
}

function walkHtml(el: El, indent: string, out: string[]): void {
  const selfClose = el.tag === 'input';
  const comment = el.comment ? `${indent}<!-- ${el.comment} -->\n` : '';
  if (selfClose) {
    out.push(`${comment}${indent}<input class="${el.cls}" ${el.attrs ?? ''} />`);
    return;
  }
  out.push(`${comment}${indent}<${el.tag} class="${el.cls}"${el.attrs ? ' ' + el.attrs : ''}>`);
  const inner = indent + '  ';
  if (el.text !== undefined) out.push(`${inner}${esc(el.text)}`);
  for (const k of el.kids ?? []) walkHtml(k, inner, out);
  out.push(`${indent}</${el.tag}>`);
}

function collectCss(el: El, out: string[]): void {
  // Scoped under .wireframe so generated class names (entity ids) can never
  // collide with host-app styles when the preview is injected or the component
  // is dropped into a page.
  if (el.css) out.push(`  .wireframe .${el.cls} { ${el.css}; }`);
  for (const k of el.kids ?? []) collectCss(k, out);
}

export function generateSvelte(doc: GenDocument): GenResult {
  const warnings: string[] = [];
  const ids = byId(doc);
  const roots = doc.entities.filter((e) => !e.containerId || !ids.has(e.containerId));
  // incoming labels per target, for flow comments in the markup
  const incoming = new Map<string, string[]>();
  for (const c of doc.connections ?? []) {
    const l = `${c.from} → ${c.to}${c.label ? ` (${c.label})` : ''}`;
    const list = incoming.get(c.to) ?? [];
    list.push(l);
    incoming.set(c.to, list);
  }
  // roots: free containers first (reading order), free leaves after
  const ordered = [
    ...roots.filter((e) => e.tag === 'Group' || e.role === 'row' || e.role === 'col' || e.role === 'grid'),
    ...roots.filter((e) => !(e.tag === 'Group' || e.role === 'row' || e.role === 'col' || e.role === 'grid')),
  ];
  if (roots.length === 0) warnings.push('document has no root entities');
  const top: El[] = ordered.map((e) => buildEl(doc, e, incoming));

  // free leaves with no container role still render as boxes — noted for the AI step
  for (const e of roots) {
    if (!(e.tag === 'Group' || e.role === 'row' || e.role === 'col' || e.role === 'grid')) {
      if (e.role && e.role !== 'box' && e.role !== 'input' && e.role !== 'button' && e.role !== 'text') {
        warnings.push(`root "${e.id}" has container role "${e.role}" but sits outside any container`);
      }
    }
  }

  const svelteBody: string[] = [];
  svelteBody.push('<main class="wireframe">');
  for (const el of top) walkSvelte(el, '  ', svelteBody);
  svelteBody.push('</main>');

  const htmlBody: string[] = [];
  htmlBody.push('<main class="wireframe">');
  for (const el of top) walkHtml(el, '  ', htmlBody);
  htmlBody.push('</main>');

  const css: string[] = [
    '  .wireframe {',
    '    --paper: #f5f5f5;',
    '    --ink: #2d3142;',
    '    --muted: #4f5d75;',
    '    --soft: #7a8399;',
    '    --rule: rgba(45, 49, 66, 0.12);',
    '    --rule-solid: #bfc0c0;',
    '    --accent: #eb6c36;',
    '    display: flex;',
    '    flex-direction: column;',
    '    gap: 24px;',
    '    padding: 24px;',
    '    font-family: system-ui, sans-serif;',
    '    color: var(--ink);',
    '  }',
    '  .wireframe > * { margin: 0; }',
    '  .wireframe p { margin: 0; }',
    '  .wireframe button { cursor: pointer; }',
  ];
  for (const el of top) collectCss(el, css);

  const stamp = 'generated from a measured document — geometry and roles are data, not guesses';
  const svelte = [
    '<!--',
    `  ${stamp}`,
    '  Edit freely; re-generating will overwrite this file.',
    '-->',
    '<script lang="ts">',
    '  // Wire interactions here. Layout stays in the <style> block below — it is',
    '  // generated from the document\'s measured geometry (flex axes, gaps, padding).',
    '</script>',
    '',
    ...svelteBody,
    '',
    '<style>',
    ...css,
    '</style>',
    '',
  ].join('\n');

  const html = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<title>Wireframe preview</title>',
    '<style>',
    ...css,
    '</style>',
    '</head>',
    '<body style="margin:0;background:#ececec;display:grid;place-items:start center;">',
    '<div style="background:#fff;width:100%;max-width:720px;margin:24px;border-radius:12px;box-shadow:0 1px 4px rgba(45,49,66,.12);overflow:hidden;">',
    ...htmlBody,
    '</div>',
    '</body>',
    '</html>',
    '',
  ].join('\n');

  return { svelte, html, warnings };
}

/**
 * Flow documents export to Mermaid — the symmetry that makes the mode split
 * honest. A layout document compiles to Svelte because a wireframe's *geometry*
 * is its meaning; a flow document exports NO geometry at all, because a
 * flowchart's meaning is nodes + sequence + labels. Mermaid (or its renderer)
 * owns the routing — the exact boundary the corridor router deserves.
 */
export function generateMermaid(doc: GenDocument): { mermaid: string; warnings: string[] } {
  const warnings: string[] = [];
  const mangle = (id: string): string => id.replace(/[^A-Za-z0-9_]/g, '_');
  const escLabel = (s: string): string => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const lines: string[] = ['flowchart TD'];
  for (const e of doc.entities) {
    const label = labelOf(e);
    lines.push(`  ${mangle(e.id)}["${escLabel(label)}"]`);
  }
  for (const c of doc.connections ?? []) {
    const edge = c.label ? `${mangle(c.from)} -- "${escLabel(c.label)}" --> ${mangle(c.to)}` : `${mangle(c.from)} --> ${mangle(c.to)}`;
    lines.push(`  ${edge}`);
  }

  // Per-node fill overrides become classDefs; wire strokes are Mermaid's business.
  const classes: { name: string; def: string }[] = [];
  const nodeClass = new Map<string, string>();
  let n = 0;
  for (const e of doc.entities) {
    if (!e.style?.fill) continue;
    const name = `s${n++}`;
    classes.push({ name, def: `fill:${e.style.fill}` });
    nodeClass.set(e.id, name);
  }
  if (classes.length > 0) {
    lines.push('');
    for (const c of classes) lines.push(`  classDef ${c.name} ${c.def}`);
    for (const [id, cls] of nodeClass) lines.push(`  class ${mangle(id)} ${cls}`);
  }

  const isolated = doc.entities.filter(
    (e) =>
      !(doc.connections ?? []).some((c) => c.from === e.id || c.to === e.id),
  );
  if (isolated.length > 0) {
    warnings.push(
      `${isolated.length} node(s) have no edges and will float (${isolated.map((e) => e.id).join(', ')})`,
    );
  }
  return { mermaid: lines.join('\n') + '\n', warnings };
}
