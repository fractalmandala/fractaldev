<script lang="ts">
  import { ROLE_LABELS, type Primitive, type Mode, type Studio } from '../studio.svelte';

  let { studio }: { studio: Studio } = $props();

  let elbowOn = $state(true);
  let portsAuto = $state(true);
  let message = $state('');
  let badId = $state('');
  let timer: ReturnType<typeof setTimeout> | undefined;

  const PRIMITIVES: Primitive[] = ['box', 'row', 'col', 'grid', 'input', 'button', 'text'];
  const MODES: { id: Mode; label: string; hint: string }[] = [
    { id: 'layout', label: 'Layout', hint: 'wireframe tree → Svelte' },
    { id: 'flow', label: 'Flow', hint: 'flowchart graph → Mermaid' },
  ];

  const isFlow = $derived(studio.mode === 'flow');
  const sel = $derived(studio.selectedEntity);
  const selRole = $derived(sel && sel.tag !== 'Group' ? (sel.role ?? 'box') : null);
  const selEdge = $derived(studio.selectedConnection);
  /** Visible copy: the group title, or the leaf's override label. */
  const selText = $derived(sel ? (sel.tag === 'Group' ? sel.text : (sel.meta?.label ?? sel.text)) : '');

  function say(text: string) {
    message = text;
    clearTimeout(timer);
    timer = setTimeout(() => (message = ''), 2600);
  }

  function applyRole(role: Primitive) {
    if (!sel) return;
    studio.setRole(sel.id, role);
    say(`${ROLE_LABELS[role]} — regenerate to see it in the markup`);
  }

  function onNameInput(ev: Event) {
    if (!sel) return;
    studio.relabel(sel.id, (ev.target as HTMLInputElement).value, true);
  }

  function onIdInput(ev: Event) {
    if (!sel) return;
    badId = '';
    try {
      studio.renameId(sel.id, (ev.target as HTMLInputElement).value);
    } catch (err) {
      badId = err instanceof Error ? err.message : String(err);
    }
  }

  function onColor(which: 'fill' | 'stroke' | 'text', value: string) {
    if (!sel) return;
    studio.setStyle(sel.id, { [which]: value }, true);
  }

  function onEdgeColor(which: 'stroke' | 'text', value: string) {
    if (!selEdge) return;
    studio.setEdgeStyle(selEdge.id, { [which]: value }, true);
  }

  function setMode(next: Mode) {
    studio.setMode(next);
    badId = '';
    say(next === 'layout' ? 'layout — nesting is the structure; no wires' : 'flow — alt-drag between nodes to connect');
  }
</script>

