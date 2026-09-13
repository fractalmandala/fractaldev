<script lang="ts">
  import { Code, Editor, FileTree, type TreeItem } from '@fractalpop/svelte'
  import CodePanel from '$lib/CodePanel.svelte'
  import ThemeBar from '$lib/components/ThemeBar.svelte'
  import { reveal } from '$lib/actions/reveal'
  import { themes, defaultThemeIndex, type Mode } from '$lib/themes'
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

  // One theme selection shared by every live demo on the page.
  let themeIndex = $state(defaultThemeIndex)
  let mode = $state<Mode>('light')
  const theme = $derived(mode === 'dark' ? themes[themeIndex].dark : themes[themeIndex].light)
  const docTheme = themes[0].light

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

  // API tables — mirrored from the prop interfaces in @fractalpop/svelte.
  const codeProps: [string, string, string][] = [
    ['code', "string · ''", 'Source to highlight.'],
    ['lang', 'string', "Language id or alias — 'sass', 'ts', 'python' …"],
    ['theme', 'Theme', 'A palette, or a { light, dark } pair rendered with light-dark().'],
    ['title', 'string | null · null', 'Filename shown in the header.'],
    ['controls', 'boolean · false', 'Show the three header dots.'],
    ['lineNumbers', 'boolean · false', 'Show one-based line numbers.'],
    ['lineNumbersWidth', "string · '2.5rem'", 'Gutter width.'],
    ['highlightLines', '(number | [number, number])[] · []', 'Lines and inclusive ranges to mark.'],
    ['startingLineNumber', 'number · 1', 'First line number.'],
    ['wrapLongLines', 'boolean · true', 'Wrap rather than scroll long lines.'],
    ['padding', "string · '1rem'", 'Content and header spacing.'],
    ['fontSize', 'string | number', 'Code font size; a number is treated as px.'],
    ['cx / mark / markLine', 'DisplayOptions', 'Per-token and per-line customization.'],
    ['class / style', 'string', 'Forwarded to the root element.'],
  ]
  const editorProps: [string, string, string][] = [
    ['value', "string · bindable, ''", 'Controlled source text (bind:value).'],
    ['title', 'string | null · null', 'Filename in the header; editable when onchangetitle is set.'],
    ['lang', 'string', 'Language id or alias.'],
    ['theme', 'Theme', 'Token and component colours.'],
    ['controls', 'boolean · true', 'Show the three header dots.'],
    ['lineNumbers', 'boolean · true', 'Show one-based line numbers.'],
    ['lineNumbersWidth', 'string', 'Gutter width.'],
    ['indent', "string · '  '", 'Inserted on Tab; Shift+Tab outdents.'],
    ['onchange', '(code: string) => void', 'Runs when the source changes.'],
    ['onchangetitle', '(title: string) => void', 'Supply this to make the title editable.'],
    ['fontFamily / fontSize / padding', 'string', 'Editor font and spacing.'],
    ['cx / mark', 'DisplayOptions', 'Per-token customization.'],
    ['class / style', 'string', 'Forwarded to the root element.'],
  ]
  const treeProps: [string, string, string][] = [
    ['paths', 'readonly string[] · required', 'Flat file paths; folders are inferred.'],
    ['activeFile', 'string | null · required', 'Selected file path.'],
    ['onactivefilechange', '(path: string) => void · required', 'Runs when a file is selected.'],
    ['theme', 'Theme', 'Pass the same theme as the adjacent Code.'],
    ['ariaLabel', "string · 'Files'", 'Accessible name for the tree.'],
    ['icon', 'Snippet<[TreeItem]>', 'Custom icon per item — the file icons on this page.'],
    ['class / style', 'string', 'Forwarded to the root element.'],
  ]
  const highlightProps: [string, string, string][] = [
    ['code', "string · ''", 'Source to highlight.'],
    ['lang', 'string', 'Language id or alias (from HighlightOptions).'],
    ['highlightLines', 'number[] · []', 'One-based lines to mark. Plain numbers only — no ranges.'],
    ['class / codeClass', 'string', 'Applied to the <pre> and its <code>.'],
  ]
  const cssVars: [string, string][] = [
    ['--fp-<token>', 'Colour per token type: identifier, keyword, string, class, property, entity, jsxliterals, sign, comment.'],
    ['--fp-caret-color', 'Editor and editable-title caret.'],
    ['--fp-title-color', 'Header filename colour.'],
    ['--fp-control-color', 'Header control-dot colour.'],
    ['--fp-line-number-color', 'Line-number colour.'],
    ['--fp-line-highlight-color', 'Highlighted-line background.'],
    ['--fp-font-family', 'Code, textarea, tree, and title font.'],
    ['--fp-font-size', 'Code and textarea font size.'],
    ['--fp-padding', 'Content and header spacing.'],
    ['--fp-line-number-width', 'Line-number gutter width.'],
  ]
</script>

<svelte:head><title>SvelteKit — fractalpop</title></svelte:head>

