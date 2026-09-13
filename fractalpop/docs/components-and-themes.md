# Components, Theming & Styling Guide

This guide provides exhaustive documentation for using `@fractalpop/svelte` components inside SvelteKit pages, working with shipped themes, customizing colors, and understanding the core CSS styling contract when using `fractalpop` without any UI framework.

---

## Table of Contents

1. [Architecture & How Styling Works](#1-architecture--how-styling-works)
2. [Using `<Editor>` on a `+page.svelte`](#2-using-editor-on-a-pagesvelte)
   - [Basic Example](#basic-editor-example)
   - [Interactive Playground with Live Binding](#interactive-playground-with-live-binding)
   - [Props Reference](#editor-props-reference)
   - [Tab & Indentation Behavior](#tab--indentation-behavior)
3. [Using `<Code>` on a `+page.svelte`](#3-using-code-on-a-pagesvelte)
   - [Basic Example](#basic-code-example)
   - [Line Numbering & Line Highlighting](#line-numbering--line-highlighting)
   - [macOS Window Controls & Titles](#macos-window-controls--titles)
   - [Props Reference](#code-props-reference)
4. [Using `<FileTree>` on a `+page.svelte`](#4-using-filetree-on-a-pagesvelte)
   - [Basic Example](#basic-filetree-example)
   - [Mini-IDE: Composing `<FileTree>` with `<Code>`](#mini-ide-composing-filetree-with-code)
   - [Custom Icons with Svelte 5 Snippets](#custom-icons-with-svelte-5-snippets)
   - [Keyboard Navigation & Accessibility](#keyboard-navigation--accessibility)
   - [Props Reference](#filetree-props-reference)
5. [Default Shipped Themes](#5-default-shipped-themes)
   - [SvelteKit Theme](#sveltekit-theme)
   - [VS Code Theme](#vs-code-theme)
   - [Color Palettes Specification](#color-palettes-specification)
6. [How to Load and Apply Themes](#6-how-to-load-and-apply-themes)
   - [Method 1: The `theme` Component Prop](#method-1-the-theme-component-prop)
   - [Method 2: Automatic Light/Dark Mode via `light-dark()`](#method-2-automatic-lightdark-mode-via-light-dark)
   - [Method 3: Importing Shipped CSS Stylesheets](#method-3-importing-shipped-css-stylesheets)
   - [Method 4: Dynamic Theme Switching in Svelte 5](#method-4-dynamic-theme-switching-in-svelte-5)
7. [How to Edit and Customize Colors](#7-how-to-edit-and-customize-colors)
   - [Approach A: Overriding CSS Custom Properties (`--fp-*`)](#approach-a-overriding-css-custom-properties---fp-)
   - [Approach B: Authoring Custom TypeScript/JavaScript Theme Objects](#approach-b-authoring-custom-typescriptjavascript-theme-objects)
   - [Approach C: Tailwind & Utility Classes via `cx`](#approach-c-tailwind--utility-classes-via-cx)
   - [All CSS Custom Properties Reference](#all-css-custom-properties-reference)
8. [Core Package Styling Guide (`fractalpop` with zero Svelte dependencies)](#8-core-package-styling-guide-fractalpop-with-zero-svelte-dependencies)
   - [How Does Core Output Code?](#how-does-core-output-code)
   - [How Do Users Know What Classes and Variables to Use?](#how-do-users-know-what-classes-and-variables-to-use)
   - [Complete CSS Contract: Classes & Variables](#complete-css-contract-classes--variables)
   - [Ready-to-Use Drop-in CSS Stylesheets](#ready-to-use-drop-in-css-stylesheets)

---

## 1. Architecture & How Styling Works

`fractalpop` follows a strict, predictable styling contract:

1. **Zero Style Bloat**: The core engine emits **semantic HTML** without hardcoded color codes.
2. **Dual Representation**: Every token receives both a CSS variable inline style (`style="color:var(--fp-<type>)"`) and an atomic CSS class name (`class="fp__token--<type>"`).
3. **Cascading Inheritance**: Svelte components (`<Code>`, `<Editor>`, `<FileTree>`) read CSS variables from their parent container or `:root`. If you pass a `theme` prop, the component translates that theme object into inline CSS custom properties. If you omit the `theme` prop, the components cleanly inherit whatever `--fp-*` variables and `background-color` / `color` are defined in your CSS.
4. **Zero-Flash SSR**: Everything renders identically on the server and on the client. There are no client-only hydration waterfalls or layout shifts.

---

## 2. Using `<Editor>` on a `+page.svelte`

The `<Editor>` component provides an interactive code editor. It layers a transparent, keyboard-accessible `<textarea>` directly over a live `<Code>` rendering. As the user types, the syntax highlighting updates smoothly without flashing.

### Basic Editor Example

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Editor, sveltekit } from '@fractalpop/svelte'

  let code = $state(`function add(a: number, b: number): number {
  return a + b
}`)
</script>

<main style="max-width: 720px; margin: 2rem auto;">
  <Editor
    bind:value={code}
    lang="typescript"
    theme={sveltekit}
    lineNumbers={true}
    controls={true}
    title="math.ts"
  />
</main>
```

### Interactive Playground with Live Binding

You can bind both `value` (the code content) and `title` (the filename shown in the window header), or listen to the `onchange` and `onchangetitle` callbacks:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Editor, vscodeDark } from '@fractalpop/svelte'

  let sourceCode = $state(`import { mount } from 'svelte'
import App from './App.svelte'

mount(App, {
  target: document.getElementById('app')!
})`)

  let fileName = $state('main.ts')
  let lineCount = $derived(sourceCode.split('\n').length)

  function handleChange(updatedCode: string) {
    console.log('Code modified:', updatedCode)
  }
</script>

<div class="editor-wrapper">
  <div class="editor-meta">
    <span>File: <strong>{fileName}</strong></span>
    <span>Total lines: {lineCount}</span>
  </div>

  <Editor
    bind:value={sourceCode}
    bind:title={fileName}
    lang="typescript"
    theme={vscodeDark}
    controls={true}
    lineNumbers={true}
    lineNumbersWidth="3rem"
    padding="1.25rem"
    fontSize={14}
    fontFamily="JetBrains Mono, Menlo, Consolas, monospace"
    indent="  "
    onchange={handleChange}
    onchangetitle={(newTitle) => console.log('Renamed to:', newTitle)}
  />

  <div class="output-preview">
    <h4>Raw Value in State:</h4>
    <pre>{sourceCode}</pre>
  </div>
</div>

<style>
  .editor-wrapper {
    max-width: 800px;
    margin: 2rem auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .editor-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #888;
  }
  .output-preview {
    background: #111;
    color: #ddd;
    padding: 1rem;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.85rem;
  }
</style>
```

### Editor Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` (`$bindable`) | `''` | Current code string. Use `bind:value` for two-way binding. |
| `title` | `string \| null` | `null` | Header title (e.g. filename). When provided, displays in the window header. |
| `lang` | `string` | `'typescript'` | Language identifier, extension, or alias (e.g. `'ts'`, `'svelte'`, `'sass'`, `'json'`). |
| `theme` | `Theme \| ThemePalette` | `undefined` | Shipped theme (`sveltekit`, `vscode`) or custom theme object. |
| `controls` | `boolean` | `true` | When `true`, renders macOS-style red, yellow, and green window dots. |
| `lineNumbers` | `boolean` | `true` | When `true`, displays line numbers in the gutter. |
| `lineNumbersWidth` | `string` | `'2.5rem'` | CSS width allocated for the line number gutter. |
| `padding` | `string` | `'1rem'` | Internal padding for code and header. Sets `--fp-padding`. |
| `fontSize` | `string \| number` | `'inherit'` | Font size (number in px or CSS string like `'14px'`). Sets `--fp-font-size`. |
| `fontFamily` | `string` | `'ui-monospace, ...'` | Font family string for both `<pre>` and overlay `<textarea>`. Sets `--fp-font-family`. |
| `indent` | `string` | `'  '` (2 spaces) | Indentation string inserted when the user presses `Tab`. |
| `cx` | `Record<TokenType, string>` | `undefined` | Custom CSS classes mapped to specific token types (e.g. Tailwind classes). |
| `mark` | `(token: MarkToken) => void` | `undefined` | Hook to mutate token AST nodes before render. |
| `onchange` | `(code: string) => void` | `undefined` | Callback fired on every `<textarea>` input event. |
| `onchangetitle` | `(title: string) => void` | `undefined` | Callback fired when the title is edited. When omitted, title input is `readonly`. |
| `class` | `string` | `''` | Additional class name on the `.fp-editor` wrapper element. |
| `style` | `string` | `''` | Additional inline CSS declarations on the `.fp-editor` wrapper element. |

### Tab & Indentation Behavior

The `<Editor>` component automatically intercepts the `Tab` key:
- **Single Cursor**: Pressing `Tab` inserts the `indent` string (default `  ` 2 spaces) at the cursor and preserves caret position.
- **Multi-Line Selection**: Selecting multiple lines and pressing `Tab` indents every selected line simultaneously.
- **Outdent**: Pressing `Shift + Tab` removes indentation from selected lines.
- **External Helper**: If you need the exact same indentation algorithm outside the component, `@fractalpop/svelte` exports the pure function:
  ```ts
  import { indentCode } from '@fractalpop/svelte'
  const { value, selectionStart, selectionEnd } = indentCode(source, start, end, '  ', false)
  ```

---

## 3. Using `<Code>` on a `+page.svelte`

The `<Code>` component is the presentation-ready display component. It handles read-only code display with syntax highlighting, optional window chrome, line numbering, and highlighted lines or ranges.

### Basic Code Example

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Code, vscode } from '@fractalpop/svelte'

  const example = `export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}`
</script>

<Code
  code={example}
  lang="typescript"
  theme={vscode}
/>
```

### Line Numbering & Line Highlighting

You can highlight specific line numbers or inclusive line ranges using `highlightLines`:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Code, sveltekit } from '@fractalpop/svelte'

  const snippet = `import { writable } from 'svelte/store'

export function createCounter(initial = 0) {
  const { subscribe, set, update } = writable(initial)

  return {
    subscribe,
    increment: () => update((n) => n + 1),
    decrement: () => update((n) => n - 1),
    reset: () => set(initial)
  }
}`
</script>

<!-- Highlight line 1 and lines 7 through 9 -->
<Code
  code={snippet}
  lang="typescript"
  theme={sveltekit}
  lineNumbers={true}
  startingLineNumber={1}
  highlightLines={[1, [7, 9]]}
  title="counter.ts"
  controls={true}
/>
```

### macOS Window Controls & Titles

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Code, sveltekitDark } from '@fractalpop/svelte'

  const sassCode = `.card
  background: var(--bg-surface)
  padding: 1.5rem
  border-radius: 8px

  &:hover
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)`
</script>

<Code
  code={sassCode}
  lang="sass"
  theme={sveltekitDark}
  controls={true}
  title="styles/card.sass"
  padding="1.25rem"
  wrapLongLines={true}
/>
```

### Code Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `code` | `string` | `''` | Source code string to highlight. |
| `lang` | `string` | `'typescript'` | Language identifier or alias (e.g. `'typescript'`, `'svelte'`, `'sass'`, `'css'`, `'json'`, etc.). |
| `theme` | `Theme \| ThemePalette` | `undefined` | Shipped theme object (`sveltekit`, `vscode`) or custom palette. |
| `title` | `string \| null` | `null` | Title displayed centered in the header bar. |
| `controls` | `boolean` | `false` | When `true`, renders the three macOS-style window control dots. |
| `lineNumbers` | `boolean` | `false` | When `true`, displays line numbers in the gutter. |
| `lineNumbersWidth` | `string` | `'2.5rem'` | Width of the line-number gutter. |
| `highlightLines` | `(number \| [number, number])[]` | `[]` | 1-based line numbers or `[start, end]` ranges to mark with highlighted styling. |
| `startingLineNumber` | `number` | `1` | Number assigned to the first line (useful for snippet extracts). |
| `wrapLongLines` | `boolean` | `true` | When `true`, wraps long lines; when `false`, enables horizontal scroll. |
| `padding` | `string` | `'1rem'` | Internal padding for code and header. |
| `fontSize` | `string \| number` | `'inherit'` | Font size (px number or CSS string). |
| `cx` | `Record<TokenType, string>` | `undefined` | Custom CSS class names added per token type (e.g. `{ keyword: 'font-bold' }`). |
| `mark` | `(token: MarkToken) => void` | `undefined` | Hook to mutate individual token nodes before rendering. |
| `markLine` | `(line: MarkLine) => void` | `undefined` | Hook to mutate line nodes before rendering. |
| `class` | `string` | `''` | Custom CSS class name appended to the container `.fp-code`. |
| `style` | `string` | `''` | Inline CSS declarations appended to the container. |

---

## 4. Using `<FileTree>` on a `+page.svelte`

`<FileTree>` provides a fully accessible hierarchical file navigator (WAI-ARIA `role="tree"`). You supply a flat list of file paths; folders and nested hierarchy are inferred automatically.

### Basic FileTree Example

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { FileTree, sveltekit } from '@fractalpop/svelte'

  const paths = [
    'src/routes/+layout.svelte',
    'src/routes/+page.svelte',
    'src/lib/Button.svelte',
    'package.json',
    'svelte.config.js'
  ]

  let activeFile = $state('src/routes/+page.svelte')
</script>

<aside style="width: 260px; border: 1px solid #333; border-radius: 6px;">
  <FileTree
    {paths}
    {activeFile}
    onactivefilechange={(path) => (activeFile = path)}
    theme={sveltekit}
  />
</aside>
```

### Mini-IDE: Composing `<FileTree>` with `<Code>`

Compose `<FileTree>` on the left with `<Code>` on the right to build an interactive file explorer:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { FileTree, Code, sveltekit } from '@fractalpop/svelte'

  interface FileEntry {
    content: string
    lang: string
  }

  const projectFiles: Record<string, FileEntry> = {
    'src/routes/+layout.svelte': {
      lang: 'svelte',
      content: `<script lang="ts">
  let { children } = $props()
<\/script>

<div class="app-layout">
  {@render children()}
</div>`
    },
    'src/routes/+page.svelte': {
      lang: 'svelte',
      content: `<script lang="ts">
  let count = $state(0)
<\/script>

<button onclick={() => count++}>
  Clicked {count} times
</button>`
    },
    'src/lib/styles/app.sass': {
      lang: 'sass',
      content: `:root
  --brand-primary: #ff4500
  --text-main: #212121

.app-layout
  max-width: 1200px
  margin: 0 auto
  padding: 2rem`
    },
    'package.json': {
      lang: 'json',
      content: `{
  "name": "my-sveltekit-app",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@fractalpop/svelte": "^0.1.0"
  }
}`
    }
  }

  const filePaths = Object.keys(projectFiles)
  let activeFile = $state(filePaths[1]) // starts on +page.svelte

  const currentEntry = $derived(projectFiles[activeFile] ?? { content: '', lang: 'plaintext' })
</script>

<div class="ide-container">
  <div class="ide-sidebar">
    <div class="sidebar-header">EXPLORER</div>
    <FileTree
      paths={filePaths}
      {activeFile}
      onactivefilechange={(newPath) => (activeFile = newPath)}
      theme={sveltekit}
    />
  </div>

  <div class="ide-editor">
    <Code
      code={currentEntry.content}
      lang={currentEntry.lang}
      title={activeFile}
      theme={sveltekit}
      controls={true}
      lineNumbers={true}
      wrapLongLines={true}
    />
  </div>
</div>

<style>
  .ide-container {
    display: flex;
    border: 1px solid #333;
    border-radius: 8px;
    overflow: hidden;
    max-width: 960px;
    margin: 2rem auto;
    min-height: 380px;
    background: #181818;
  }
  .ide-sidebar {
    width: 240px;
    border-right: 1px solid #333;
    background: rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
  }
  .sidebar-header {
    padding: 0.6rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #888;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #282828;
  }
  .ide-editor {
    flex: 1;
    overflow: hidden;
  }
</style>
```

### Custom Icons with Svelte 5 Snippets

You can pass a custom `icon` snippet to render tailored file-type icons (e.g. Svelte, Sass, JSON, folder):

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { FileTree, vscodeDark, type TreeItem } from '@fractalpop/svelte'

  const paths = [
    'src/routes/+page.svelte',
    'src/lib/app.sass',
    'src/lib/types.ts',
    'package.json'
  ]
  let activeFile = $state(paths[0])
</script>

{#snippet customIcon(item: TreeItem)}
  {#if item.directory}
    📁
  {:else if item.name.endsWith('.svelte')}
    🟠
  {:else if item.name.endsWith('.sass') || item.name.endsWith('.scss')}
    🎀
  {:else if item.name.endsWith('.ts')}
    🔷
  {:else if item.name.endsWith('.json')}
    🟨
  {:else}
    📄
  {/if}
{/snippet}

<FileTree
  {paths}
  {activeFile}
  onactivefilechange={(p) => (activeFile = p)}
  theme={vscodeDark}
  icon={customIcon}
/>
```

### Keyboard Navigation & Accessibility

`<FileTree>` implements the standard W3C WAI-ARIA Treeview pattern:
- **Up / Down Arrow**: Moves focus sequentially across visible tree items.
- **Right Arrow**: Expands a collapsed directory, or moves focus to its first child if already expanded.
- **Left Arrow**: Collapses an expanded directory, or moves focus to its parent directory if already collapsed.
- **Home / End**: Jumps immediately to the very first or last visible item.
- **Enter / Space**: Activates the item (toggles a directory open/closed, or selects a file triggering `onactivefilechange`).

### FileTree Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `paths` | `readonly string[]` | **Required** | Flat array of file paths (e.g. `['src/a.ts', 'src/b.ts']`). |
| `activeFile` | `string \| null` | **Required** | Currently selected path. |
| `onactivefilechange` | `(path: string) => void` | **Required** | Callback invoked when a file is clicked or activated with keyboard. |
| `theme` | `Theme \| ThemePalette` | `undefined` | Shipped theme object (`sveltekit`, `vscode`) or custom palette. |
| `ariaLabel` | `string` | `'Files'` | Accessible label for `aria-label` on the tree container. |
| `icon` | `Snippet<[TreeItem]>` | `undefined` | Svelte 5 snippet rendering custom icons for directories and files. |
| `class` | `string` | `''` | Custom CSS class name appended to the `.fp-tree` wrapper. |
| `style` | `string` | `''` | Inline CSS styles appended to the `.fp-tree` wrapper. |

---

## 5. Default Shipped Themes

Both **SvelteKit** and **VS Code** themes (each with complete light and dark palettes) are shipped as **default inclusions in the core package (`fractalpop`)** and re-exported by `@fractalpop/svelte`:

1. **SvelteKit Theme** (`sveltekit`, `sveltekitLight`, `sveltekitDark`)
   - Matches the official SvelteKit and Svelte aesthetic with bold orange highlights (`#fa3701`, `#ff4500`) and clean contrast.
2. **VS Code Theme** (`vscode`, `vscodeLight`, `vscodeDark`)
   - Matches standard Visual Studio Code default light and dark syntaxes.

### Importing Shipped Themes

From the **core package** (`fractalpop`):
```ts
import {
  sveltekit,        // Adaptive light/dark theme (auto-switches via CSS light-dark())
  sveltekitLight,   // Standalone light palette
  sveltekitDark,    // Standalone dark palette
  vscode,           // Adaptive light/dark theme (auto-switches via CSS light-dark())
  vscodeLight,      // Standalone light palette
  vscodeDark,       // Standalone dark palette
  themes,           // Object dictionary containing all presets
  themeStyle,       // Converts theme to inline CSS declarations
  themeCss          // Emits ready-to-use CSS block for a selector
} from 'fractalpop'

// Or from the subpath export:
import { sveltekit, vscode } from 'fractalpop/theme'
```

From **`@fractalpop/svelte`**:
```ts
import {
  sveltekit,
  sveltekitLight,
  sveltekitDark,
  vscode,
  vscodeLight,
  vscodeDark,
  themes
} from '@fractalpop/svelte'
```


### Color Palettes Specification

| Token / Chrome Variable | SvelteKit (Light) | SvelteKit (Dark) | VS Code (Light) | VS Code (Dark) |
| :--- | :--- | :--- | :--- | :--- |
| **`background`** | `#FFFFFF` | `#212121` | `#F6F8FA` | `#1E1E1E` |
| **`foreground`** | `#313131` | `#C7C6C6` | `#24292F` | `#9DCDFE` |
| **`keyword`** | `#FA3701` | `#FA3701` | `#CF222E` | `#569CD6` |
| **`string`** | `#FA3701` | `#FA3701` | `#032F62` | `#CE9178` |
| **`class`** | `#DE2D00` | `#DE2D00` | `#6F42C1` | `#4EC9B0` |
| **`property`** | `#787676` | `#E1DFDF` | `#0550AE` | `#9DCDFE` |
| **`entity`** | `#313131` | `#FFF8F8` | `#953800` | `#DCDCAA` |
| **`jsxliterals`** | `#FA3701` | `#FA3701` | `#8250DF` | `#FF8C42` |
| **`sign`** | `#FF4500` | `#FF4500` | `#24292F` | `#D4D4D4` |
| **`comment`** | `#6E6D6D` | `#6E6D6D` | `#6E7781` | `#6A9955` |
| **`caret`** | `#FF4500` | `#FF4500` | `#24292F` | `#AEAFAD` |

---

## 6. How to Load and Apply Themes

### Method 1: The `theme` Component Prop

The most direct way is passing a theme directly to the component's `theme` prop:

```svelte
<script lang="ts">
  import { Code, Editor, sveltekit, vscodeDark } from '@fractalpop/svelte'
</script>

<!-- Using the adaptive SvelteKit theme -->
<Code code="const hello = 'svelte'" lang="ts" theme={sveltekit} />

<!-- Pinning explicitly to VS Code dark -->
<Editor value="let answer = 42" lang="ts" theme={vscodeDark} />
```

### Method 2: Automatic Light/Dark Mode via `light-dark()`

When you pass a dual theme (`sveltekit` or `vscode`), `fractalpop` uses the modern standard CSS `light-dark()` function for each property:

```css
/* Automatically generated under the hood */
background-color: light-dark(#FFFFFF, #212121);
--fp-keyword: light-dark(#FA3701, #FA3701);
--fp-property: light-dark(#787676, #E1DFDF);
```

To enable browser-level automatic switching:
1. Ensure your page or root element declares `color-scheme: light dark;` (or `light` / `dark`).
2. The code block will now automatically follow the user's OS dark mode setting without any JavaScript re-render!

```css
/* src/app.css or global stylesheet */
:root {
  color-scheme: light dark;
}
```

### Method 3: Importing Shipped CSS Stylesheets

If you prefer global CSS or are styling HTML generated without Svelte components, `@fractalpop/svelte` includes pre-built CSS stylesheets:

```ts
// In your src/routes/+layout.svelte:
import '@fractalpop/svelte/themes/sveltekit.css'
// or:
// import '@fractalpop/svelte/themes/vscode.css'
```

These stylesheets define `--fp-*` variables on `:root`, `[data-theme="light"]`, `[data-theme="dark"]`, and `@media (prefers-color-scheme: dark)`.

### Method 4: Dynamic Theme Switching in Svelte 5

You can toggle themes interactively using Svelte 5 reactive `$state`:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Code, sveltekit, vscode, type Theme } from '@fractalpop/svelte'

  let currentThemeName = $state<'sveltekit' | 'vscode'>('sveltekit')
  const activeTheme = $derived<Theme>(currentThemeName === 'sveltekit' ? sveltekit : vscode)
</script>

<div class="toolbar">
  <label>
    Select Theme:
    <select bind:value={currentThemeName}>
      <option value="sveltekit">SvelteKit Theme</option>
      <option value="vscode">VS Code Theme</option>
    </select>
  </label>
</div>

<Code
  code="const framework = 'Svelte 5'"
  lang="typescript"
  theme={activeTheme}
  lineNumbers={true}
  controls={true}
/>
```

---

## 7. How to Edit and Customize Colors

### Approach A: Overriding CSS Custom Properties (`--fp-*`)

Because every component outputs CSS custom properties, you can override any individual token or chrome variable in standard CSS without creating a new theme object:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Code, sveltekit } from '@fractalpop/svelte'
</script>

<div class="custom-snippet">
  <Code code="const highlightMe = true" lang="ts" theme={sveltekit} />
</div>

<style>
  /* Override specific token colors locally */
  .custom-snippet {
    --fp-keyword: #e02424; /* Make keywords crimson */
    --fp-font-family: 'Fira Code', monospace;
    --fp-line-highlight-color: rgba(255, 230, 0, 0.2);
  }
</style>
```

### Approach B: Authoring Custom TypeScript/JavaScript Theme Objects

You can define your own `ThemePalette` (single palette) or `Theme` (light + dark pair). Any omitted token falls back cleanly to the `foreground` color:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Code, type Theme } from '@fractalpop/svelte'

  // Custom Monokai-inspired theme
  const monokaiTheme: Theme = {
    light: {
      background: '#fafafa',
      foreground: '#383a42',
      keyword: '#e45649',
      string: '#50a14f',
      class: '#c18401',
      property: '#4078f2',
      entity: '#a626a4',
      comment: '#a0a1a7',
      sign: '#383a42',
      identifier: '#383a42',
      jsxliterals: '#e45649'
    },
    dark: {
      background: '#272822',
      foreground: '#f8f8f2',
      keyword: '#f92672',
      string: '#e6db74',
      class: '#66d9ef',
      property: '#a6e22e',
      entity: '#fd971f',
      comment: '#75715e',
      sign: '#f8f8f2',
      identifier: '#f8f8f2',
      jsxliterals: '#ae81ff'
    }
  }
</script>

<Code
  code="const message = 'Hello Custom World!'"
  lang="typescript"
  theme={monokaiTheme}
/>
```

### Approach C: Tailwind & Utility Classes via `cx`

If you use Tailwind CSS, use the `cx` prop to inject classes directly into rendered tokens without writing raw CSS:

```svelte
<Code
  code="function greet() { return 'hi' }"
  lang="typescript"
  cx={{
    keyword: 'font-extrabold uppercase tracking-wider',
    comment: 'italic opacity-60 text-emerald-400',
    string: 'underline decoration-amber-400'
  }}
/>
```

### All CSS Custom Properties Reference

Here is the complete registry of CSS variables recognized by `fractalpop` and `@fractalpop/svelte`:

#### Token Variables (Syntax Highlighting)

| CSS Variable | Target Tokens | Typical Usage |
| :--- | :--- | :--- |
| `--fp-keyword` | Keywords | `function`, `const`, `return`, `if`, `export`, `async` |
| `--fp-string` | String & Regex | `'hello'`, `"world"`, \`/regex/\`, template strings |
| `--fp-identifier` | Identifiers | Variable names, parameters, generic identifiers |
| `--fp-class` | Types & Classes | `PascalCase` types, `Number`, `Boolean`, `null`, `undefined` |
| `--fp-property` | Properties | Object keys (`obj.key`), CSS properties (`margin`), Sass `$vars` |
| `--fp-entity` | Functions & Mixins | Function declarations and invocation names |
| `--fp-jsxliterals` | Markup & Literals | Text nodes inside JSX/HTML markup |
| `--fp-sign` | Operators & Signs | `=`, `+`, `=>`, `{`, `}`, `[`, `]`, `;`, `:` |
| `--fp-comment` | Comments | `// line comments`, `/* block comments */` |

#### Chrome & Layout Variables

| CSS Variable | Applied To | Description |
| :--- | :--- | :--- |
| `background-color` | `.fp-code`, `.fp-editor`, `.fp-tree` | Background of the code panel and editor. |
| `color` | `.fp-code`, `.fp-editor`, `.fp-tree` | Default text foreground color. |
| `--fp-caret-color` | `<textarea>`, title input | Color of the blinking text cursor in `<Editor>`. |
| `--fp-title-color` | Header title | Text color of the filename displayed in the window header. |
| `--fp-control-color` | Header dots fallback | Fallback color for macOS control dots when custom colors are not set. |
| `--fp-line-number-color` | Gutter numbers | Color of the numbers rendered in the gutter. |
| `--fp-line-highlight-color`| Highlighted lines | Background color applied to lines marked in `highlightLines`. |
| `--fp-font-family` | Pre & Textarea | Font family stack (defaults to system monospace). |
| `--fp-font-size` | Pre & Textarea | Font size (defaults to `inherit`). |
| `--fp-padding` | Wrapper & Pre | Internal padding spacing. |
| `--fp-line-number-width` | Gutter column | Width allocated for line numbers. |

---

## 8. Core Package Styling Guide (`fractalpop` with zero Svelte dependencies)

If a developer installs **only** the core package `fractalpop`:

```sh
npm install fractalpop
```

and calls:

```ts
import { highlight } from 'fractalpop'
const html = highlight(sourceCode, { lang: 'ts' })
```

### How Does Core Output Code?

`highlight()` returns pure HTML with no inline styling attributes other than `style="color:var(--fp-<type>)"`.

For example, `const ready = true` renders as:

```html
<span class="fp__line">
  <span class="fp__token--keyword" style="color:var(--fp-keyword)">const</span>
  <span class="fp__token--space"> </span>
  <span class="fp__token--identifier" style="color:var(--fp-identifier)">ready</span>
  <span class="fp__token--space"> </span>
  <span class="fp__token--sign" style="color:var(--fp-sign)">=</span>
  <span class="fp__token--space"> </span>
  <span class="fp__token--class" style="color:var(--fp-class)">true</span>
</span>
```

### How Do Users Know What Classes and Variables to Use?

You can style the output using **either** CSS Variables or standard CSS Classes. Both are emitted on every element.

#### 1. The Token Class Contract
Every token has class `fp__token--<type>`:
- `.fp__token--keyword`
- `.fp__token--string`
- `.fp__token--identifier`
- `.fp__token--class`
- `.fp__token--property`
- `.fp__token--entity`
- `.fp__token--jsxliterals`
- `.fp__token--sign`
- `.fp__token--comment`

#### 2. The Line Class Contract
- `.fp__line`: Wraps each individual line.
- `.fp__line--highlighted`: Added when a line is highlighted via `markLine`.

### Using Shipped Themes in Core Projects

Because `sveltekit` and `vscode` themes are shipped directly in `fractalpop`, you can apply them in non-Svelte environments in two ways:

#### Option 1: Inline Styles via `themeStyle()`
```ts
import { highlight, themeStyle, sveltekit, vscodeDark } from 'fractalpop'

const codeHtml = highlight('const answer = 42', { lang: 'ts' })
const style = themeStyle(sveltekit) // generates light-dark() CSS variables inline

const html = `<pre style="${style}"><code>${codeHtml}</code></pre>`
```

#### Option 2: Generate CSS Blocks via `themeCss()`
```ts
import { themeCss, sveltekit, vscode } from 'fractalpop'

// Generates complete CSS rules for :root, [data-theme="dark"], and @media (prefers-color-scheme: dark)
const cssBlock = themeCss(':root', sveltekit)
console.log(cssBlock)
```

### Ready-to-Use Drop-in CSS Stylesheet


Here is a complete, copy-pasteable CSS stylesheet that you can drop into any project (plain HTML, React, Vue, SvelteKit, Vanilla JS) to style `fractalpop` output:

```css
/* ==========================================================================
   fractalpop Universal Theme Stylesheet
   ========================================================================== */

/* Light Mode Variables */
:root {
  --fp-bg: #ffffff;
  --fp-fg: #24292f;
  --fp-keyword: #cf222e;
  --fp-string: #032f62;
  --fp-identifier: #24292f;
  --fp-class: #6f42c1;
  --fp-property: #0550ae;
  --fp-entity: #953800;
  --fp-jsxliterals: #8250df;
  --fp-sign: #24292f;
  --fp-comment: #6e7781;
  --fp-line-highlight-color: rgba(254, 240, 138, 0.4);
}

/* Dark Mode Variables (via media query or data attribute) */
@media (prefers-color-scheme: dark) {
  :root {
    --fp-bg: #1e1e1e;
    --fp-fg: #d4d4d4;
    --fp-keyword: #569cd6;
    --fp-string: #ce9178;
    --fp-identifier: #9cdcfe;
    --fp-class: #4ec9b0;
    --fp-property: #9cdcfe;
    --fp-entity: #dcdcaa;
    --fp-jsxliterals: #ff8c42;
    --fp-sign: #d4d4d4;
    --fp-comment: #6a9955;
    --fp-line-highlight-color: rgba(255, 255, 255, 0.08);
  }
}

[data-theme='dark'] {
  --fp-bg: #1e1e1e;
  --fp-fg: #d4d4d4;
  --fp-keyword: #569cd6;
  --fp-string: #ce9178;
  --fp-identifier: #9cdcfe;
  --fp-class: #4ec9b0;
  --fp-property: #9cdcfe;
  --fp-entity: #dcdcaa;
  --fp-jsxliterals: #ff8c42;
  --fp-sign: #d4d4d4;
  --fp-comment: #6a9955;
  --fp-line-highlight-color: rgba(255, 255, 255, 0.08);
}

/* Code Container Styling */
pre.fp-container {
  background-color: var(--fp-bg);
  color: var(--fp-fg);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

/* Line Layout */
.fp__line {
  display: block;
  min-height: 1.5em;
  white-space: pre;
}

/* Line Highlight */
.fp__line--highlighted {
  background-color: var(--fp-line-highlight-color);
  margin-left: -1rem;
  margin-right: -1rem;
  padding-left: 1rem;
  padding-right: 1rem;
}
```

Now, whenever you render highlighted code with core `fractalpop`:

```html
<pre class="fp-container"><code>{@html html}</code></pre>
```

the code will be fully highlighted, responsive to light/dark themes, and easily customizable via CSS variables!
