<script lang="ts">
  import { toPathData } from '../path.js';
  import type { RoutedEdge, Studio } from '../studio.svelte.js';

  let { route, studio, draft = false }: { route: RoutedEdge; studio: Studio; draft?: boolean } = $props();

  const d = $derived(toPathData(route.pts, 6));
  const selected = $derived(studio.selectedEdgeId === route.id);
  const stroke = $derived(route.colors?.stroke ?? (draft ? 'rgba(79,93,117,.45)' : selected ? 'var(--accent)' : '#4f5d75'));
  const strokeWidth = $derived(draft ? 1.2 : selected ? 2.4 : 1.5);
  const labelColor = $derived(route.colors?.text ?? '#4f5d75');

  function onDown(ev: PointerEvent) {
    if (ev.button !== 0) return;
    ev.stopPropagation();
    studio.selectEdge(route.id);
  }
</script>

<!-- invisible fat hit-path under the visible wire: edges are selectable in flow mode -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<path
  class="hit"
  {d}
  fill="none"
  stroke="transparent"
  stroke-width="12"
  role="button"
  tabindex="-1"
  aria-label="Select connection {route.id}"
  onpointerdown={onDown}
/>
<path {d} fill="none" {stroke} stroke-width={strokeWidth} marker-end="url(#arrow)" pointer-events="none" />

{#if route.label && route.textPlacement}
  {@const tp = route.textPlacement}
  {@const cx = tp.x + tp.width / 2}
  {@const cy = tp.y + tp.height / 2}
  <g class="label">
    <rect
      x={cx - tp.width / 2}
      y={cy - tp.height / 2}
      width={tp.width}
      height={tp.height}
      rx="4"
      fill={draft ? 'rgba(245,245,245,.85)' : '#f5f5f5'}
    />
    <text x={cx} y={cy + 3.5} text-anchor="middle" font-size="10" fill={labelColor} font-family="var(--mono)">
      {route.label}
    </text>
  </g>
{/if}

<style>
  .hit {
    cursor: pointer;
  }
  .label {
    pointer-events: none;
  }
  text {
    letter-spacing: 0.04em;
  }
</style>
