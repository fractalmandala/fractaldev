<script lang="ts">
  import { SCENE } from '../studio.svelte';
  import type { Studio } from '../studio.svelte';
  import DiagramEdge from './DiagramEdge.svelte';
  import DiagramNode from './DiagramNode.svelte';

  let { studio }: { studio: Studio } = $props();

  let el: SVGSVGElement | undefined = $state();

  const isFlow = $derived(studio.mode === 'flow');
  const ghost = $derived(studio.connecting);
  /** Ghost anchor: the source node's center, computed from the live router boxes. */
  const ghostStart = $derived.by(() => {
    if (!ghost) return null;
    const b = studio.nodeBoxes.get(ghost.from);
    return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : null;
  });

  function onBackdropDown(ev: PointerEvent) {
    const t = ev.target as Element | null;
    if (t === el || t?.getAttribute?.('data-grid') === 'true') studio.deselect();
  }
</script>

<!-- role="application" makes the canvas an interactive composite widget: keyboard map lives in use:draggable -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<svg
  bind:this={el}
  class:dragging={!!studio.draft}
  class:connecting={!!ghost}
  viewBox="0 0 {SCENE.width} {SCENE.height}"
  role="application"
  tabindex="0"
  aria-roledescription="diagram editor"
  aria-label={isFlow
    ? 'Flowchart canvas. Alt-drag between nodes to connect them; the corridor router routes the wires.'
    : 'Layout canvas. Drag nodes to move on a four pixel grid; drop shapes into containers to nest them.'}
  onpointerdown={onBackdropDown}
>
  <defs>
    <pattern id="grid4" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M16 0 H0 V16" fill="none" stroke="rgba(45,49,66,.055)" stroke-width="1" />
    </pattern>
    <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#4f5d75" />
    </marker>
  </defs>
  <rect data-grid="true" x="0" y="0" width={SCENE.width} height={SCENE.height} fill="url(#grid4)" />
  {#if isFlow}
    <g class="edges">
      {#each studio.routes as route (route.id)}
        <DiagramEdge {route} {studio} draft={!!studio.draft} />
      {/each}
    </g>
    <!-- live ghost while ⌥-dragging a new connection -->
    {#if ghost && ghostStart}
      <line
        x1={ghostStart.x}
        y1={ghostStart.y}
        x2={ghost.x}
        y2={ghost.y}
        stroke="var(--accent)"
        stroke-width="1.5"
        stroke-dasharray="5 4"
        pointer-events="none"
      />
      <circle cx={ghost.x} cy={ghost.y} r="3.5" fill="var(--accent)" pointer-events="none" />
    {/if}
  {/if}
  <g class="nodes">
    {#if !isFlow}
      <!-- groups first so members paint over their container -->
      {#each studio.groups as e (e.id)}
        <DiagramNode {e} {studio} selected={studio.selectedId === e.id} />
      {/each}
    {/if}
    {#each studio.nodes as e (e.id)}
      <DiagramNode {e} {studio} selected={studio.selectedId === e.id} />
    {/each}
  </g>
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: auto;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    background: #fff;
  }
  svg:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
  svg :global(.node-hit) {
    cursor: grab;
  }
  svg.dragging :global(.node-hit) {
    cursor: grabbing;
  }
  svg.connecting :global(.node-hit) {
    cursor: crosshair;
  }
</style>
