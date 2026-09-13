<script lang="ts">
  import { themes, paletteFor, type Mode } from '$lib/themes'
	import Switch from '$lib/components/Switch.svelte'
  interface Props {
    index: number
    mode: Mode
    /** Set on white backgrounds so the swatch rings pick up the hairline colour. */
    light?: boolean
  }
  let { index = $bindable(), mode = $bindable(), light = false }: Props = $props()
</script>
<div class="themebar" class:themebar--light={light}>
  {#each themes as t, i}
    {@const p = paletteFor(t, mode)}
    <button
      class="swatch"
      aria-pressed={i === index}
      aria-label={t.name}
      title={t.name}
      onclick={() => (index = i)}
			class:active={i === index}
    >
			<span class="swatch-1" style="background:{p.keyword}"></span>
      <span class="swatch-2" style="background:{p.entity}"></span>
			<span class="swatch-3" style="background:{p.property}"></span>
    </button>
  {/each}
	<Switch pressed={mode === 'dark'} onPressedChange={() => (mode = mode === 'dark' ? 'light' : 'dark')}>
		<div class="white-box swatch-mode" class:active={mode === 'light'}></div>
		<div class="black-box swatch-mode" class:active={mode === 'dark'}></div>
	</Switch>
</div>
