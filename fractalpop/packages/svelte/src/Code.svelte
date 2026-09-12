<script lang="ts">
  import { parse, generate } from 'fractalpop/core'
  import { lang as canonicalizeLang, getLanguageConfig } from 'fractalpop/full'
  import { themeStyle, type Theme } from './theme.js'
  import type { DisplayOptions } from 'fractalpop'

  interface Props {
    code?: string
    /** Source passed as children-style prop; `code` wins if both are set. */
    children?: never
    lang?: string
    theme?: Theme
    title?: string | null
    controls?: boolean
    lineNumbers?: boolean
    lineNumbersWidth?: string
    highlightLines?: (number | [number, number])[]
    startingLineNumber?: number
    wrapLongLines?: boolean
    padding?: string
    fontSize?: string | number
    cx?: DisplayOptions['cx']
    mark?: DisplayOptions['mark']
    markLine?: DisplayOptions['markLine']
    class?: string
    style?: string
  }

  let {
    code = '',
    lang,
    theme,
    title = null,
    controls = false,
    lineNumbers = false,
    lineNumbersWidth,
    highlightLines = [],
    startingLineNumber = 1,
    wrapLongLines = true,
    padding,
    fontSize,
    cx,
    mark,
    markLine,
    class: className = '',
    style = '',
  }: Props = $props()

  const config = $derived(lang ? getLanguageConfig(canonicalizeLang(lang) ?? lang) : undefined)
  const lines = $derived(generate(parse(code, config), { cx, mark, markLine }))

  const highlighted = $derived.by(() => {
    const set = new Set<number>()
    for (const l of highlightLines) {
      if (Array.isArray(l)) for (let i = Math.max(1, l[0]); i <= l[1]; i++) set.add(i)
      else set.add(l)
    }
    return set
  })

  const rootStyle = $derived(
    [
      `--fp-font-size:${typeof fontSize === 'number' ? fontSize + 'px' : (fontSize ?? 'inherit')}`,
      `--fp-line-number-width:${lineNumbersWidth ?? '2.5rem'}`,
      `--fp-padding:${padding ?? '1rem'}`,
      themeStyle(theme),
      style,
    ].filter(Boolean).join(';'),
  )

  const styleString = (s: Record<string, unknown> | undefined) =>
    s ? Object.entries(s).map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`).join(';') : ''
</script>

<div class="fp-code {className}" style={rootStyle} data-fp-code data-fp-line-numbers={lineNumbers}>
  {#if title || controls}
    <div class="fp-code__header" data-fp-header>
      {#if controls}<div class="fp-code__controls"><span></span><span></span><span></span></div>{/if}
      {#if title}<span class="fp-code__title">{title}</span>{/if}
    </div>
  {/if}
  <pre class="fp-code__pre" class:wrap={wrapLongLines}><code>{#each lines as line, i}<span
        class={line.properties.className as string}
        style={styleString(line.properties.style as Record<string, unknown>)}
        data-highlight={highlighted.has(i + 1) || undefined}
        >{#if lineNumbers}<span class="fp-code__ln">{startingLineNumber + i}</span>{/if}{#each line.children as token}<span
            class={token.properties.className as string}
            style={styleString(token.properties.style as Record<string, unknown>)}
            >{token.children[0].type === 'text' ? token.children[0].value : ''}</span>{/each}</span>{/each}</code></pre>
</div>

<style>
  .fp-code { font-size: var(--fp-font-size, inherit); line-height: 1.6; overflow: hidden; }
  .fp-code__header { display: flex; align-items: center; padding: calc(var(--fp-padding) * 0.35) var(--fp-padding); }
  .fp-code__controls { display: inline-flex; width: 52px; gap: 6px; }
  .fp-code__controls span { width: 10px; height: 10px; border-radius: 50%; background: var(--fp-control-color, currentColor); }
  .fp-code__controls span:nth-child(1) { background: #ff5f57; }
  .fp-code__controls span:nth-child(2) { background: #febc2e; }
  .fp-code__controls span:nth-child(3) { background: #28c840; }
  .fp-code__title { flex: 1; text-align: center; color: var(--fp-title-color, currentColor); font-family: var(--fp-font-family, inherit); }
  .fp-code__pre { margin: 0; padding: calc(var(--fp-padding) * 0.5) 0; overflow-x: auto; white-space: normal; }
  .fp-code__pre.wrap { white-space: normal; }
  .fp-code code { display: block; font-family: var(--fp-font-family, ui-monospace, monospace); }
  .fp-code :global(.fp__line) { display: block; width: 100%; min-height: 1lh; padding: 0 var(--fp-padding); white-space: pre; }
  .fp-code[data-fp-line-numbers='true'] :global(.fp__line) { padding-left: var(--fp-line-number-width); }
  .fp-code :global(.fp__line[data-highlight]) { background: var(--fp-line-highlight-color); }
  .fp-code__ln {
    display: inline-block; min-width: calc(var(--fp-line-number-width) - 14px);
    margin-left: calc(var(--fp-line-number-width) * -1); margin-right: 14px;
    text-align: right; user-select: none; color: var(--fp-line-number-color, currentColor); opacity: 0.6;
  }
</style>
