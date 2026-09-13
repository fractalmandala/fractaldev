<script lang="ts">
  interface EngineData {
    name: string
    color: string
    minified: number
    gzip: number
    largeMs: number
  }

  const engines: EngineData[] = [
    { name: 'fractalpop', color: '#ff6352', minified: 12.35, gzip: 5.28, largeMs: 97.70 },
    { name: 'Sugar High', color: '#f59e0b', minified: 27.29, gzip: 10.09, largeMs: 101.81 },
    { name: 'PrismJS', color: '#ba68c8', minified: 14.57, gzip: 5.57, largeMs: 100.31 },
    { name: 'highlight.js', color: '#7986cb', minified: 29.49, gzip: 11.28, largeMs: 127.61 },
    { name: 'Shiki', color: 'var(--color-alt3)', minified: 364.20, gzip: 72.79, largeMs: 858.15 },
  ]

  const maxMinified = Math.max(...engines.map((e) => e.minified))
  const maxGzip = Math.max(...engines.map((e) => e.gzip))
  const maxLargeMs = Math.max(...engines.map((e) => e.largeMs))

  let copiedtwice = $state(false)
  async function copyInstalltwice() {
    try {
      await navigator.clipboard.writeText('npm install fractalpop gpu-lexer')
      copiedtwice = true
      setTimeout(() => (copiedtwice = false), 1500)
    } catch {}
  }
</script>

<section class="bench-section" data-bench>
  <!-- WebGPU experimental block -->
  <div class="webgpu-card">
    <h3 class="webgpu-title">WebGPU experimental</h3>
    <p class="webgpu-desc">
      Async, language-agnostic highlighting with <code>gpu-lexer</code> and <code>fractalpop/gpu</code>.
      See the <a href="/sveltekit">Svelte integration</a> for components.
    </p>

    <button class="install-pill" onclick={copyInstalltwice} type="button">
      <span>npm install fractalpop gpu-lexer</span>
      {#if copiedtwice}<span class="copied-badge">copied!</span>{/if}
    </button>

    <div class="code-box">
      <div class="code-box__header">gpu-highlight.js</div>
      <pre><code><span class="kw">import</span> &#123; <span class="fn">highlight</span> &#125; <span class="kw">from</span> <span class="str">'fractalpop/gpu'</span>

<span class="kw">const</span> html = <span class="kw">await</span> <span class="fn">highlight</span>(source)</code></pre>
    </div>
  </div>

  <!-- Main Benchmark block -->
  <div class="bench-card">
    <h2 class="bench-title">Benchmark</h2>

    <div class="row between ycenter wrap gap-sm bench-controls-row">
      <div class="bench-legend" style="margin-bottom: 0;">
        {#each engines as engine}
          <div class="legend-item">
            <span class="legend-dot" style="background-color: {engine.color}"></span>
            <span class="legend-name">{engine.name}</span>
          </div>
        {/each}
      </div>
      <a href="/benchmarks" class="bench-report-link">see full report &rarr;</a>
    </div>

    <div class="benchmark-cards">
      <!-- Card 1: Minified bundle -->
      <div class="benchmark-card">
        <h4 class="benchmark-card-title">Minified bundle</h4>
        <div class="benchmark-rows">
          {#each engines as engine}
            <div class="benchmark-row">
              <div class="benchmark-row-track">
                <div
                  class="benchmark-row-fill"
                  style="width: {(engine.minified / maxMinified) * 100}%; background-color: {engine.color};"
                ></div>
              </div>
              <span class="benchmark-row-val">{engine.minified.toFixed(2)} <span class="benchmark-row-unit">KiB</span></span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Card 2: Gzip bundle -->
      <div class="benchmark-card">
        <h4 class="benchmark-card-title">Gzip bundle</h4>
        <div class="benchmark-rows">
          {#each engines as engine}
            <div class="benchmark-row">
              <div class="benchmark-row-track">
                <div
                  class="benchmark-row-fill"
                  style="width: {(engine.gzip / maxGzip) * 100}%; background-color: {engine.color};"
                ></div>
              </div>
              <span class="benchmark-row-val">{engine.gzip.toFixed(2)} <span class="benchmark-row-unit">KiB</span></span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Card 3: 500 KiB file runtime -->
      <div class="benchmark-card">
        <h4 class="benchmark-card-title">500 KiB file</h4>
        <div class="benchmark-rows">
          {#each engines as engine}
            <div class="benchmark-row">
              <div class="benchmark-row-track">
                <div
                  class="benchmark-row-fill"
                  style="width: {(engine.largeMs / maxLargeMs) * 100}%; background-color: {engine.color};"
                ></div>
              </div>
              <span class="benchmark-row-val">{engine.largeMs.toFixed(2)} <span class="benchmark-row-unit">ms</span></span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <p class="bench-footer">
      Measured with Node v24 on Apple Silicon. Median milliseconds per file; lower is better. Browser bundles minified with Bun.
      <a href="/benchmarks" class="bench-footer-link">See full report &rarr;</a>
    </p>
  </div>
</section>

<style>
  .bench-section {
    max-width: var(--col);
    margin: var(--space-3xl) auto;
    padding: 0 var(--gutter);
    font-family: inherit;
  }

  .webgpu-card {
    margin-bottom: var(--space-3xl);
    text-align: left;
  }

  .webgpu-title {
    font-size: var(--text-2xl);
    font-weight: 700;
    margin: 0 0 var(--space-xs);
    letter-spacing: -0.01em;
    color: var(--text-primary);
  }

  .webgpu-desc {
    color: var(--text-secondary);
    font-size: var(--text-md);
    line-height: 1.6;
    margin: 0 0 var(--space-md);
  }

  .webgpu-desc code {
    font-family: var(--font-mono);
    font-size: 0.88em;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    padding: 0.15em 0.35em;
    border-radius: 2px;
    color: var(--text-primary);
  }

  .webgpu-desc a {
    color: var(--theme-color);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .install-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 0.45rem 1rem;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    cursor: pointer;
    color: var(--text-primary);
    transition: background 0.15s ease, border-color 0.15s ease;
    margin-bottom: var(--space-md);
  }

  .install-pill:hover {
    background: var(--state-hover);
    border-color: var(--border-strong);
  }

  .copied-badge {
    font-size: var(--text-xs);
    color: #22c55e;
    font-weight: 600;
  }

  .code-box {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: var(--space-lg) var(--space-xl);
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  .code-box__header {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-bottom: var(--space-md);
  }

  .code-box pre {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: 1.6;
    text-align: left;
    display: inline-block;
  }

  .code-box .kw {
    color: var(--color-alt2);
  }
  .code-box .fn {
    color: var(--color-alt);
  }
  .code-box .str {
    color: var(--theme-color);
  }

  .bench-card {
    text-align: left;
  }

  .bench-title {
    font-size: var(--text-3xl);
    font-weight: 700;
    margin: 0 0 var(--space-md);
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .bench-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: var(--space-md);
    font-size: var(--text-sm);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .legend-dot {
    width: 9px;
    height: 9px;
    border-radius: 2px;
  }

  .bench-footer {
    margin-top: var(--space-md);
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .bench-controls-row {
    margin-bottom: var(--space-md);
  }

  .bench-report-link,
  .bench-footer-link {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--theme-color);
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: opacity 0.15s ease;
  }

  .bench-report-link:hover,
  .bench-footer-link:hover {
    opacity: 0.8;
  }
</style>