<div class="bar">
  <div class="modes" role="tablist" aria-label="Document type">
    {#each MODES as m (m.id)}
      <button
        class="btn mode"
        class:on={studio.mode === m.id}
        role="tab"
        aria-selected={studio.mode === m.id}
        title={m.hint}
        onclick={() => setMode(m.id)}
      >
        {m.label}
      </button>
    {/each}
  </div>
  <span class="divider"></span>
  {#if isFlow}
    <button
      class="btn"
      aria-pressed={!elbowOn}
      onclick={() => {
        elbowOn = studio.toggleElbow();
        say(elbowOn ? 'corridor routing (elbow)' : 'straight segments — held out of the corridor batch');
      }}
    >
      Elbow: {elbowOn ? 'on' : 'off'}
    </button>
    <button
      class="btn"
      aria-pressed={!portsAuto}
      onclick={() => {
        portsAuto = !studio.togglePorts();
        say(portsAuto ? 'faces chosen by the router' : 'faces pinned: authoredFromFace / authoredToFace');
      }}
    >
      Ports: {portsAuto ? 'auto' : 'right→left'}
    </button>
  {/if}
  <button class="btn" onclick={() => { studio.addNode(); say(isFlow ? 'node added — alt-drag to connect' : 'box added'); }}>
    {isFlow ? 'Add node' : 'Add box'}
  </button>
  <button class="btn" disabled={!studio.canUndo} onclick={() => { studio.undo(); say('undo'); }}>
    Undo
  </button>
  <button class="btn" onclick={() => { studio.reset(); say(isFlow ? 'reset to the seed flowchart' : 'reset to the seed wireframe'); }}>
    Reset
  </button>
  <span class="spacer"></span>
  <span class="pill" class:ok={!message} role="status" aria-live="polite">
    {message || (isFlow ? '⌥-drag a node to another to connect · click a wire to select it' : 'drop shapes into containers — nesting is the structure')}
  </span>
</div>

{#if selEdge}
  <!-- Edge inspector (flow): label, wire/label colors, straight toggle, delete -->
  <div class="inspector" aria-label="Selected connection">
    <span class="selname">{selEdge.from} → {selEdge.to}</span>
    <label class="field">
      <span>label</span>
      <input
        type="text"
        value={selEdge.label ?? ''}
        placeholder="none"
        oninput={(e) => studio.setEdgeLabel(selEdge.id, (e.currentTarget as HTMLInputElement).value, true)}
        aria-label="Connection label"
      />
    </label>
    <div class="colors" role="group" aria-label="Wire colors">
      <label class="swatch" title="Wire color">
        <input type="color" value={selEdge.style?.stroke?.match(/^#[0-9a-fA-F]{6}/)?.[0] ?? '#4f5d75'} oninput={(e) => onEdgeColor('stroke', e.currentTarget.value)} />
        <span class="ring" style="border-color: {selEdge.style?.stroke ?? 'var(--muted)'}"></span>
      </label>
      <label class="swatch" title="Label color">
        <input type="color" value={selEdge.style?.text?.match(/^#[0-9a-fA-F]{6}/)?.[0] ?? '#4f5d75'} oninput={(e) => onEdgeColor('text', e.currentTarget.value)} />
        <span class="txt" style="color: {selEdge.style?.text ?? 'var(--muted)'}">A</span>
      </label>
      {#if selEdge.style}
        <button class="chip" onclick={() => { studio.setEdgeStyle(selEdge.id, { stroke: '', text: '' }); say('wire colors reset'); }}>reset</button>
      {/if}
    </div>
    <button
      class="chip"
      class:on={selEdge.connectorStyle === 'straight'}
      aria-pressed={selEdge.connectorStyle === 'straight'}
      onclick={() => {
        studio.setEdgeStyle(selEdge.id, {});
        const c = studio.connections.find((k) => k.id === selEdge.id);
        if (c) c.connectorStyle = c.connectorStyle === 'straight' ? 'elbow' : 'straight';
        say(c?.connectorStyle === 'straight' ? 'straight — drawn center to center' : 'corridor routing');
      }}
    >
      straight
    </button>
    <button class="chip danger" onclick={() => { studio.deleteConnection(selEdge.id); say('connection deleted'); }}>Delete ⌫</button>
  </div>
{/if}

{#if sel}
  <div class="inspector" aria-label="Selected primitive">
    <label class="field">
      <span>text</span>
      <input
        type="text"
        value={selText}
        placeholder="visible copy"
        oninput={onNameInput}
        aria-label="Visible text"
      />
    </label>
    <label class="field">
      <span>id</span>
      <input
        type="text"
        value={sel.id}
        spellcheck="false"
        oninput={onIdInput}
        aria-label="Entity id (becomes the generated class name)"
      />
    </label>
    {#if badId}<span class="iderr" role="alert">{badId}</span>{/if}
    <div class="colors" role="group" aria-label="Colors">
      {#if !isFlow}
        <label class="swatch" title="Fill / background">
          <input type="color" value={sel.style?.fill?.match(/^#[0-9a-fA-F]{6}/)?.[0] ?? '#f5f5f5'} oninput={(e) => onColor('fill', e.currentTarget.value)} />
          <span style="background: {sel.style?.fill ?? 'var(--paper)'}"></span>
        </label>
      {/if}
      <label class="swatch" title="Border / stroke">
        <input type="color" value={sel.style?.stroke?.match(/^#[0-9a-fA-F]{6}/)?.[0] ?? '#4f5d75'} oninput={(e) => onColor('stroke', e.currentTarget.value)} />
        <span class="ring" style="border-color: {sel.style?.stroke ?? 'var(--rule-solid)'}"></span>
      </label>
      <label class="swatch" title="Text color">
        <input type="color" value={sel.style?.text?.match(/^#[0-9a-fA-F]{6}/)?.[0] ?? '#2d3142'} oninput={(e) => onColor('text', e.currentTarget.value)} />
        <span class="txt" style="color: {sel.style?.text ?? 'var(--ink)'}">A</span>
      </label>
      {#if sel.style}
        <button class="chip" onclick={() => { studio.setStyle(sel.id, { fill: '', stroke: '', text: '' }); say('colors reset'); }}>reset</button>
      {/if}
    </div>
    {#if !isFlow}
      <span class="selname">{sel.tag === 'Group' ? 'container' : ROLE_LABELS[selRole ?? 'box']}</span>
      {#if selRole}
        <div class="roles" role="toolbar" aria-label="Primitive role">
          {#each PRIMITIVES as r (r)}
            <button
              class="chip"
              class:on={selRole === r}
              aria-pressed={selRole === r}
              onclick={() => applyRole(r)}
            >
              {ROLE_LABELS[r]}
            </button>
          {/each}
        </div>
      {/if}
      {#if selRole === 'grid'}
        <label class="z">
          columns
          <button class="chip" aria-label="fewer columns" onclick={() => studio.setGridColumns(sel.id, (sel.meta?.z ?? 2) - 1)}>−</button>
          <b>{sel.meta?.z ?? 2}</b>
          <button class="chip" aria-label="more columns" onclick={() => studio.setGridColumns(sel.id, (sel.meta?.z ?? 2) + 1)}>+</button>
        </label>
      {/if}
    {/if}
    <button class="chip danger" onclick={() => { studio.deleteEntity(sel.id); say('deleted'); }}>Delete ⌫</button>
  </div>
{/if}

<style>
  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin: 16px 0 10px;
  }
  .spacer {
    flex: 1;
  }
  .modes {
    display: inline-flex;
    border: 1px solid var(--rule-solid);
    border-radius: 8px;
    overflow: hidden;
  }
  .mode {
    border: none;
    border-radius: 0;
    min-height: 32px;
  }
  .mode + .mode {
    border-left: 1px solid var(--rule-solid);
  }
  .mode.on {
    background: var(--ink);
    color: #fff;
  }
  .divider {
    width: 1px;
    height: 22px;
    background: var(--rule);
  }
  .inspector {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin: 0 0 10px;
    padding: 8px 10px;
    border: 1px solid var(--rule);
    border-radius: 8px;
    background: #fff;
  }
  .field {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .field span {
    font-family: var(--mono);
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--soft);
  }
  .field input {
    font-family: var(--mono);
    font-size: 0.72rem;
    color: var(--ink);
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: 6px;
    padding: 5px 8px;
    width: 110px;
    min-height: 28px;
  }
  .field input:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .iderr {
    font-family: var(--mono);
    font-size: 0.64rem;
    color: var(--bad);
    max-width: 200px;
  }
  .colors {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }
  .swatch {
    position: relative;
    display: inline-flex;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid var(--rule);
  }
  .swatch input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
  .swatch span {
    display: block;
    width: 100%;
    height: 100%;
  }
  .swatch .ring {
    box-sizing: border-box;
    border-width: 3px;
    border-style: solid;
    background: #fff;
  }
  .swatch .txt {
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 13px;
    background: #fff;
    font-family: var(--sans);
  }
  .selname {
    font-family: var(--mono);
    font-size: 0.72rem;
    color: var(--ink);
    font-weight: 600;
    margin-right: 4px;
  }
  .roles {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .chip {
    font-family: var(--mono);
    font-size: 0.64rem;
    letter-spacing: 0.05em;
    padding: 5px 9px;
    border-radius: 999px;
    border: 1px solid var(--rule-solid);
    background: #fff;
    color: var(--muted);
    cursor: pointer;
    min-height: 26px;
  }
  .chip:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  .chip.on {
    background: var(--ink);
    border-color: var(--ink);
    color: #fff;
  }
  .chip.danger {
    color: var(--bad);
    border-color: var(--bad);
  }
  .chip.danger:hover {
    background: var(--bad);
    color: #fff;
  }
  .z {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--mono);
    font-size: 0.68rem;
    color: var(--muted);
  }
</style>
