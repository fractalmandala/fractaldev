<script lang="ts">
  // This page imports the DEFAULT entry and mutates its registry live.
  // Note: all entries re-export the same core, so the registry is one shared
  // module singleton per app — if another page already loaded fractalpop/full
  // (every component on this site does), all 32 languages are already here.
  import {
    highlight,
    lang,
    getRegisteredLanguages,
    importDefaults,
    registerLanguage,
  } from 'fractalpop'
  import '$lib/styles/fractalpop-demo.sass'

  // ---- live: importDefaults ----
  const pyCode = `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`

  let registered = $state(getRegisteredLanguages().map((l) => l.id))
  let pyHtml = $state(highlight(pyCode, { lang: 'python' }))
  let pyResolved = $state<string | undefined>(lang('py'))
  let pyReady = $derived(registered.includes('python'))

  async function loadPython() {
    await importDefaults(['python'])
    registered = getRegisteredLanguages().map((l) => l.id)
    pyHtml = highlight(pyCode, { lang: 'python' })
    pyResolved = lang('py')
  }

  // ---- live: registerLanguage (works in any registry state) ----
  const ledgerCode = `; 2026 budget
account assets:checking
commodity $
alias food
payee Grocery Store`

  let ledgerHtml = $state(highlight(ledgerCode, { lang: 'journal' }))
  let ledgerReady = $derived(registered.includes('ledger'))

  function addLedger() {
    registerLanguage(
      { id: 'ledger', extension: 'ledger', aliases: ['journal'] },
      {
        keywords: new Set(['account', 'payee', 'commodity', 'alias']),
        onCommentStart: (curr) => (curr === ';' ? 1 : 0),
        onCommentEnd: (_prev, curr) => (curr === '\n' ? 1 : 0),
      },
    )
    registered = getRegisteredLanguages().map((l) => l.id)
    // highlight via the alias, to prove aliases resolve
    ledgerHtml = highlight(ledgerCode, { lang: 'journal' })
  }

  // ---- static snippets (plain text; the live panels above run the real calls) ----
  const entriesCode = `import { highlight } from 'fractalpop'        // tiny — TypeScript + plaintext
import { highlight } from 'fractalpop/full'   // all 32 languages registered
import { parse, generate } from 'fractalpop/core' // engine only, no registry
import { highlight } from 'fractalpop/gpu'    // async WebGPU path`

  const importCode = `import { importDefaults } from 'fractalpop'

// pull bundled configs in at runtime, tree-shaking the rest
await importDefaults(['python', 'rust', 'sass'])`

  const registerCode = `import { registerLanguage } from 'fractalpop'

registerLanguage(
  { id: 'ledger', extension: 'ledger', aliases: ['journal'] },
  {
    keywords: new Set(['account', 'payee', 'commodity', 'alias']),
    onCommentStart: (curr) => (curr === ';' ? 1 : 0),
    onCommentEnd: (_prev, curr) => (curr === '\\n' ? 1 : 0),
  },
)

highlight(source, { lang: 'journal' }) // aliases resolve`

  const defaultsCode = `import { setDefaults } from 'fractalpop'

// replace the default set outright — metadata only…
setDefaults([
  { id: 'rust', extension: 'rs', aliases: [] },
  { id: 'python', extension: 'py', aliases: ['python3'] },
])

// …or id → config pairs
setDefaults({ rust: rustConfig, python: pythonConfig })`

  const gpuCode = `import { highlight } from 'fractalpop/gpu'

// async — tokenizes via the optional gpu-lexer peer
const html = await highlight(code, { lang: 'typescript' })`
</script>
<div class="prose">
<h1>Registry</h1>
<p>
  The default <code>fractalpop</code> entry ships a <b>mutable language registry</b>
  seeded with just TypeScript + plaintext, so unused grammars tree-shake away. You
  grow it at runtime — the panels on this page run the real calls live.
</p>
<p>
  Registered right now:
  {#each registered as id, i}<code>{id}</code>{i < registered.length - 1 ? ' ' : ''}{/each}
</p>
<p>
  One registry is shared per app: every entry point re-exports the same core, so a
  registration made through <code>fractalpop/full</code> is visible to
  <code>fractalpop</code> importers too. This site renders through
  <code>@fractalpop/svelte</code> → <code>fractalpop/full</code>, so if you arrived
  here from another page, all 32 languages are already registered.
</p>

<h2>Entry points</h2>
<p>Four ways in, depending on how much you want shipped and registered:</p>
<pre class="fp fp-lang--ts"><code>{entriesCode}</code></pre>

<h2>Grow the default entry</h2>
{#if pyReady}
  <p>
    Python is <b>already registered</b> in this session — <code>fractalpop/full</code>
    ran on another page of this site. Open <code>/registry</code> directly in a fresh
    tab to run the snippet below against a minimal registry yourself.
  </p>
{:else}
  <p>
    <code>importDefaults()</code> registers bundled configs at runtime. Right now Python
    is <b>not</b> registered — an unregistered language falls back to the TypeScript
    config, so <code>if</code>/<code>return</code> colour but <code>def</code> doesn't:
  </p>
{/if}
<pre class="fp fp-lang--python"><code>{@html pyHtml}</code></pre>
<p>
  <code>lang('py')</code> → <code>{pyResolved ?? 'undefined'}</code>
</p>
<button class="live-btn" onclick={loadPython} disabled={pyReady}>
  {pyReady ? 'python registered' : "await importDefaults(['python'])"}
</button>
<pre class="fp fp-lang--ts"><code>{importCode}</code></pre>

<h2>Register your own language</h2>
<p>
  <code>registerLanguage()</code> takes metadata plus a parse config — a keyword set
  and comment rules are enough for a small language. The panel starts unregistered
  (TypeScript fallback) and lights up when you register:
</p>
<pre class="fp fp-lang--ledger"><code>{@html ledgerHtml}</code></pre>
<button class="live-btn" onclick={addLedger} disabled={ledgerReady}>
  {ledgerReady ? 'ledger registered' : 'registerLanguage(ledger, …)'}
</button>
<pre class="fp fp-lang--ts"><code>{registerCode}</code></pre>

<h2>Replace the whole set</h2>
<p>
  <code>setDefaults()</code> wipes both registries and seeds exactly what you pass —
  the same call the default entry uses to seed TypeScript + plaintext at load. (Not a
  button here: on this site it would strip the 32 languages the other pages use until
  reload.)
</p>
<pre class="fp fp-lang--ts"><code>{defaultsCode}</code></pre>

<h2>WebGPU</h2>
<p>
  <code>fractalpop/gpu</code> is an async entry that tokenizes through the optional
  <code>gpu-lexer</code> peer (<code>npm i gpu-lexer</code>) and renders the same
  token markup as the CPU path:
</p>
<pre class="fp fp-lang--ts"><code>{gpuCode}</code></pre>
</div>
