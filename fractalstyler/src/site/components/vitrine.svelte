<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { Specimen } from '$site/types.js'
	import { presetAttrs } from '$site/data/specimen.svelte.js'

	/**
	 * The vitrine — a lit rectangle of real, compiled Fractalstyler against the
	 * void. Everything inside it is the actual system; everything outside is
	 * this deck's own chrome and touches no Fractalstyler token.
	 *
	 * The four preset axes are stamped HERE rather than on <html>, which the
	 * token file permits: every preset selector in _00_tokens.sass is a bare
	 * attribute selector, so it resolves on any element.
	 */
	interface Props {
		children: Snippet
		/** The shared specimen — its preset axes are stamped on the stage root. */
		specimen?: Specimen
		/** Give the stage room — for shells and grids rather than single cards. */
		tall?: boolean
		/** Constrain the stage to the simulated viewport width. */
		width?: number
		label?: string
	}

	let { children, specimen, tall = false, width, label }: Props = $props()

	/* Preset axes resolve on any element (bare attribute selectors in
	   _00_tokens.sass), so stamping them here restyles the specimen while the
	   page around it does not. Absent axes stay absent — the default. */
	const attrs = $derived(specimen ? presetAttrs(specimen.presets) : {})
	const theme = $derived(specimen?.presets.theme ?? '')
</script>
<div class="box xcenter gap-2xs wfull">
	<!-- The preset attributes are stamped here rather than on <html>, so the
	     specimen restyles and the page around it does not. -->
	<div class="wfull border radius-md {theme}" {...attrs}>
		<div class="box ycenter pad-md wfull" class:hfull={tall} style:max-width={width ? `${width}px` : null}>
			{@render children()}
		</div>
	</div>
	{#if label}<span class="text-xs text-muted tt-u">{label}</span>{/if}
</div>
