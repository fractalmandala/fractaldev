<script lang="ts">
  import { Code } from '@fractalpop/svelte'
  import CodePanel from '$lib/CodePanel.svelte'
  import ThemeBar from '$lib/components/ThemeBar.svelte'
  import BenchmarkSection from '$lib/components/BenchmarkSection.svelte'
  import { reveal } from '$lib/actions/reveal'
  import { themes, type Mode } from '$lib/themes'
  import { samples } from '$lib/samples'
	import Candy from '$lib/icons/candy.svelte'

  // ---- playground state ----
  // `mode` switches the *preview* palette only; the page itself is light.
  let themeIndex = $state(0)
  let mode = $state<Mode>('dark')
  let sampleIndex = $state(0)
  let copied = $state(false)
  let capturing = $state(false)
  let windowEl: HTMLElement

  const theme = $derived(themes[themeIndex])
  const palette = $derived(mode === 'dark' ? theme.dark : theme.light)
  const sample = $derived(samples[sampleIndex])
  // Doc panels stay on one calm light palette so the page reads as a spec sheet.
  const docTheme = themes[0].light

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(sample.code)
      copied = true
      setTimeout(() => (copied = false), 1400)
    } catch {}
  }

  // Snapshot writes a real PNG to disk. The clipboard copy is a bonus on top —
  // it is the part browsers refuse most often, so it must never block the save.
  let snapshotError = $state('')
  async function screenshot() {
    if (!windowEl || capturing) return
    capturing = true
    snapshotError = ''
    try {
      const { toPng } = await import('html-to-image')
      const rect = windowEl.getBoundingClientRect()
      const dataUrl = await toPng(windowEl, { pixelRatio: 2, backgroundColor: palette.background })

      // 1. Save it.
      const name = `${sample.file.replace(/\.[^.]+$/, '')}-${theme.name.toLowerCase().replace(/\s+/g, '-')}.png`
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()

      // 2. Fly the thumbnail down to the corner so the save is visible.
      const preview = document.createElement('img')
      preview.src = dataUrl
      preview.alt = ''
      preview.className = 'screenshot-preview'
      preview.style.left = `${rect.left}px`
      preview.style.top = `${rect.top}px`
      preview.style.width = `${rect.width}px`
      preview.style.height = `${rect.height}px`
      document.body.appendChild(preview)
      requestAnimationFrame(() => preview.classList.add('screenshot-preview--minimized'))
      preview.addEventListener('transitionend', () => preview.remove(), { once: true })

      // 3. Best-effort clipboard.
      try {
        const blob = await (await fetch(dataUrl)).blob()
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      } catch {}
    } catch {
      snapshotError = 'Snapshot failed'
    } finally {
      capturing = false
    }
  }

  // ---- install ----
  const install = 'npm install fractalpop'
  let installCopied = $state(false)
  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(install)
      installCopied = true
      setTimeout(() => (installCopied = false), 1400)
    } catch {}
  }

  // ---- architecture index ----
  const architecture: [string, string, string][] = [
    ['01', 'Core Logic', '#core'],
    ['02', 'Token Palettes', '#basics'],
    ['03', 'Languages', '#languages'],
    ['04', 'Components', '/sveltekit'],
    ['05', 'Themes', '/theme'],
    ['06', 'Registry', '/registry'],
    ['07', 'Markdown', '/markdown'],
    ['08', 'Rules', '#rules'],
  ]

  // ---- doc snippets ----
  const lightCss = `:root {
  --fp-class: #8d85ff;
  --fp-identifier: #354150;
  --fp-sign: #8996a3;
  --fp-string: #00a99a;
  --fp-keyword: #f47067;
  --fp-comment: #a19595;
  --fp-jsxliterals: #bf7db6;
  --fp-entity: #665ac7;
  --fp-property: #4e8fdf;
}`
  const darkCss = `:root[data-theme='dark'] {
  --fp-class: #7eb5ff;
  --fp-identifier: #d4d4d4;
  --fp-sign: #8b949e;
  --fp-string: #88bbb6;
  --fp-keyword: #ffada8;
  --fp-comment: #8b8b8b;
  --fp-jsxliterals: #d2a8ff;
  --fp-entity: #b7adff;
  --fp-property: #79c0ff;
}`
  const lineCss = `.fp__line:nth-child(5),
.fp__line--highlighted {
  background: #fff8c5;
}`
  const langCode = `import { highlight, lang } from 'fractalpop/full'

highlight('const ready = true')              // TypeScript by default
highlight('print("hi")', { lang: 'python' }) // canonical name
highlight(styles, { lang: lang('yml') })     // yml -> yaml`
  const svelteCode = `<script>
  import { Highlight } from '@fractalpop/svelte'
<\/script>

<Highlight code={source} lang="sass" highlightLines={[2, 3]} />`
  const themeCode = `highlight(code, {
  lang: 'sass',
  cx: { keyword: 'font-bold', comment: 'italic' },
})`
  const mdsvexCode = `import { fractalpopHighlighter } from '@fractalpop/mdsvex'

// svelte.config.js — highlights fences in .svx
mdsvex({ highlight: { highlighter: fractalpopHighlighter } })`

  // ---- all languages ----
  const languageLabels: [string, string][] = [
    ['sass', 'Sass (indented)'], ['scss', 'SCSS'], ['svelte', 'Svelte (script + markup + style)'], ['javascript', 'JavaScript, JSX'],
    ['typescript', 'TypeScript, TSX'], ['css', 'CSS'], ['python', 'Python'], ['c', 'C'],
    ['go', 'Go'], ['java', 'Java'], ['rust', 'Rust'], ['json', 'JSON, JSONC'],
    ['diff', 'Diff, patch'], ['shell', 'Shell, Bash, Zsh'], ['cpp', 'C++'], ['csharp', 'C#'],
    ['sql', 'SQL'], ['html', 'HTML, XML'], ['yaml', 'YAML'], ['markdown', 'Markdown, MDX'],
    ['plaintext', 'Plain text'], ['ruby', 'Ruby'], ['kotlin', 'Kotlin'], ['swift', 'Swift'],
    ['php', 'PHP'], ['toml', 'TOML'], ['powershell', 'PowerShell'], ['dockerfile', 'Dockerfile'],
    ['graphql', 'GraphQL'], ['hcl', 'HCL, Terraform'], ['zig', 'Zig'], ['lua', 'Lua'],
  ]

  function showLanguage(value: string) {
    const i = samples.findIndex((s) => s.lang === value)
    if (i >= 0) {
      sampleIndex = i
      document.getElementById('core')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

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
      copied = true
      setTimeout(() => (copied = false), 1500)
    } catch {}
  }
