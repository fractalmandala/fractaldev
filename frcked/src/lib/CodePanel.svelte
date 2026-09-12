<script lang="ts">
  // A thin frame around the real <Code> component from @fractalpop/svelte.
  // All highlighting, the header, line numbers and theming come from the package.
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
    copy = false,
    lineNumbers = false,
    controls = true,
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

<div class="code-panel">
  {#if copy}
    <button class="panel-copy" onclick={doCopy} title="Copy" aria-label="Copy">
      {#if copied}✓{:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
      {/if}
    </button>
  {/if}
  <Code {code} {lang} {theme} title={title || null} {controls} {lineNumbers} {highlightLines} />
</div>

<style lang="sass">
.code-panel
	position: relative
	border-radius: 14px
	overflow: hidden
	border: 1px solid var(--border)
	box-shadow: var(--shadow)
	margin-bottom: 1rem
	--fp-font-family: 'Atkinson Hyperlegible Mono', ui-monospace, monospace

.panel-copy
	position: absolute
	top: 0.55rem
	right: 0.6rem
	z-index: 2
	background: transparent
	border: none
	color: var(--panel-fg, currentColor)
	opacity: 0.6
	cursor: pointer
	display: inline-flex
	padding: 0.15rem

	&:hover
		opacity: 1

	svg
		width: 1rem
		height: 1rem
</style>
