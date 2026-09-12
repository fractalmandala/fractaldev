<script lang="ts">
  import { themeStyle, type Theme } from './theme.js'
  import { treeItems, visibleItems, type TreeItem } from './file-tree/model.js'

  import type { Snippet } from 'svelte'

  interface Props {
    paths: readonly string[]
    activeFile: string | null
    onactivefilechange: (path: string) => void
    theme?: Theme
    ariaLabel?: string
    /** Optional custom icon per item (e.g. VS Code-style file icons). */
    icon?: Snippet<[TreeItem]>
    class?: string
    style?: string
  }

  let { paths, activeFile, onactivefilechange, theme, ariaLabel = 'Files', icon, class: className = '', style = '' }: Props = $props()

  const items = $derived(treeItems(paths))
  let collapsed = $state<Set<string>>(new Set())
  let focused = $state<string | null>(null)
  const visible = $derived(visibleItems(items, collapsed))
  const current = $derived(
    visible.find((i) => i.path === focused) ?? visible.find((i) => i.path === activeFile) ?? visible[0],
  )
  const refs = new Map<string, HTMLElement>()
  function register(node: HTMLElement, path: string) {
    refs.set(path, node)
    return { destroy: () => refs.delete(path) }
  }

  function focus(item: TreeItem | undefined) {
    if (!item) return
    focused = item.path
    refs.get(item.path)?.focus()
  }
  function toggle(path: string) {
    const next = new Set(collapsed)
    next.has(path) ? next.delete(path) : next.add(path)
    collapsed = next
  }
  function activate(item: TreeItem) {
    if (item.directory) toggle(item.path)
    else onactivefilechange(item.path)
  }
  function onKeydown(e: KeyboardEvent, item: TreeItem, index: number, expanded: boolean) {
    if (e.altKey || e.ctrlKey || e.metaKey) return
    const key = e.key
    if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', ' '].includes(key)) e.preventDefault()
    if (key === 'ArrowDown') focus(visible[index + 1])
    else if (key === 'ArrowUp') focus(visible[index - 1])
    else if (key === 'Home') focus(visible[0])
    else if (key === 'End') focus(visible[visible.length - 1])
    else if (key === 'ArrowRight' && item.directory) {
      if (!expanded) toggle(item.path)
      else if (visible[index + 1]?.parent === item.path) focus(visible[index + 1])
    } else if (key === 'ArrowLeft') {
      if (item.directory && expanded) toggle(item.path)
      else focus(visible.find((o) => o.path === item.parent))
    } else if (key === 'Enter' || key === ' ') activate(item)
  }
</script>

<div class="fp-tree {className}" role="tree" aria-label={ariaLabel} style={`${themeStyle(theme)};${style}`} data-fp-file-tree>
  {#each visible as item, index (item.path)}
    {@const expanded = !collapsed.has(item.path)}
    {@const siblings = items.filter((o) => o.parent === item.parent)}
    <div
      role="treeitem"
      tabindex={current === item ? 0 : -1}
      aria-label={item.name}
      aria-level={item.depth + 1}
      aria-setsize={siblings.length}
      aria-posinset={siblings.indexOf(item) + 1}
      aria-expanded={item.directory ? expanded : undefined}
      aria-selected={!item.directory && item.path === activeFile}
      style={`padding-inline-start:${6 + item.depth * 16}px`}
      use:register={item.path}
      onfocus={() => (focused = item.path)}
      onclick={() => { focus(item); activate(item) }}
      onkeydown={(e) => onKeydown(e, item, index, expanded)}
    >
      <svg class="fp-tree__chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        {#if item.directory}<path d={expanded ? 'm4 6 4 4 4-4' : 'm6 4 4 4-4 4'} />{/if}
      </svg>
      {#if icon}
        <span class="fp-tree__icon fp-tree__icon--custom" aria-hidden="true">{@render icon(item)}</span>
      {:else}
        <svg class="fp-tree__icon" aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round">
          <path d={item.directory ? 'M2 4h4l2 2h6v7H2Z' : 'M4 2h5l3 3v9H4Z M9 2v4h3'} />
        </svg>
      {/if}
      <span dir="auto">{item.name}</span>
    </div>
  {/each}
</div>

<style>
  .fp-tree { display: grid; grid-auto-rows: max-content; align-content: start; padding: 8px; overflow: auto; line-height: 1.5; font-family: var(--fp-font-family, ui-monospace, monospace); font-size: var(--fp-font-size, 13px); }
  .fp-tree [role='treeitem'] { display: flex; align-items: center; gap: 6px; min-height: 30px; padding-inline-end: 8px; border-radius: 4px; cursor: pointer; white-space: nowrap; outline: none; user-select: none; }
  .fp-tree [role='treeitem']:not([aria-selected='true']):hover { background: color-mix(in srgb, currentColor 7%, transparent); }
  .fp-tree [aria-selected='true'] { background: color-mix(in srgb, currentColor 13%, transparent); }
  .fp-tree [role='treeitem']:focus-visible { outline: 1px solid currentColor; outline-offset: -1px; }
  .fp-tree__icon { width: 16px; height: 16px; flex: none; }
  .fp-tree__icon--custom { display: inline-flex; align-items: center; justify-content: center; }
  .fp-tree__icon--custom :global(svg) { width: 16px; height: 16px; display: block; }
  .fp-tree__chevron { width: 10px; height: 10px; flex: none; }
</style>
