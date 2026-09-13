<script lang="ts">
  import CodePanel from '$lib/CodePanel.svelte'

  interface Props {
    data: {
      contentHtml: string
      jsonString: string
    }
  }

  let { data }: Props = $props()

  let copied = $state(false)
  async function copyJson() {
    try {
      await navigator.clipboard.writeText(data.jsonString)
      copied = true
      setTimeout(() => (copied = false), 1500)
    } catch {}
  }
</script>

<svelte:head>
  <title>Benchmarks & Methodology — fractalpop</title>
  <meta
    name="description"
    content="Reproducible, multi-engine performance and bundle size benchmark report comparing fractalpop against Sugar High, PrismJS, highlight.js, and Shiki."
  />
</svelte:head>

<div class="bench-page">
  <div class="bench-hero">
    <div class="bench-eyebrow">
      <span class="label label--accent">REPORT /</span>
      <span class="badge-tag">REPRODUCIBLE BENCHMARK</span>
    </div>
    <h1 class="bench-main-title">Benchmarks</h1>
    <p class="bench-main-sub">
      Multi-engine performance and browser bundle evaluation comparing
      <strong>fractalpop</strong> against <strong>Sugar High</strong>, <strong>PrismJS</strong>,
      <strong>highlight.js</strong>, and <strong>Shiki</strong> using identical TypeScript inputs.
    </p>
  </div>

  <div class="bench-rendered-md">
    {@html data.contentHtml}
  </div>

  <hr class="bench-separator" />

  <!-- Beautifully Styled JSON Snapshot Frame -->
  <section class="json-section">
    <div class="json-section-header">
      <span class="label label--accent">SNAPSHOT /</span>
      <h2 class="json-section-title">Machine-Readable Benchmark Snapshot</h2>
      <p class="json-section-desc">
        Complete JSON export generated via <code>node --expose-gc scripts/benchmark-large.mjs --json</code>.
        Contains per-run samples, environment hardware specs, and Bun bundle analysis.
      </p>
    </div>

    <div class="blueprint-box json-frame">
      <div class="blueprint-box-corner-tl">+</div>
      <div class="blueprint-box-corner-tr">+</div>
      <div class="blueprint-box-corner-bl">+</div>
      <div class="blueprint-box-corner-br">+</div>

      <div class="json-topbar">
        <div class="json-meta">
          <svg class="json-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span class="json-filename">docs/benchmark-results.json</span>
          <span class="json-badge">218 lines</span>
          <span class="json-badge">4.8 KiB</span>
        </div>

        <button class="json-copy-action" onclick={copyJson} type="button" aria-label="Copy JSON to clipboard">
          {#if copied}
            <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span class="copied-label">Copied!</span>
          {:else}
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
            <span>Copy Raw JSON</span>
          {/if}
        </button>
      </div>

      <div class="json-scroll-pane">
        <CodePanel
          code={data.jsonString}
          lang="json"
          copy={false}
          controls={false}
          lineNumbers={true}
        />
      </div>
    </div>
  </section>
</div>

<style>
  .bench-page {
    width: 100%;
  }

  .bench-hero {
    margin-bottom: var(--space-2xl);
  }

  .bench-eyebrow {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
  }

  .badge-tag {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    padding: 2px 8px;
    border-radius: 2px;
    color: var(--text-secondary);
  }

  .bench-main-title {
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0 0 var(--space-md);
  }

  .bench-main-sub {
    font-size: var(--text-lg);
    line-height: 1.6;
    color: var(--text-secondary);
    max-width: 48rem;
    margin: 0;
  }

  .bench-main-sub strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  .bench-rendered-md {
    margin-top: var(--space-xl);
  }

  .bench-rendered-md :global(h1) {
    display: none;
  }

  .bench-rendered-md :global(table) {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .bench-separator {
    border: none;
    border-top: 1px solid var(--border);
    margin: var(--space-3xl) 0;
  }

  .json-section {
    margin-top: var(--space-2xl);
    text-align: left;
  }

  .json-section-header {
    margin-bottom: var(--space-lg);
  }

  .json-section-title {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin: var(--space-xs) 0;
    letter-spacing: -0.01em;
  }

  .json-section-desc {
    color: var(--text-secondary);
    font-size: var(--text-md);
    line-height: 1.6;
    margin: 0;
  }

  .json-section-desc code {
    font-family: var(--font-mono);
    font-size: 0.88em;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    padding: 0.15em 0.35em;
    border-radius: 2px;
    color: var(--text-primary);
  }

  .json-frame {
    margin-top: var(--space-lg);
    background: var(--bg);
    border: 1px solid var(--border);
    position: relative;
    padding: 0;
    overflow: hidden;
  }

  .json-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
  }

  .json-meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .json-file-icon {
    width: 14px;
    height: 14px;
    color: var(--theme-color);
  }

  .json-filename {
    font-weight: 600;
    color: var(--text-primary);
  }

  .json-badge {
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 1px 6px;
    border-radius: 2px;
    color: var(--text-muted);
  }

  .json-copy-action {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 4px 10px;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .json-copy-action:hover {
    background: var(--state-hover);
    border-color: var(--border-strong);
  }

  .check-icon {
    width: 13px;
    height: 13px;
    color: #16a34a;
  }

  .copied-label {
    color: #16a34a;
  }

  .json-scroll-pane {
    max-height: 480px;
    overflow-y: auto;
  }

  .json-scroll-pane :global(.panel) {
    margin: 0;
    border: none;
    background: transparent;
  }
</style>
