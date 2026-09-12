<script lang="ts">
  import type { Studio } from '../studio.svelte';

  let { studio }: { studio: Studio } = $props();

  let importBox = $state('');
  let feedback = $state('');
  let ok = $state(true);
  let copied = $state(false);

  const json = $derived(JSON.stringify(studio.documentJson, null, 2));

  async function copy() {
    try {
      await navigator.clipboard.writeText(json);
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch {
      feedback = 'clipboard blocked — select the JSON manually';
      ok = false;
    }
  }

  function apply() {
    try {
      studio.applyDocument(JSON.parse(importBox));
      feedback = 'applied — canvas rebuilt from your document';
      ok = true;
    } catch (err) {
      feedback = `invalid: ${err instanceof Error ? err.message : String(err)}`;
      ok = false;
    }
  }
</script>

<section class="panel" aria-label="Document panel">
  <div class="head">
    <span class="t">document — measured roundtrip json (live)</span>
    <span class="actions">
      <button class="btn" onclick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>
      <button class="btn" onclick={apply}>Apply JSON ↓</button>
    </span>
  </div>
  <pre data-testid="document-json">{json}</pre>
  <div class="importrow">
    <textarea
      bind:value={importBox}
      class="importbox"
      spellcheck="false"
      aria-label="Paste document JSON to apply"
      placeholder={'{"entities":[…],"connections":[…]}'}
    ></textarea>
    {#if feedback}
      <span class="feed" class:bad={!ok} class:good={ok}>{feedback}</span>
    {/if}
  </div>
</section>

<style>
  .panel {
    border: 1px solid var(--rule);
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--rule);
    background: var(--paper);
  }
  .t {
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--soft);
  }
  .actions {
    display: flex;
    gap: 8px;
  }
  pre {
    background: #1e2230;
    color: #e8eaf2;
    padding: 14px 16px;
    overflow: auto;
    max-height: 240px;
    font-family: var(--mono);
    font-size: 0.74rem;
    line-height: 1.55;
    margin: 0;
  }
  .importrow {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 14px;
  }
  .importbox {
    width: 100%;
    font-family: var(--mono);
    font-size: 0.72rem;
    border: 1px solid var(--rule);
    border-radius: 6px;
    padding: 8px;
    min-height: 80px;
    color: var(--ink);
    background: var(--paper);
  }
  .importbox:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .feed {
    font-family: var(--mono);
    font-size: 0.7rem;
  }
  .feed.bad {
    color: var(--bad);
  }
  .feed.good {
    color: var(--ok);
  }
</style>
