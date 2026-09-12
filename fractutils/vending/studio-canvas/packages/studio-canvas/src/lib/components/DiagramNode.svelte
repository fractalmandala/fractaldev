<script lang="ts">
  import { draggable, resizable, connectable } from '../actions.js';
  import { ROLE_LABELS, type StudioEntity, type Studio } from '../studio.svelte';

  let { e, studio, selected = false }: { e: StudioEntity; studio: Studio; selected?: boolean } = $props();

  let textEl: SVGTextElement | undefined = $state();

  const isGroup = $derived(e.tag === 'Group');
  const isFlow = $derived(studio.mode === 'flow');
  const role = $derived(isFlow ? undefined : (e.role ?? (isGroup ? undefined : 'box')));
  const box = $derived(studio.boxOf(e.id));
  const chipW = $derived(Math.max(64, e.text.length * 8 + 18));
  const label = $derived(e.meta?.label ?? e.text);
  const resizing = $derived(studio.resizing?.id === e.id);
  const connecting = $derived(studio.connecting?.from === e.id);

  $effect(() => {
    // Hand the measured label box to the store — authored sizes stay floors, content grows.
    const text = label;
    void text;
    if (isGroup || !textEl) return;
    const r = textEl.getBoundingClientRect();
    const ctm = textEl.ownerSVGElement?.getScreenCTM();
    if (ctm && ctm.a) {
      studio.setMeasure(e.id, r.width / ctm.a + 28, 34);
    }
  });

  /** One-accent rule: only the focal CTA carries the accent fill (layout). */
  const accentFill = $derived(role === 'button' && e.focal);

  /** Per-entity color overrides — fall back to the role's default token. */
  const fillC = $derived(e.style?.fill);
  const strokeC = $derived(e.style?.stroke);
  const textC = $derived(e.style?.text);
</script>

<g
  class="node-hit"
  class:resizing
  class:connecting
  data-id={e.id}
  data-role={role ?? (isGroup ? 'group' : 'flow')}
  role="button"
  tabindex="0"
  aria-label="{label}{role ? ` (${ROLE_LABELS[role]})` : ''}{isFlow ? ' — alt-drag to connect' : e.containerId ? `, inside ${e.containerId}` : ''}. Arrow keys nudge by 4 pixels; Delete removes it."
  use:draggable={{ id: e.id, studio }}
  use:connectable={{ id: e.id, studio }}
>
  {#if isGroup}
    <!-- Groups are layout containers: nesting is the structure, so they only exist in layout mode. -->
    <rect
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      rx="10"
      fill={fillC ? fillC : 'rgba(45,49,66,.03)'}
      fill-opacity={fillC ? 0.12 : 1}
      stroke={strokeC ?? (selected ? 'var(--accent)' : 'var(--muted)')}
      stroke-width={selected ? 1.2 : 1}
      stroke-dasharray="4 3"
    />
    <rect x={box.x} y={box.y} width={chipW} height="22" rx="5" fill={strokeC ?? (selected ? 'var(--accent)' : 'var(--muted)')} />
    <text x={box.x + 10} y={box.y + 15} font-size="11" fill={textC ?? '#f5f5f5'} font-family="var(--mono)">
      {e.text}
    </text>
  {:else if isFlow}
    <!-- Flow node: a solid process box. Plain on purpose — sequence lives in the wires. -->
    <rect
      x={box.x} y={box.y} width={box.width} height={box.height} rx="8"
      fill={fillC ?? '#fff'}
      stroke={strokeC ?? (selected ? 'var(--accent)' : 'var(--ink)')}
      stroke-width={selected ? 1.6 : 1.2}
    />
    <text bind:this={textEl} x={box.x + box.width / 2} y={box.y + box.height / 2 + 4} text-anchor="middle" font-size="11.5" fill={textC ?? 'var(--ink)'}>
      {label}
    </text>
  {:else if role === 'input'}
    <rect
      x={box.x} y={box.y} width={box.width} height={box.height} rx="8"
      fill={fillC ?? 'var(--paper)'} stroke={strokeC ?? (selected ? 'var(--accent)' : 'var(--rule-solid)')} stroke-width={selected ? 1.4 : 1}
    />
    <text bind:this={textEl} x={box.x + 12} y={box.y + box.height / 2 + 4} font-size="11.5" fill={textC ?? 'var(--soft)'}>
      {label}
    </text>
  {:else if role === 'button'}
    <rect
      x={box.x} y={box.y} width={box.width} height={box.height} rx="8"
      fill={fillC ?? (accentFill ? 'var(--accent)' : '#fff')}
      stroke={strokeC ?? (selected || accentFill ? 'var(--accent)' : 'var(--ink)')}
      stroke-width={selected || accentFill ? 1.4 : 1}
    />
    <text
      bind:this={textEl}
      x={box.x + box.width / 2} y={box.y + box.height / 2 + 4}
      text-anchor="middle" font-size="11.5"
      fill={textC ?? (accentFill ? '#fff' : 'var(--ink)')}
    >
      {label}
    </text>
  {:else if role === 'text'}
    <rect x={box.x} y={box.y} width={box.width} height={box.height} rx="4" fill={fillC ?? 'transparent'} stroke={selected ? 'var(--accent)' : 'none'} stroke-width="1.2" />
    <text bind:this={textEl} x={box.x} y={box.y + box.height / 2 + 4} font-size="11.5" fill={textC ?? 'var(--ink)'}>
      {label}
    </text>
  {:else}
    <!-- box (and any unknown role): framed block -->
    <rect
      x={box.x} y={box.y} width={box.width} height={box.height} rx="10"
      fill={fillC ?? 'var(--paper)'} stroke={strokeC ?? (selected ? 'var(--accent)' : 'var(--ink)')} stroke-width={selected ? 1.4 : 1}
      stroke-dasharray="5 4"
    />
    <text bind:this={textEl} x={box.x + box.width / 2} y={box.y + box.height / 2 + 4} text-anchor="middle" font-size="11.5" fill={textC ?? 'var(--soft)'}>
      {label}
    </text>
  {/if}

  {#if selected && !isFlow}
    <rect
      x={box.x - 3} y={box.y - 3} width={box.width + 6} height={box.height + 6} rx="9"
      fill="none" stroke="var(--accent)" stroke-width="1" stroke-dasharray="2 3"
      pointer-events="none" opacity="0.9"
    />
    <!-- SE resize handle: stops pointer propagation before draggable sees it -->
    <rect
      data-handle="se"
      class="handle"
      x={box.x + box.width - 6}
      y={box.y + box.height - 6}
      width="12"
      height="12"
      rx="2"
      fill="#fff"
      stroke="var(--accent)"
      stroke-width="1.5"
      use:resizable={{ id: e.id, studio }}
    />
  {/if}
</g>

<style>
  g {
    outline: none;
  }
  .handle {
    cursor: nwse-resize;
  }
  .connecting rect {
    stroke: var(--accent);
  }
</style>
