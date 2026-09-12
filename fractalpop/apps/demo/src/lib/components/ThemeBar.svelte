<script lang="ts">
  import { themes, paletteFor, type Mode } from '$lib/themes'

  interface Props {
    index: number
    mode: Mode
    /** Set on white backgrounds so the swatch rings pick up the hairline colour. */
    light?: boolean
  }
  let { index = $bindable(), mode = $bindable(), light = false }: Props = $props()
</script>

<!-- A swatch shows the palette that will actually be applied under the current
     mode — the disc is the editor background, the dot is the keyword colour.
     Anything else makes the picker lie about what you get. -->
<div class="themebar" class:themebar--light={light}>
  {#each themes as t, i}
    {@const p = paletteFor(t, mode)}
    <button
      class="swatch"
      aria-pressed={i === index}
      aria-label={t.name}
      title={t.name}
      style="background:{p.background}"
      onclick={() => (index = i)}
    >
      <span class="swatch__dot" style="background:{p.keyword}"></span>
    </button>
  {/each}

  <button
    class="swatch swatch--mode"
    aria-label="Toggle the preview between light and dark"
    title="Light / dark preview"
    onclick={() => (mode = mode === 'dark' ? 'light' : 'dark')}
  ></button>
</div>
