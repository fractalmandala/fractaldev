<script lang="ts">
  import type { Studio } from '../studio.svelte';

  let { studio }: { studio: Studio } = $props();

  const isFlow = $derived(studio.mode === 'flow');
</script>

<aside class="side" aria-label="Router statistics">
  <h2>{isFlow ? 'Router truth' : 'Document'}</h2>
  {#if isFlow}
    <div class="row"><span>route batch</span><b>{studio.routerStats.batch}</b></div>
    <div class="row"><span>corridor vs fallback</span><b data-testid="router-status">{studio.routerStats.status}</b></div>
    <div class="row"><span>last route time</span><b>{studio.routerStats.ms}</b></div>
  {/if}
  <div class="row">
    <span>{isFlow ? 'nodes / edges' : 'shapes / containers'}</span>
    <b>{studio.nodes.length + studio.groups.length} / {isFlow ? studio.connections.length : studio.groups.length}</b>
  </div>
  <div class="row"><span>coords on 4-grid</span><b>{studio.onGrid ? 'yes ✓' : 'no'}</b></div>
  <p class="note">
    {#if isFlow}
      <code>LayoutManager</code> → <code>routeCorridorConnectionBatch</code> runs inside a
      <code>$derived</code>; boxes come from measured DOM with authored sizes as floors.
      Straight connections join after the batch, exactly as the render package orders it.
      Export skips geometry on purpose — Mermaid owns the routing.
    {:else}
      A layout document is a <em>tree</em>: membership via <code>containerId</code>, no
      connectors. Nesting is what compiles to markup — flex axes, gaps, and padding are
      inferred from the measured geometry in <code>generate.ts</code>.
    {/if}
  </p>
</aside>

<style>
  .side {
    border: 1px solid var(--rule);
    border-radius: 10px;
    background: #fff;
    padding: 14px;
    align-self: start;
  }
  h2 {
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 600;
    margin-bottom: 8px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-family: var(--mono);
    font-size: 0.7rem;
    color: var(--muted);
    padding: 4px 0;
    border-bottom: 1px solid var(--rule);
  }
  .row:last-of-type {
    border-bottom: none;
  }
  .row b {
    color: var(--ink);
    font-weight: 500;
  }
  .note {
    font-size: 0.72rem;
    color: var(--soft);
    font-family: var(--mono);
    margin-top: 10px;
    line-height: 1.6;
  }
</style>