</script>

<svelte:head>
  <title>fractalpop — syntax highlighting system</title>
  <meta
    name="description"
    content="fractalpop — fast, SSR-safe syntax highlighting for SvelteKit. 32 languages, zero hydration cost."
  />
</svelte:head>

<!-- HERO -->
<section class="col hero">
  <div class="hero-meta label" use:reveal>
    <span>v0</span>
    <span>32 languages</span>
  </div>
  <div class="row ycenter gap-sm wfull">
		<Candy/><h1 class="hero__wordmark" use:reveal={40}>fractal<span class="text-theme weight-600"><i>pop</i></span></h1>
	</div>
  <p class="hero__tagline measure" use:reveal={80}>
    fast syntax highlighting for <em>SvelteKit</em>.
  </p>
  <p class="hero__sub" use:reveal={120}>
    One engine behind components, markdown, and plain strings. SSR-safe and identical on
    both sides, so highlighted code costs nothing to hydrate — and themes are CSS
    variables, with no runtime to ship.
  </p>
  <button
    class="btn install"
    class:is-copied={installCopied}
    onclick={copyInstall}
    title="Copy"
    use:reveal={180}
  >
    {install}
    <span class="btn__hint">{installCopied ? 'copied' : 'copy'}</span>
  </button>

  <!-- ARCHITECTURE INDEX -->
  <nav class="index" aria-label="Architecture index">
    {#each architecture as [n, label, href], i}
      <a class="index__item" {href} use:reveal={i * 45}>
        <span class="index__n text-theme">{n}/</span>
        <span class="index__label">{label}</span>
      </a>
    {/each}
  </nav>
</section>

<!-- 01 — THE FOCAL OBJECT -->
<section class="col section" id="core">
  <div class="section__head">
    <span class="label label--accent">01 /</span>
    <h2 class="section__title">Core logic</h2>
  </div>
  <p class="lede">
    Every block below is rendered by the real engine. Pick a palette, pick a language, and
    read the output — there is no second code path.
  </p>

  <div class="stage" use:reveal>
    <div class="stage__bar">
      <span class="label">{theme.name} · {mode}</span>
      <ThemeBar bind:index={themeIndex} bind:mode />
    </div>
    <div class="frame" bind:this={windowEl}>
      <Code
        code={sample.code}
        lang={sample.lang}
        title={sample.file}
        lineNumbers
        theme={palette}
        fontSize="13px"
        padding="20px"
      />
    </div>
    <div class="controls">
      <label class="control">
        <select bind:value={sampleIndex}>
          {#each samples as s, i}<option value={i}>{s.label}</option>{/each}
        </select>
      </label>
      <button class="control" class:control--ok={copied} onclick={copyCode}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
        {copied ? 'Copied' : 'Copy'}
      </button>
      <button class="control" onclick={screenshot} disabled={capturing} title="Download a PNG of this panel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
        {capturing ? 'Saving…' : snapshotError || 'Save PNG'}
      </button>
    </div>
  </div>
</section>

<!-- 02 — TOKEN PALETTES -->
<section class="col section" id="basics">
  <div class="section__head">
    <span class="label label--accent">02 /</span>
    <h2 class="section__title">Token palettes</h2>
  </div>

  <div class="block">
    <h3 class="block__title">Light <span class="dim">&amp; dark</span></h3>
    <p class="lede">Match light and dark token palettes for your theme.</p>
    <div class="pair" use:reveal>
      <CodePanel title="light.css" code={lightCss} lang="css" theme={themes[0].light} copy={false} />
      <CodePanel title="dark.css" code={darkCss} lang="css" theme={themes[0].dark} />
    </div>
  </div>

  <div class="block">
    <h3 class="block__title">Line highlighting</h3>
    <p class="lede">
      Each line is a <code>.fp__line</code>, so target lines with CSS selectors or a custom
      line class.
    </p>
    <CodePanel title="lines.css" code={lineCss} lang="css" theme={docTheme} highlightLines={[[1, 2]]} />
  </div>
</section>

<!-- 03 — LANGUAGES -->
<section class="col section" id="languages">
  <div class="section__head">
    <span class="label label--accent">03 /</span>
    <h2 class="section__title">Languages</h2>
  </div>
  <p class="lede">
    <code>fractalpop/full</code> registers <b>32 languages</b> up front — no extra grammars
    or setup. The default <code>fractalpop</code> entry stays tiny with TypeScript and
    plaintext only; grow it with <code>registerLanguage()</code> or
    <code>importDefaults()</code>. Use <code>lang()</code> to resolve filenames, extensions
    and aliases to a canonical name.
  </p>
  <CodePanel title="languages.ts" code={langCode} lang="ts" theme={docTheme} highlightLines={[1]} />

  <details class="details">
    <summary>All languages <small>{languageLabels.length}</small></summary>
    <div class="table">
      <div class="table__head"><span>Value</span><span>Language &amp; relatives</span></div>
      {#each languageLabels as [value, label]}
        <button class="table__row" onclick={() => showLanguage(value)}>
          <code>{value}</code><span>{label}</span>
        </button>
      {/each}
    </div>
  </details>
</section>

<!-- 04 — COMPONENTS -->
<section class="col section" id="rules">
  <div class="section__head">
    <span class="label label--accent">04 /</span>
    <h2 class="section__title">Rules of engagement</h2>
  </div>

  <div class="block">
    <h3 class="block__title">Function over form</h3>
    <p class="lede">
      <code>@fractalpop/svelte</code> ships <b>&lt;Highlight&gt;</b>, <b>&lt;Code&gt;</b>,
      <b>&lt;Editor&gt;</b> and <b>&lt;FileTree&gt;</b> — every code block on this site is
      rendered by them. <a href="/sveltekit">Open the component sheet →</a>
    </p>
    <CodePanel title="Code.svelte" code={svelteCode} lang="svelte" theme={docTheme} />
  </div>

  <div class="block">
    <h3 class="block__title">Scalable by default</h3>
    <p class="lede">
      Set token colours with scoped CSS variables, then use <code>cx</code> for emphasis —
      Tailwind-friendly, no selectors needed. <a href="/theme">Copy a theme →</a>
    </p>
    <CodePanel title="theme.ts" code={themeCode} lang="ts" theme={docTheme} />
  </div>

  <div class="block">
    <h3 class="block__title">Same tokens outside components</h3>
    <p class="lede">
      <code>@fractalpop/mdsvex</code> highlights fences in <code>.svx</code>;
      <code>@fractalpop/remark</code> does the same for <code>.md</code> and
      <code>.mdx</code>. <a href="/markdown">See both on one page →</a>
    </p>
    <CodePanel title="svelte.config.js" code={mdsvexCode} lang="js" theme={docTheme} />
  </div>
</section>

<!--05 - BENCHMARK -->
<section class="col section" id="benchmark" data-bench>
  <!-- WebGPU experimental block -->

  <div class="section__head">
    <span class="label label--accent">05 /</span>
    <h2 class="section__title">Benchmarks and WebGPU Experimental</h2>
  </div>
   <p class="webgpu-desc">
      Async, language-agnostic highlighting with <code>gpu-lexer</code> and <code>fractalpop/gpu</code>.
      See the <a href="/sveltekit">components and SvelteKit integration.</a>
    </p>
	<div class="block">
    <div class="row between ycenter wrap gap-sm bench-controls-row">
      <div class="bench-legend">
        {#each engines as engine}
          <div class="legend-item">
            <span class="legend-dot" style="background-color: {engine.color}"></span>
            <span class="legend-name">{engine.name}</span>
          </div>
        {/each}
      </div>
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
      Measured with Node v24 on Apple Silicon. Median milliseconds per file; lower is better. Browser bundles minified with Bun.<br>
      <a href="/benchmarks" class="bench-footer-link">See full report &rarr;</a>
    </p>
	</div>
</section>

<style>
  .webgpu-desc {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0 0 1.25rem;
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

  .bench-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
    font-size: 0.88rem;
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
    margin-top: 1.25rem;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .bench-controls-row {
    margin-bottom: 1.5rem;
  }

  .bench-footer-link {
    font-weight: 600;
    color: var(--theme-color);
    text-decoration: underline;
    transition: opacity 0.15s ease;
  }

  .bench-footer-link:hover {
    opacity: 0.8;
  }
</style>


