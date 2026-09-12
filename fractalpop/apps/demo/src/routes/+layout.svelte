<script lang="ts">
  import '$lib/styles/globals.sass'
  import { page } from '$app/state'
	import Menu from '$lib/icons/align-center.svelte'

  let { children } = $props()
  let menuOpen = $state(false)

  const links = [
    { href: '/', label: 'Index' },
    { href: '/theme', label: 'Themes' },
    { href: '/sveltekit', label: 'SvelteKit' },
    { href: '/registry', label: 'Registry' },
    { href: '/markdown', label: 'Markdown' },
  ]
</script>

<div class="shell">
  <header class="nav" class:nav-open={menuOpen}>
    <a class="nav-logo" href="/">
      <img src="/images/fractalpop.png" alt="" />
      fractalpop
    </a>

    <div class="nav__links">
      {#each links as l}
        <a
          class="nav__link"
          href={l.href}
          onclick={() => (menuOpen = false)}
          aria-current={page.url.pathname === l.href ? 'page' : undefined}
        >
          {l.label}
        </a>
      {/each}
      <a
        class="nav__gh"
        href="https://github.com/fractalmandala/fractalpop"
        target="_blank"
        rel="noreferrer"
        aria-label="fractalpop on GitHub"
      >
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
          />
        </svg>
      </a>
    </div>

    <button
      class="nav__menu"
      aria-label="Menu"
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = !menuOpen)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        {#if menuOpen}
          <path d="M6 6l12 12M18 6L6 18" />
        {:else}
          <Menu/>
        {/if}
      </svg>
    </button>
  </header>

  <main class="main">
    {@render children()}
  </main>

  <footer class="footer">
    <div class="col">
      <p>
        <b>FRACTALPOP</b> — fractalpop · @fractalpop/svelte · @fractalpop/mdsvex ·
        @fractalpop/remark
      </p>
      <p>One engine, same output everywhere.</p>
      <p class="footer__credit">
        Inspired by the
        <a href="https://sugar-high.vercel.app/" target="_blank" rel="noreferrer">sugar-high</a>
        project by huozhi.
      </p>
    </div>
  </footer>
</div>
