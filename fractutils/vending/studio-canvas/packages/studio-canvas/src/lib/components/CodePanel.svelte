<script lang="ts">
  import { generateSvelte, generateMermaid } from '../generate';
  import type { Studio } from '../studio.svelte';

  let { studio }: { studio: Studio } = $props();

  type Tab = 'svelte' | 'preview' | 'mermaid';
  let tab = $state<Tab>('svelte');
  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const isFlow = $derived(studio.mode === 'flow');
  // A mode switch resets the tab: Mermaid is flow's export, Svelte is layout's.
  // The effect depends only on the mode, so in-mode tab clicks are left alone.
  $effect(() => {
    void studio.mode;
    tab = studio.mode === 'flow' ? 'mermaid' : 'svelte';
  });
  const active = $derived(tab);

  const gen = $derived.by(() => {
    const doc = studio.documentJson; // subscribe to the live document
    try {
      return generateSvelte(doc as unknown as Parameters<typeof generateSvelte>[0]);
    } catch (err) {
      return { svelte: `/* generation error: ${String(err)} */`, html: '', warnings: [String(err)] };
    }
  });

  const mermaid = $derived.by(() => {
    if (!isFlow) return { mermaid: '', warnings: [] };
    try {
      return generateMermaid(studio.documentJson as unknown as Parameters<typeof generateMermaid>[0]);
    } catch (err) {
      return { mermaid: `/* export error: ${String(err)} */`, warnings: [String(err)] };
    }
  });

  const previewDoc = $derived(
    gen.html.replace(/^[\s\S]*?<html[^>]*>/, '<html>').replace(/<\/html>[\s\S]*$/, '</html>'),
  );

  const warnings = $derived(isFlow ? mermaid.warnings : gen.warnings);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      clearTimeout(timer);
      timer = setTimeout(() => (copied = false), 1600);
    } catch {
      copied = false;
    }
  }
</script>

<section class="panel" aria-label="Generated code">
  <div class="head">
    <span class="t">{isFlow ? 'export — flow graph → mermaid' : 'generate — document → svelte markup'}</span>
    <span class="actions">
      {#if isFlow}
        <button class="btn" class:on={active === 'mermaid'} aria-pressed={active === 'mermaid'} onclick={() => (tab = 'mermaid')}>Mermaid</button>
      {/if}
      <button class="btn" class:on={active === 'svelte'} aria-pressed={active === 'svelte'} onclick={() => (tab = 'svelte')}>Svelte</button>
      <button class="btn" class:on={active === 'preview'} aria-pressed={active === 'preview'} onclick={() => (tab = 'preview')}>Preview</button>
      <button class="btn" onclick={() => copyText(active === 'mermaid' ? mermaid.mermaid : active === 'preview' ? gen.html : gen.svelte)}>
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
    </span>
  </div>

  {#if active === 'mermaid'}
    <pre data-testid="generated-mermaid" class="light">{mermaid.mermaid}</pre>
  {:else if active === 'svelte'}
    <pre data-testid="generated-svelte">{gen.svelte}</pre>
  {:else}
    <!-- Sandboxed iframe: the preview's styles stay its own, and it renders like the real artifact -->
    <iframe
      data-testid="preview-frame"
      class="framebox"
      title="Generated wireframe preview"
      sandbox="allow-same-origin"
      srcdoc={previewDoc}
    ></iframe>
  {/if}

  {#if warnings.length > 0}
    <div class="warn">{warnings.join(' · ')}</div>
  {/if}
</section>

<style>
  .panel {
    border: 1px solid var(--rule);
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
    margin-top: 14px;
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
  .btn.on {
    background: var(--ink);
    border-color: var(--ink);
    color: #fff;
  }
  pre {
    background: #1e2230;
    color: #e8eaf2;
    padding: 14px 16px;
    overflow: auto;
    max-height: 320px;
    font-family: var(--mono);
    font-size: 0.72rem;
    line-height: 1.55;
    margin: 0;
  }
  pre.light {
    background: #f8f8f8;
    color: var(--ink);
  }
  .framebox {
    display: block;
    width: 100%;
    height: 340px;
    border: 0;
    background: var(--paper2);
  }
  .warn {
    padding: 6px 14px;
    font-family: var(--mono);
    font-size: 0.68rem;
    color: var(--bad);
    border-top: 1px solid var(--rule);
  }
</style>
