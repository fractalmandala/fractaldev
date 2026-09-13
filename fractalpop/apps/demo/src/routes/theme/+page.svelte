<script lang="ts">
  import CodePanel from '$lib/CodePanel.svelte'
  import ThemeBar from '$lib/components/ThemeBar.svelte'
  import { reveal } from '$lib/actions/reveal'
  import { themes, paletteVars, cssFor, type Mode } from '$lib/themes'

  let themeIndex = $state(0)
  let mode = $state<Mode>('dark')
  const theme = $derived(themes[themeIndex])
  const palette = $derived(mode === 'dark' ? theme.dark : theme.light)
  const style = $derived(paletteVars(palette))
  const docTheme = themes[0].light

  const preview = `interface User { name: string; admin: boolean }

const greet = (u: User) => {
  // welcome message
  return \`Hi \${u.name}\`
}

const re = /^[a-z]+$/i
const App = () => <b className="tag">ok</b>`

  const sassPreview = `// theme tokens
$brand: hsl(212, 90%, 55%)

@mixin card($radius: 0.5rem)
  border-radius: $radius

.card
  color: $brand
  &:hover
    background: darken($brand, 8%) !important`

  const lightCss = $derived(cssFor(':root', theme.light))
  const darkCss = $derived(cssFor(":root[data-theme='dark']", theme.dark))
  const tailwind = `/* Map fractalpop tokens to your Tailwind palette */
@layer base {
  :root {
    --fp-keyword: theme(colors.pink.600);
    --fp-string: theme(colors.emerald.600);
    --fp-property: theme(colors.sky.600);
    --fp-comment: theme(colors.gray.400);
  }
}`

  const sassMap: [string, string][] = [
    ['$variable', 'property'],
    ['@mixin / @include / @if', 'keyword'],
    ['mixin & function names', 'entity'],
    ['.selector / %placeholder', 'class'],
    ['!default / !important', 'keyword'],
    ['// and /* */', 'comment'],
  ]
</script>

<svelte:head><title>Themes — fractalpop</title></svelte:head>

<section class="page-header" use:reveal>
  <div class="page-eyebrow">
    <span class="label label--accent">THEMES /</span>
    <span class="badge-tag">COLOR SCIENCE</span>
  </div>
  <h1 class="page-title">Themes</h1>
  <p class="page-sub">
    Every token maps to one CSS variable — <code>--fp-&lt;type&gt;</code> — and one class,
    <code>.fp__token--&lt;type&gt;</code>. A theme is a block of declarations you drop in.
  </p>
</section>

<section class="col section">
  <div class="section__head">
    <span class="label label--accent">01 /</span>
    <h2 class="section__title">Comfortable by default</h2>
  </div>
  <p class="lede">Pick a swatch to explore another palette.</p>

  <div class="stage" use:reveal>
    <div class="stage__bar">
      <span class="label">{theme.name} · {mode}</span>
      <ThemeBar bind:index={themeIndex} bind:mode />
    </div>
    <div class="frame">
      <CodePanel title={`preview.tsx · ${theme.name}`} code={preview} lang="tsx" theme={palette} />
    </div>
  </div>
</section>

<section class="col section">
  <div class="section__head">
    <span class="label label--accent">02 /</span>
    <h2 class="section__title">Copy the CSS</h2>
  </div>

  <div class="block">
    <p class="lede">
      Set the light palette on <code>:root</code>, and the dark palette under
      <code>:root[data-theme='dark']</code> (or a <code>prefers-color-scheme</code> block).
    </p>
    <div class="pair" use:reveal>
      <CodePanel title="light.css" code={lightCss} lang="css" theme={theme.light} copy={false} />
      <CodePanel title="dark.css" code={darkCss} lang="css" theme={theme.dark} />
    </div>
  </div>

  <div class="block">
    <h3 class="block__title">Tailwind</h3>
    <p class="lede">
      Prefer utilities? Point the variables at your Tailwind colours, then use
      <code>cx</code> for per-token emphasis.
    </p>
    <CodePanel title="app.css" code={tailwind} lang="css" theme={docTheme} />
  </div>
</section>

<section class="col section">
  <div class="section__head">
    <span class="label label--accent">03 /</span>
    <h2 class="section__title">Indented Sass</h2>
  </div>
  <p class="lede">
    fractalpop's headline feature: brace-less, semicolon-less Sass, coloured by
    indentation. The same theme variables style it — here is how Sass constructs map to
    tokens.
  </p>
  <CodePanel title={`card.sass · ${theme.name}`} code={sassPreview} lang="sass" theme={palette} />
  <div class="map">
    {#each sassMap as [k, v]}
      <div class="map__row">
        <code class="map__k">{k}</code>
        <span class="map__arrow">→</span>
        <span class="map__v" style="color:var(--fp-{v});{style}">{v}</span>
      </div>
    {/each}
  </div>
</section>
