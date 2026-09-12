<script lang="ts">
  // A thin frame around the real <Code> component from @fractalpop/svelte.
  // All highlighting, the header, line numbers and theming come from the package;
  // this adds only the site's panel shape, lift, and copy affordance.
  import { Code, type Theme } from '@fractalpop/svelte'

  interface Props {
    title?: string
    code: string
    lang?: string
    theme?: Theme
    copy?: boolean
    lineNumbers?: boolean
    controls?: boolean
    highlightLines?: (number | [number, number])[]
  }

  let {
    title = '',
    code,
    lang = 'ts',
    theme,
    copy = true,
    lineNumbers = false,
    controls = false,
    highlightLines = [],
  }: Props = $props()

  let copied = $state(false)
  async function doCopy() {
    try {
      await navigator.clipboard.writeText(code)
      copied = true
      setTimeout(() => (copied = false), 1400)
    } catch {}
  }
</script>

<div class="panel">
  {#if copy}
    <button class="panel__copy" onclick={doCopy} title="Copy" aria-label="Copy">
      {#if copied}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
      {/if}
    </button>
  {/if}
  <Code
    {code}
    {lang}
    {theme}
    title={title || null}
    {controls}
    {lineNumbers}
    {highlightLines}
    fontSize="13px"
    padding="20px"
    style="--fp-line-highlight-color:var(--state-hover)"
  />
</div>
