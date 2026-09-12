<script lang="ts">
  import { onMount } from 'svelte'

  interface FontOption {
    id: string
    label: string
    category: 'sans' | 'serif' | 'mono'
    stack: string
  }

  const FONT_OPTIONS: FontOption[] = [
    // Sans-Serif
    { id: 'system-ui', label: 'System UI', category: 'sans', stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    { id: 'helvetica', label: 'Helvetica / Arial', category: 'sans', stack: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    { id: 'segoe', label: 'Segoe UI', category: 'sans', stack: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' },
    { id: 'trebuchet', label: 'Trebuchet MS', category: 'sans', stack: '"Trebuchet MS", "Lucida Grande", sans-serif' },
    { id: 'verdana', label: 'Verdana', category: 'sans', stack: 'Verdana, Geneva, sans-serif' },

    // Serif
    { id: 'georgia', label: 'Georgia', category: 'serif', stack: 'Georgia, Cambria, "Times New Roman", serif' },
    { id: 'baskerville', label: 'Baskerville', category: 'serif', stack: 'Baskerville, "Baskerville Old Face", Garamond, serif' },
    { id: 'garamond', label: 'Garamond', category: 'serif', stack: 'Garamond, "EB Garamond", "Times New Roman", serif' },
    { id: 'palatino', label: 'Palatino', category: 'serif', stack: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },

    // Monospace
    { id: 'system-mono', label: 'System Code', category: 'mono', stack: 'ui-monospace, "SF Mono", "Cascadia Code", Consolas, Menlo, monospace' },
    { id: 'consolas', label: 'Consolas', category: 'mono', stack: 'Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace' },
    { id: 'courier', label: 'Courier New', category: 'mono', stack: '"Courier New", Courier, monospace' }
  ]

  let { selected = $bindable(FONT_OPTIONS[0].stack) } = $props<{
    selected?: string
  }>()

  let isOpen = $state(false)
  let rootRef = $state<HTMLDivElement | null>(null)

  const activeFont = $derived(
    FONT_OPTIONS.find((f) => f.stack === selected) ?? FONT_OPTIONS[0]
  )

  const categories = [
    { key: 'sans', label: 'Sans-Serif' },
    { key: 'serif', label: 'Serif' },
    { key: 'mono', label: 'Monospace' }
  ] as const

  function selectFont(stack: string) {
    selected = stack
    isOpen = false
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false
    }
  }

  onMount(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef && !rootRef.contains(e.target as Node)) {
        isOpen = false
      }
    }

    window.addEventListener('click', handleClickOutside)
    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('click', handleClickOutside)
      window.removeEventListener('keydown', handleKeydown)
    }
  })
</script>

<div class="font-picker" bind:this={rootRef}>
  <button
    type="button"
    class="trigger"
    class:active={isOpen}
    onclick={() => (isOpen = !isOpen)}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    <div class="trigger-label">
      <span class="preview-text" style:font-family={activeFont.stack}>Aa</span>
      <span class="font-name">{activeFont.label}</span>
    </div>

    <svg
      class="chevron"
      class:flipped={isOpen}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>

  {#if isOpen}
    <div class="menu" role="listbox">
      {#each categories as cat}
        {@const groupFonts = FONT_OPTIONS.filter((f) => f.category === cat.key)}
        {#if groupFonts.length > 0}
          <div class="category-group">
            <span class="category-header">{cat.label}</span>
            {#each groupFonts as font}
              <button
                type="button"
                role="option"
                class="option-item"
                class:selected={font.stack === selected}
                aria-selected={font.stack === selected}
                onclick={() => selectFont(font.stack)}
              >
                <span class="sample" style:font-family={font.stack}>Ag</span>
                <span class="name" style:font-family={font.stack}>{font.label}</span>
                {#if font.stack === selected}
                  <svg
                    class="check-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style lang="sass">
.font-picker
	position: relative
	width: 260px
	user-select: none

.trigger
	display: flex
	align-items: center
	justify-content: space-between
	width: 100%
	padding: 8px 12px
	background: var(--bg-surface, #ffffff)
	border: 1px solid var(--border-color, #e2e8f0)
	border-radius: 8px
	cursor: pointer
	outline: none
	transition: border-color 0.15s ease, box-shadow 0.15s ease

	&:hover
		border-color: var(--border-hover, #cbd5e1)

	&:focus-visible, &.active
		border-color: var(--accent-color, #3b82f6)
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15)

.trigger-label
	display: flex
	align-items: center
	gap: 10px

.preview-text
	display: inline-flex
	align-items: center
	justify-content: center
	width: 28px
	height: 28px
	background: var(--badge-bg, #f1f5f9)
	border-radius: 6px
	font-size: 0.95rem
	color: var(--text-primary, #0f172a)

.font-name
	font-size: 0.875rem
	color: var(--text-primary, #0f172a)
	font-weight: 500

.chevron
	color: var(--text-muted, #94a3b8)
	transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)

	&.flipped
		transform: rotate(180deg)

.menu
	position: absolute
	top: calc(100% + 6px)
	left: 0
	width: 100%
	max-height: 360px
	overflow-y: auto
	background: var(--bg-surface, #ffffff)
	border: 1px solid var(--border-color, #e2e8f0)
	border-radius: 8px
	box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)
	padding: 6px
	z-index: 50
	scrollbar-width: thin

.category-group
	&:not(:first-child)
		margin-top: 6px
		padding-top: 6px
		border-top: 1px solid var(--border-subtle, #f1f5f9)

.category-header
	display: block
	padding: 4px 8px
	font-size: 0.6875rem
	font-weight: 600
	text-transform: uppercase
	letter-spacing: 0.05em
	color: var(--text-subtle, #94a3b8)

.option-item
	display: flex
	align-items: center
	width: 100%
	padding: 7px 8px
	background: transparent
	border: none
	border-radius: 6px
	cursor: pointer
	text-align: left
	transition: background-color 0.12s ease

	&:hover
		background: var(--hover-bg, #f8fafc)

	&.selected
		background: var(--selected-bg, #eff6ff)
		color: var(--accent-color, #2563eb)

.sample
	width: 24px
	font-size: 1rem
	color: var(--text-muted, #64748b)
	margin-right: 8px

.name
	flex: 1
	font-size: 0.875rem
	color: inherit

.check-icon
	color: var(--accent-color, #2563eb)
	margin-left: auto
</style>