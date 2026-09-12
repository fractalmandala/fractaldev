<script lang="ts">
  import { Code, Editor, FileTree, type TreeItem } from '@fractalpop/svelte'
  import CodePanel from '$lib/components/ui/CodePanel.svelte'
  import { themes } from '$lib/data/fpopthemes'
  import '$lib/styles/fractalpop-demo.sass'
  import folderIcon from '$lib/icons/folder.svg?raw'
  import svelteIcon from '$lib/icons/svelte.svg?raw'
  import sassIcon from '$lib/icons/sass.svg?raw'
  import jsonIcon from '$lib/icons/json.svg?raw'
  import markdownIcon from '$lib/icons/markdown.svg?raw'

  const genericFile =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"><path d="M4 2h5l3 3v9H4Z"/><path d="M9 2v4h3"/></svg>'
  function iconFor(name: string, directory: boolean): string {
    if (directory) return folderIcon
    if (name.endsWith('.svelte')) return svelteIcon
    if (name.endsWith('.sass') || name.endsWith('.scss')) return sassIcon
    if (name.endsWith('.json')) return jsonIcon
    if (name.endsWith('.md')) return markdownIcon
    return genericFile
  }

  // shared theme selection for all live demos; light/dark driven by data-page
  let themeIndex = $state(0)
  let dark = $state(true)
  const theme = $derived(themes[themeIndex])
  function toggle() {
    dark = !dark
    if (typeof document !== 'undefined') document.documentElement.dataset.page = dark ? 'dark' : 'light'
  }

  // <Editor> live state
  let editorValue = $state(`function greet(name) {
  // try editing me — Tab indents
  return \`Hi \${name}\`
}`)

  // <FileTree> demo
  const files: Record<string, string> = {
    'src/routes/+page.svelte': `<script>\n  import { Highlight } from '@fractalpop/svelte'\n  let { source } = $props()\n<\/script>\n\n<Highlight code={source} lang="sass" />`,
    'src/lib/Card.svelte': `<script>\n  let { title } = $props()\n<\/script>\n\n<article class="card">\n  <h3>{title}<\/h3>\n<\/article>`,
    'src/lib/button.ts': `export function button(node: HTMLElement) {\n  node.classList.add('btn')\n}`,
    'src/app.sass': `.btn\n  color: $brand\n  &:hover\n    opacity: 0.8`,
    'README.md': `# fractalpop demo\n\nSvelte-first syntax highlighting.\n\n- **32 languages**\n- indented \`sass\``,
    'package.json': `{\n  "name": "app",\n  "type": "module"\n}`,
  }
  const paths = Object.keys(files)
  let activeFile = $state('src/routes/+page.svelte')
  const activeLang = $derived(activeFile.split('.').pop() || 'txt')

  // <Code> language tabs
  const codeTabs = ['sass', 'ts', 'python', 'rust', 'go', 'json'] as const
  let codeTab = $state<(typeof codeTabs)[number]>('sass')
  const codeSamples: Record<string, string> = {
    sass: `// project card\n$brand: hsl(212, 90%, 55%)\n\n.card\n  color: $brand\n  &:hover\n    background: darken($brand, 8%)`,
    ts: `type User = { name: string }\nconst u: User = { name: 'Ada' }\nconst re = /^\\w+$/`,
    python: `def fib(n: int) -> int:\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)`,
    rust: `fn main() {\n    let xs = vec![1, 2, 3];\n    println!("{}", xs.len());\n}`,
    go: `package main\n\nfunc main() {\n    msg := "hi"\n    println(msg)\n}`,
    json: `{\n  "name": "fractalpop",\n  "sass": true\n}`,
  }

  // API tables
  const codeProps: [string, string, string][] = [
    ['code', 'string · required', 'Source to highlight.'],
    ['lang', 'string', "Language id / alias — 'sass', 'ts', 'python' …"],
    ['theme', 'Theme', 'A palette, or a { light, dark } pair (light-dark()).'],
    ['title', 'string', 'Filename shown in the header.'],
    ['controls', 'boolean · false', 'Show the macOS header dots.'],
    ['lineNumbers', 'boolean · false', 'Show one-based line numbers.'],
    ['highlightLines', '(number | [number, number])[]', 'Lines and inclusive ranges to mark.'],
    ['startingLineNumber', 'number · 1', 'First line number.'],
    ['cx / mark / markLine', 'DisplayOptions', 'Per-token and per-line customization.'],
    ['padding / fontSize / lineNumbersWidth', 'string', 'Layout overrides.'],
  ]
  const editorProps: [string, string, string][] = [
    ['value', 'string · bindable', 'Controlled source text (bind:value).'],
    ['title', 'string | null', 'Editable filename in the header.'],
    ['lang', 'string', 'Canonical language.'],
    ['theme', 'Theme', 'Token and component colors.'],
    ['controls', 'boolean · true', 'Show header controls.'],
    ['lineNumbers', 'boolean · true', 'Show one-based line numbers.'],
    ['indent', "string · '  '", 'Inserted on Tab; Shift+Tab outdents.'],
    ['onchange', '(code) => void', 'Runs when the source changes.'],
    ['onchangetitle', '(title) => void', 'Makes the title editable.'],
    ['fontFamily / fontSize / padding', 'string', 'Editor font and spacing.'],
  ]
  const treeProps: [string, string, string][] = [
    ['paths', 'readonly string[] · required', 'Flat file paths; folders are inferred.'],
    ['activeFile', 'string | null · required', 'Selected file path.'],
    ['onactivefilechange', '(path) => void · required', 'Runs when a file is selected.'],
    ['theme', 'Theme · optional', 'Pass the same theme as the adjacent Code.'],
    ['ariaLabel', "string · 'Files'", 'Accessible name for the tree.'],
  ]
  const cssVars: [string, string][] = [
    ['--fp-<token>', 'Colour per token type (keyword, string, comment …).'],
    ['--fp-caret-color', 'Editor and editable-title caret.'],
    ['--fp-title-color', 'Header filename colour.'],
    ['--fp-control-color', 'Header control-dot colour.'],
    ['--fp-line-number-color', 'Line-number colour.'],
    ['--fp-line-highlight-color', 'Highlighted-line background.'],
    ['--fp-font-family', 'Code, textarea, and title font.'],
    ['--fp-font-size', 'Code and textarea font size.'],
    ['--fp-padding', 'Content and header spacing.'],
    ['--fp-line-number-width', 'Line-number gutter width.'],
  ]
