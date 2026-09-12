// Code snippets shown on the installation page. Kept out of the page so its
// +page.server.ts can highlight them with shiki at build time.

export const LAYOUT_CODE = `// +layout.svelte — import the base design tokens at the root
import 'fractalstyler2/styles';
import 'markgraphy/styles/index.sass';

let { children } = $props();`;

export const PAGE_CODE = `<script>
  import { GraphStat } from 'markgraphy';
<\/script>

<GraphStat
  title="THIS WEEK"
  items={[
    { value: '12,400', label: 'docs' },
    { value: '4,100', label: 'copies' },
    { value: '860', label: 'shipped', accent: true }
  ]}
/>`;

export const SVX_CODE = `---
title: Field notes
---

<script>
  import { GraphMeter } from 'markgraphy';
<\/script>

## Throughput

<GraphMeter title="SHIPPED" value={0.67} caption="of plan" />

Prose flows around the figure. The frame spans the text column.`;

export const ACCENT_CODE = `/* app.css — retheme everything, or scope it to a section */
:root {
  --graph-accent: oklch(0.72 0.19 42);
  --graph-accent-2: oklch(0.75 0.12 250);
  --graph-accent-3: oklch(0.8 0.1 140);
}

/* any container works too */
.prose {
  --graph-accent: oklch(0.78 0.17 155);
}`;
