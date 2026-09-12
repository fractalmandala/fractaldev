<script>
  import { createStudio } from './lib/studio.svelte';
  import Toolbar from './lib/components/Toolbar.svelte';
  import Canvas from './lib/components/Canvas.svelte';
  import DocumentPanel from './lib/components/DocumentPanel.svelte';
  import StatsPanel from './lib/components/StatsPanel.svelte';
  import CodePanel from './lib/components/CodePanel.svelte';

  const studio = createStudio();

  // Debug hook for scripted testing: exposes the live store once mounted.
  $effect(() => {
    window.__studio = studio;
  });
</script>

<div class="wrap">
  <header>    <div class="eyebrow">MDP Studio · Svelte canvas slice</div>
    <h1>Two grammars, one canvas — layouts compile, flows route</h1>
    <p class="lede">
      <b>Layout</b> is a wireframe <em>tree</em>: sketch primitives — <code>row</code> / <code>col</code> /
      <code>grid</code>, <code>box</code> / <code>input</code> / <code>button</code> / <code>text</code> — nest them by
      dropping shapes into containers, rename and recolor them, and the measured document compiles to real Svelte
      markup (flex axes, gaps, padding inferred from geometry). <b>Flow</b> is a flowchart <em>graph</em>:
      <span class="kbd">⌥</span>-drag between nodes to connect, click a wire to label or color it, and the actual
      <code>@eraserlabs/layout</code> corridor router routes every edge inside a <code>$derived</code> — then exports to
      Mermaid with no geometry, because routing is the renderer's job. Select a node to rename it (the id becomes the
      generated class name) or recolor it (fill / border / text).
      Keyboard: arrows nudge (4px, <span class="kbd">Shift</span> = 16px),
      <span class="kbd">Enter</span> toggles containment (layout), <span class="kbd">⌫</span> deletes,
      <span class="kbd">Esc</span> deselects.
    </p>
  </header>

  <Toolbar {studio} />
  <div class="frame">
    <Canvas {studio} />
  </div>
  <div class="cols">
    <DocumentPanel {studio} />
    <StatsPanel {studio} />
  </div>
  <CodePanel {studio} />
  <footer>
    Svelte 5 runes store · <code>use:draggable</code> / <code>use:resizable</code> / <code>use:connectable</code> actions · router bundled from
    <code>packages/layout</code> · layout → Svelte markup, flow → Mermaid, both in <code>generate.ts</code>
  </footer>
</div>

<style>
  :global(:root) {
    --paper: #f5f5f5;
    --paper2: #ececec;
    --ink: #2d3142;
    --muted: #4f5d75;
    --soft: #7a8399;
    --rule: rgba(45, 49, 66, 0.12);
    --rule-solid: #bfc0c0;
    --accent: #eb6c36;
    --accent-tint: rgba(235, 108, 54, 0.08);
    --link: #2e5aa8;
    --ok: #3e7a52;
    --bad: #b03a2e;
    --mono: 'Geist Mono', 'SFMono-Regular', ui-monospace, Consolas, 'Liberation Mono', monospace;
    --sans: 'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    --serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  }
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  :global(body) {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.55;
  }
  .wrap {
    max-width: 1180px;
    margin: 0 auto;
    padding: 28px 24px 72px;
  }
  header {
    margin-bottom: 8px;
  }
  .eyebrow {
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
    font-weight: 500;
  }
  h1 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(1.8rem, 3.6vw, 2.5rem);
    letter-spacing: -0.01em;
    margin-top: 6px;
  }
  .lede {
    color: var(--muted);
    max-width: 76ch;
    margin-top: 8px;
    font-size: 0.95rem;
  }
  :global(code) {
    font-family: var(--mono);
    font-size: 0.84em;
    background: var(--paper2);
    border-radius: 4px;
    padding: 1px 5px;
  }
  :global(.kbd) {
    font-family: var(--mono);
    font-size: 0.68rem;
    border: 1px solid var(--rule-solid);
    border-bottom-width: 2px;
    border-radius: 4px;
    padding: 1px 6px;
    background: #fff;
  }
  .frame {
    border: 1px solid var(--rule);
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
  }
  .cols {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 14px;
  }
  @media (min-width: 900px) {
    .cols {
      grid-template-columns: 1fr 300px;
    }
  }
  footer {
    margin-top: 22px;
    color: var(--soft);
    font-family: var(--mono);
    font-size: 0.7rem;
  }
  :global(.btn) {
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: #fff;
    border: 1px solid var(--rule-solid);
    color: var(--muted);
    border-radius: 6px;
    padding: 8px 13px;
    cursor: pointer;
    min-height: 34px;
  }
  :global(.btn:hover) {
    border-color: var(--accent);
    color: var(--accent);
  }
  :global(.btn:focus-visible) {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  :global(.btn[aria-pressed='true']) {
    border-color: var(--accent);
    color: #fff;
    background: var(--accent);
  }
  :global(.btn:disabled) {
    opacity: 0.45;
    cursor: default;
  }
  :global(.pill) {
    display: inline-block;
    font-family: var(--mono);
    font-size: 0.68rem;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--rule);
    color: var(--muted);
    background: #fff;
    min-height: 34px;
    line-height: 1.55;
  }
  :global(.pill.ok) {
    color: var(--ok);
    border-color: var(--ok);
  }
  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
    }
  }
</style>