</script>

{#snippet themeBar()}
  <div class="theme-bar theme-bar--inline">
    <span class="name">{theme.name}</span>
    <div class="swatches">
      {#each themes as t, i}
        <button class="swatch" aria-pressed={i === themeIndex} aria-label={t.name} title={t.name} style="background:{t.dark.keyword}" onclick={() => (themeIndex = i)}></button>
      {/each}
    </div>
    <button class="mode-toggle" aria-label="Toggle light / dark" onclick={toggle}></button>
  </div>
{/snippet}

{#snippet fileIcon(item: TreeItem)}{@html iconFor(item.name, item.directory)}{/snippet}

{#snippet propTable(rows: [string, string, string][])}
  <div class="langs__table">
    <div class="props-head"><span>Prop</span><span>Type / default</span><span>Purpose</span></div>
    {#each rows as [name, type, desc]}
      <div class="props-row"><code>{name}</code><code class="dim-code">{type}</code><span>{desc}</span></div>
    {/each}
  </div>
{/snippet}

<main class="doc doc--page">
  <h1 class="page-title">SvelteKit</h1>
  <p class="lead"><code>@fractalpop/svelte</code> ships <b>&lt;Code&gt;</b>, <b>&lt;Editor&gt;</b> and <b>&lt;FileTree&gt;</b> — present, edit, and browse highlighted code. All are SSR-safe and produce identical server/client markup, so there's <b>zero hydration cost</b>.</p>
  <div class="install-row"><code class="install-inline">npm install @fractalpop/svelte</code></div>

  {@render themeBar()}

  <h2 class="mt">&lt;Editor /&gt;</h2>
  <p>A controlled, highlighted editor with line numbers and Tab-to-indent. Type in it — the highlight updates live.</p>
  <div class="demo-frame">
    <Editor bind:value={editorValue} lang="js" title="playground.js" {theme} />
  </div>

  <h2 class="mt">&lt;FileTree /&gt;</h2>
  <p>An accessible tree (arrow keys, type-ahead) that infers folders from flat paths. Compose it with <b>&lt;Code&gt;</b> to browse files.</p>
  <div class="tree-layout demo-frame">
    <FileTree {paths} {activeFile} onactivefilechange={(p) => (activeFile = p)} {theme} icon={fileIcon} />
    <div class="tree-code">
      <Code code={files[activeFile]} lang={activeLang} title={activeFile.split('/').pop()} lineNumbers {theme} />
    </div>
  </div>

  <h2 class="mt">&lt;Code /&gt;</h2>
  <p>Read-only presentation with optional line numbers and marked lines. Line 3 is highlighted here.</p>
  <div class="tabs">
    {#each codeTabs as t}
      <button class="tab" class:active={codeTab === t} onclick={() => (codeTab = t)}>{t}</button>
    {/each}
  </div>
  <div class="demo-frame">
    <Code code={codeSamples[codeTab]} lang={codeTab} title={`example.${codeTab}`} controls lineNumbers highlightLines={[3]} {theme} />
  </div>

  <details class="langs">
    <summary><h2 style="display:inline-block">API details</h2></summary>
    <h3 class="mt">&lt;Code /&gt;</h3>
    {@render propTable(codeProps)}
    <h3 class="mt">&lt;Editor /&gt;</h3>
    {@render propTable(editorProps)}
    <h3 class="mt">&lt;FileTree /&gt;</h3>
    {@render propTable(treeProps)}
    <h3 class="mt">CSS variables</h3>
    <div class="langs__table">
      <div class="langs__head"><span>Variable</span><span>Purpose</span></div>
      {#each cssVars as [v, purpose]}
        <div class="langs__row" style="cursor:default"><code>{v}</code><span>{purpose}</span></div>
      {/each}
    </div>
  </details>

  <h2 class="mt">mdsvex &amp; remark</h2>
  <p>The same engine outside components: <code>@fractalpop/mdsvex</code> for <code>.svx</code>, <code>@fractalpop/remark</code> for <code>.md</code> / <code>.mdx</code> — identical tokens everywhere.</p>
  <CodePanel title="svelte.config.js" code={`import { fractalpopHighlighter } from '@fractalpop/mdsvex'\n\nmdsvex({ highlight: { highlighter: fractalpopHighlighter } })`} lang="js" {theme} />
</main>
