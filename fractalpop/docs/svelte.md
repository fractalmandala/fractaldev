# @fractalpop/svelte

`@fractalpop/svelte` brings fractalpop into Svelte and SvelteKit. It ships four
components and one action. Everything renders on the server and produces the
same markup on the client, so highlighted code has no hydration cost and no
flash.

## Install

```sh
npm install @fractalpop/svelte fractalpop
```

`fractalpop` is a runtime dependency; `svelte` 5 is a peer dependency.

## Components at a glance


| Component                 | Use it to                                                   |
| ------------------------- | ----------------------------------------------------------- |
| [`Highlight`](#highlight) | Drop a highlighted snippet into a page.                     |
| [`Code`](#code)           | Present code with a header, line numbers, and marked lines. |
| [`Editor`](#editor)       | Offer an editable, live-highlighted textarea.               |
| [`FileTree`](#filetree)   | Browse files, composed with `Code`.                         |


All four accept a `theme` and render through the same token classes, so one
theme styles every component. See [Theming](#theming).

## `Highlight`

`Highlight` is the simplest component: give it `code` and a `lang`, and it
renders `<pre class="fp"><code>…</code></pre>`.

```svelte
<script lang="ts">
  import { Highlight } from '@fractalpop/svelte'
</script>

<Highlight code={source} lang="sass" highlightLines={[2, 3]} />
```


| Prop                  | Type       | Default        | Purpose                                             |
| --------------------- | ---------- | -------------- | --------------------------------------------------- |
| `code`                | `string`   | `''`           | Source to highlight.                                |
| `lang`                | `string`   | `'typescript'` | Language id, extension, or alias.                   |
| `highlightLines`      | `number[]` | `[]`           | 1-based lines to mark with `fp__line--highlighted`. |
| `cx`                  | `object`   | —              | Extra class per token type.                         |
| `class` / `codeClass` | `string`   | `''`           | Classes for the `<pre>` and `<code>`.               |


## `Code`

`Code` presents read-only code with an optional macOS-style header, line
numbers, and highlighted line ranges.

```svelte
<script lang="ts">
  import { Code } from '@fractalpop/svelte'
</script>

<Code code={source} lang="ts" title="example.ts" controls lineNumbers highlightLines={[[3, 5]]} />
```


| Prop                                        | Type                            | Default | Purpose                              |
| ------------------------------------------- | ------------------------------- | ------- | ------------------------------------ |
| `code`                                      | `string`                        | `''`    | Source to highlight.                 |
| `lang`                                      | `string`                        | —       | Language id / alias.                 |
| `theme`                                     | `Theme`                         | —       | A palette or `{ light, dark }` pair. |
| `title`                                     | `string | null`                 | `null`  | Filename shown in the header.        |
| `controls`                                  | `boolean`                       | `false` | Show the three header dots.          |
| `lineNumbers`                               | `boolean`                       | `false` | Show one-based line numbers.         |
| `highlightLines`                            | `(number | [number, number])[]` | `[]`    | Lines and inclusive ranges to mark.  |
| `startingLineNumber`                        | `number`                        | `1`     | First line number.                   |
| `padding` / `fontSize` / `lineNumbersWidth` | `string`                        | —       | Layout overrides.                    |
| `cx` / `mark` / `markLine`                  | —                               | —       | Token and line customization.        |


## `Editor`

`Editor` overlays a transparent `<textarea>` on a live `Code` view. Typing
updates the highlight; `Tab` indents and `Shift`+`Tab` outdents. Use
`bind:value` for two-way binding.

```svelte
<script lang="ts">
  import { Editor } from '@fractalpop/svelte'
  let source = $state("const greet = (name) => `Hi ${name}`")
</script>

<Editor bind:value={source} lang="ts" title="playground.ts" />
```


| Prop                                  | Type                      | Default | Purpose                       |
| ------------------------------------- | ------------------------- | ------- | ----------------------------- |
| `value`                               | `string` (bindable)       | `''`    | Controlled source text.       |
| `title`                               | `string | null`           | `null`  | Editable filename.            |
| `lang`                                | `string`                  | —       | Language id / alias.          |
| `theme`                               | `Theme`                   | —       | Token and component colors.   |
| `controls`                            | `boolean`                 | `true`  | Show header controls.         |
| `lineNumbers`                         | `boolean`                 | `true`  | Show one-based line numbers.  |
| `indent`                              | `string`                  | `' '`   | Inserted on `Tab`.            |
| `onchange`                            | `(code: string) => void`  | —       | Runs when the source changes. |
| `onchangetitle`                       | `(title: string) => void` | —       | Makes the title editable.     |
| `fontFamily` / `fontSize` / `padding` | `string`                  | —       | Editor font and spacing.      |


The named export `indentCode(value, start, end, indent, outdent?)` is available
if you want the same Tab logic elsewhere.

## `FileTree`

`FileTree` is an accessible tree (arrow keys, type-ahead, `role="tree"`) that
infers folders from flat file paths. Compose it with `Code` to build a file
browser.

```svelte
<script lang="ts">
  import { FileTree, Code } from '@fractalpop/svelte'
  const files = { 'src/app.ts': '…', 'src/lib/util.ts': '…' }
  let active = $state('src/app.ts')
</script>

<FileTree
  paths={Object.keys(files)}
  activeFile={active}
  onactivefilechange={(path) => (active = path)}
/>
<Code code={files[active]} lang="ts" lineNumbers />
```


| Prop                 | Type                     | Default   | Purpose                                     |
| -------------------- | ------------------------ | --------- | ------------------------------------------- |
| `paths`              | `readonly string[]`      | required  | Flat file paths; folders are inferred.      |
| `activeFile`         | `string | null`          | required  | Selected file path.                         |
| `onactivefilechange` | `(path: string) => void` | required  | Runs when a file is selected.               |
| `theme`              | `Theme`                  | —         | Pass the same theme as the adjacent `Code`. |
| `ariaLabel`          | `string`                 | `'Files'` | Accessible name for the tree.               |
| `icon`               | `Snippet<[TreeItem]>`    | —         | Custom icon per item (see below).           |


### Custom file icons

The `icon` snippet receives each `TreeItem` and renders in place of the default
glyph. Use it for VS Code-style, file-type-aware icons.

```svelte
{#snippet fileIcon(item)}
  {#if item.directory}📁{:else if item.name.endsWith('.svelte')}🟠{:else}📄{/if}
{/snippet}

<FileTree {paths} {activeFile} {onactivefilechange} icon={fileIcon} />
```

## The `fractalpop` action

For code you only have on the client — pasted or generated at runtime — the
`fractalpop` action highlights an element's text content in place.

```svelte
<script lang="ts">
  import { fractalpop } from '@fractalpop/svelte'
</script>

<pre use:fractalpop={{ lang: 'ts' }}>{code}</pre>
```

## Theming

A theme is a palette, or a `{ light, dark }` pair. Pass it as the `theme` prop,
and the component writes the matching `--fp-*` variables inline. A pair renders
with `light-dark()`, so it follows the surrounding `color-scheme`.

```ts
import type { Theme } from '@fractalpop/svelte'

const oneDark: Theme = {
  background: '#282c34',
  foreground: '#abb2bf',
  keyword: '#c678dd',
  string: '#98c379',
  comment: '#5c6370',
  // class, property, entity, jsxliterals, sign …
}
```

If you prefer plain CSS, skip the `theme` prop and set the variables yourself —
see the [core theming docs](./core.md#theming). The components also read these
extra variables for their chrome:


| Variable                    | Controls                         |
| --------------------------- | -------------------------------- |
| `--fp-caret-color`          | Editor and editable-title caret. |
| `--fp-title-color`          | Header filename color.           |
| `--fp-control-color`        | Header control-dot color.        |
| `--fp-line-number-color`    | Line-number color.               |
| `--fp-line-highlight-color` | Highlighted-line background.     |
| `--fp-font-family`          | Code and textarea font.          |
| `--fp-font-size`            | Code and textarea font size.     |
| `--fp-padding`              | Content and header spacing.      |
| `--fp-line-number-width`    | Line-number gutter width.        |


The helper `themeStyle(theme)` returns the inline style string the components
use, if you need it directly.

## Next steps

- Highlight `.svx` files: [`@fractalpop/mdsvex`](./mdsvex.md)
- Understand the engine and token types: [`fractalpop`](./core.md)

