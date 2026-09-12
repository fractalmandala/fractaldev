<script lang="ts" module>
  /** Indent or outdent the selected lines, returning new value + selection. */
  export function indentCode(value: string, start: number, end: number, indent: string, outdent = false) {
    if (!outdent && start === end) {
      return { value: value.slice(0, start) + indent + value.slice(end), selectionStart: start + indent.length, selectionEnd: end + indent.length }
    }
    const firstLineStart = value.lastIndexOf('\n', start - 1) + 1
    const lastPos = end > start && value[end - 1] === '\n' ? end - 1 : end
    const edits: { position: number; remove: number; insert: string }[] = []
    for (let position = firstLineStart; position <= lastPos; position = value.indexOf('\n', position) + 1) {
      let remove = 0
      if (outdent) {
        if (value.startsWith(indent, position)) remove = indent.length
        else remove = Math.min((value.slice(position).match(/^[ \t]+/)?.[0] || '').length, indent.length)
      }
      edits.push({ position, remove, insert: outdent ? '' : indent })
      const nl = value.indexOf('\n', position)
      if (nl < 0 || nl >= lastPos) break
      position = nl
    }
    const map = (offset: number) => {
      let mapped = offset
      for (const e of edits) {
        if (offset < e.position) break
        if (offset <= e.position + e.remove) { mapped = e.position + e.insert.length; break }
        mapped += e.insert.length - e.remove
      }
      return mapped
    }
    let next = value
    for (const e of edits.slice().reverse()) next = next.slice(0, e.position) + e.insert + next.slice(e.position + e.remove)
    return { value: next, selectionStart: map(start), selectionEnd: map(end) }
  }
</script>

<script lang="ts">
  import { tick } from 'svelte'
  import Code from './Code.svelte'
  import { themeStyle, type Theme } from './theme.js'
  import type { DisplayOptions } from 'fractalpop'

  interface Props {
    value?: string
    title?: string | null
    lang?: string
    theme?: Theme
    controls?: boolean
    lineNumbers?: boolean
    lineNumbersWidth?: string
    padding?: string
    fontSize?: string | number
    fontFamily?: string
    indent?: string
    cx?: DisplayOptions['cx']
    mark?: DisplayOptions['mark']
    onchange?: (code: string) => void
    onchangetitle?: (title: string) => void
    class?: string
    style?: string
  }

  let {
    value = $bindable(''),
    title = null,
    lang,
    theme,
    controls = true,
    lineNumbers = true,
    lineNumbersWidth,
    padding,
    fontSize,
    fontFamily,
    indent = '  ',
    cx,
    mark,
    onchange,
    onchangetitle,
    class: className = '',
    style = '',
  }: Props = $props()

  let textarea: HTMLTextAreaElement
  let codeContent = $state<HTMLElement>()

  const rootStyle = $derived(
    [
      `--fp-font-size:${typeof fontSize === 'number' ? fontSize + 'px' : (fontSize ?? 'inherit')}`,
      `--fp-line-number-width:${lineNumbersWidth ?? '2.5rem'}`,
      `--fp-padding:${padding ?? '1rem'}`,
      `--fp-font-family:${fontFamily ?? 'ui-monospace, Menlo, Consolas, monospace'}`,
      themeStyle(theme),
      style,
    ].filter(Boolean).join(';'),
  )

  function update(next: string) {
    value = next
    onchange?.(next)
  }

  async function onKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab' || e.isComposing) return
    e.preventDefault()
    const r = indentCode(value, textarea.selectionStart, textarea.selectionEnd, indent, e.shiftKey)
    update(r.value)
    await tick()
    textarea.setSelectionRange(r.selectionStart, r.selectionEnd)
  }

  function syncScroll() {
    const content = textarea.parentElement?.querySelector('[data-fp-code] pre') as HTMLElement | null
    if (content) content.scrollLeft = textarea.scrollLeft
  }
</script>

<div class="fp-editor {className}" style={rootStyle} data-fp-editor data-fp-line-numbers={lineNumbers}>
  {#if controls || title !== null}
    <div class="fp-editor__header">
      {#if controls}<div class="fp-editor__controls"><span></span><span></span><span></span></div>{/if}
      {#if title !== null}
        <input class="fp-editor__title" readonly={!onchangetitle}
          oninput={(e) => onchangetitle?.((e.target as HTMLInputElement).value)} bind:value={title} />
      {/if}
    </div>
  {/if}
  <div class="fp-editor__content" bind:this={codeContent}>
    <Code code={value} {lang} {cx} {mark} controls={false} {lineNumbers} {lineNumbersWidth} {padding} />
    <textarea
      bind:this={textarea}
      {value}
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      oninput={(e) => update((e.target as HTMLTextAreaElement).value)}
      onkeydown={onKeydown}
      onscroll={syncScroll}
    ></textarea>
  </div>
</div>

<style>
  .fp-editor { position: relative; font-size: var(--fp-font-size, inherit); line-height: 1.6; }
  .fp-editor__header { display: flex; align-items: center; padding: calc(var(--fp-padding) * 0.35) var(--fp-padding); }
  .fp-editor__controls { display: inline-flex; width: 52px; gap: 6px; }
  .fp-editor__controls span { width: 10px; height: 10px; border-radius: 50%; }
  .fp-editor__controls span:nth-child(1) { background: #ff5f57; }
  .fp-editor__controls span:nth-child(2) { background: #febc2e; }
  .fp-editor__controls span:nth-child(3) { background: #28c840; }
  .fp-editor__title { flex: 1; text-align: center; background: transparent; border: none; outline: none; color: var(--fp-title-color, currentColor); font-family: var(--fp-font-family); font-size: inherit; caret-color: var(--fp-caret-color, currentColor); }
  .fp-editor__content { position: relative; }
  .fp-editor__content :global(.fp-code) { line-height: inherit; }
  .fp-editor textarea {
    position: absolute; inset: 0; width: 100%; height: 100%; resize: none; border: none; outline: none;
    margin: 0; overflow: auto; white-space: pre;
    font-family: var(--fp-font-family); font-size: inherit; line-height: inherit;
    color: transparent; background: transparent; caret-color: var(--fp-caret-color, currentColor);
    padding: calc(var(--fp-padding) * 0.5) var(--fp-padding);
    tab-size: 2;
  }
  .fp-editor[data-fp-line-numbers='true'] textarea { padding-left: var(--fp-line-number-width); }
</style>