{#snippet fileIcon(item: TreeItem)}{@html iconFor(item.name, item.directory)}{/snippet}

{#snippet propTable(rows: [string, string, string][])}
  <div class="table table--props">
    <div class="table__head"><span>Prop</span><span>Type / default</span><span>Purpose</span></div>
    {#each rows as [name, type, desc]}
      <div class="table__row"><code>{name}</code><code class="dim">{type}</code><span>{desc}</span></div>
    {/each}
  </div>
{/snippet}

<div class="hero" use:reveal>
	<div class="hero-meta mono">
    <span class="text-sm mono text-muted">COMPONENTS /</span>
    <span class="text-sm mono text-muted">SSR-SAFE & ZERO HYDRATION</span>
	</div>
  <h1 class="page-title">SvelteKit</h1>
  <p class="page-sub">
    Present, edit, and browse highlighted code with Editor, Code, and FileTree components. All three produce identical server and client markup, so nothing is re-rendered on hydration.
  </p>
  <div>
    <button
      class="button outline shadow"
      onclick={() => navigator.clipboard?.writeText('npm install @fractalpop/svelte')}
    >
			<span class="text-theme mono">[ </span>npm install @fractalpop/svelte<span class="text-theme mono"> ]</span>
      <span class="btn__hint">copy</span>
    </button>
  </div>
</div>

<section class="content-section">
  <div class="section-head">
    <span class="label">01 /</span>
    <h2 class="label-head">Editor Component</h2>
  </div>
	<div class="block">
  <p class="lede">
    A controlled, highlighted editor with line numbers and Tab-to-indent. Type in it — the
    highlight updates live.
  </p>
  <div class="themebar-row">
    <span class="label">{themes[themeIndex].name} · {mode}</span>
    <ThemeBar bind:index={themeIndex} bind:mode light />
  </div>
  <div class="panel" use:reveal>
    <Editor bind:value={editorValue} lang="js" title="playground.js" {theme} fontSize="13px" padding="20px" />
  </div>
	</div>
</section>

<section class="content-section">
  <div class="section-head">
    <span class="label">02 /</span>
    <h2 class="label-head">File Tree Component</h2>
  </div>
	<div class="block">
  <p class="lede">
    An accessible tree (arrow keys, type-ahead) that infers folders from flat paths.
    Compose it with <b>&lt;Code&gt;</b> to browse files.
  </p>
  <div class="tree" use:reveal>
    <FileTree {paths} {activeFile} onactivefilechange={(p) => (activeFile = p)} {theme} icon={fileIcon} />
    <div>
      <Code
        code={files[activeFile]}
        lang={activeLang}
        title={activeFile.split('/').pop()}
        lineNumbers
        {theme}
        fontSize="13px"
        padding="20px"
      />
    </div>
  </div>
	</div>
</section>

<section class="content-section">
  <div class="section-head">
    <span class="label">03 /</span>
    <h2 class="label-head">Code Component</h2>
  </div>
	<div class="block">
  <p class="lede">
    Read-only presentation with optional line numbers and marked lines. Line 3 is
    highlighted here.
  </p>
  <div class="tabs">
    {#each codeTabs as t}
      <button class="tab" class:is-active={codeTab === t} onclick={() => (codeTab = t)}>{t}</button>
    {/each}
  </div>
  <div class="panel" use:reveal>
    <Code
      code={codeSamples[codeTab]}
      lang={codeTab}
      title={`example.${codeTab}`}
      controls
      lineNumbers
      highlightLines={[3]}
      {theme}
      fontSize="13px"
      padding="20px"
    />
  </div>
	</div>
  <details class="details">
    <summary>API details</summary>
    <h3 class="block__title">&lt;Code /&gt;</h3>
    {@render propTable(codeProps)}
    <h3 class="block__title">&lt;Editor /&gt;</h3>
    {@render propTable(editorProps)}
    <h3 class="block__title">&lt;FileTree /&gt;</h3>
    {@render propTable(treeProps)}
    <h3 class="block__title">&lt;Highlight /&gt;</h3>
    {@render propTable(highlightProps)}
    <h3 class="block__title">CSS variables</h3>
    <div class="table">
      <div class="table__head"><span>Variable</span><span>Purpose</span></div>
      {#each cssVars as [v, purpose]}
        <div class="table__row"><code>{v}</code><span>{purpose}</span></div>
      {/each}
    </div>
  </details>
</section>

<section class="content-section">
  <div class="section-head">
    <span class="label">04 /</span>
    <h2 class="label-head">Mdsvex and Remark</h2>
  </div>
	<div class="block">
  <p class="lede">
    The same engine outside components: <code>@fractalpop/mdsvex</code> for
    <code>.svx</code> and <code>.md</code>, <code>@fractalpop/remark</code> for markdown
    anywhere else — identical tokens everywhere.
Read detailed documentation at <a target="_blank" rel="noreferrer" style="color: var(--theme-color)" href="https://github.com/fractalmandala/fractaldev/blob/main/fractalpop/docs/mdsvex.md">Github</a>
  </p>
  <CodePanel
    title="svelte.config.js"
    code={`import { fractalpopHighlighter } from '@fractalpop/mdsvex'\nmdsvex({ highlight: { highlighter: fractalpopHighlighter } })`}
    lang="js"
    theme={docTheme}
  />
	</div>
</section>
