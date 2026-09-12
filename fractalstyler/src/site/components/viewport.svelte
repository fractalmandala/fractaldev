<script lang="ts">
	import type { Specimen } from '$site/types.js'
	import { presetAttrs } from '$site/data/specimen.svelte.js'
	// The live parent stylesheet, scraped at runtime (see below) — byte-for-byte
	// what a consumer of the package gets, in dev and in build.

	/**
	 * A stage whose *viewport* is adjustable, not just its width.
	 *
	 * Fractalstyler's grids and shells step on media queries, which answer to
	 * the real viewport — narrowing a div proves nothing. An iframe carries its
	 * own viewport, so the breakpoints in _04_layouts.sass and _05_shells.sass
	 * fire for real at the widths the docs name.
	 */
	interface Props {
		specimen: Specimen
		html: string
		height?: number
	}

	let { specimen, html, height = 320 }: Props = $props()

	const attrs = $derived(
		Object.entries(presetAttrs(specimen.presets))
			.map(([k, v]) => `${k}="${v}"`)
			.join(' ')
	)

	/* The live stylesheet, scraped once from the parent document — byte-for-byte
	   the same CSS the page renders. A static import cannot do this: the
	   used-only plugin prunes selectors per build, and production emits the
	   file under a hashed asset name. Scraping works in dev and in build. */
	let css = $state('')
	$effect(() => {
		const out: string[] = []
		for (const sheet of Array.from(document.styleSheets)) {
			try {
				for (const rule of Array.from(sheet.cssRules)) out.push(rule.cssText)
			} catch {
				/* cross-origin sheet — unreadable, skip */
			}
		}
		css = out.join('\n')
	})

	/* A complete document: the frame carries its own viewport, so the
	   breakpoints in _04_layouts.sass and _05_shells.sass fire for real. */
	const doc = $derived(
		`<!doctype html><html><head><meta charset="utf-8">` +
			`<style>html,body{margin:0;padding:0;background:transparent}body{box-sizing:border-box;padding:20px}</style>` +
			`<style>${css}</style></head><body ${attrs}>${html}</body></html>`
	)

	let avail = $state(0)
	const scale = $derived(avail ? Math.min(1, avail / specimen.viewport) : 1)
	const shownW = $derived(Math.round(specimen.viewport * scale))
	const shownH = $derived(Math.round(height * scale))

</script>
<div class="box xcenter gap-2xs wfull" bind:clientWidth={avail}>
	<!-- Width and transform are per-render values, so they belong in style
	     attributes. No stylesheet involved. -->
	<div
		class="border radius-md relative"
		style:width="{shownW}px"
		style:height="{shownH}px"
		style:overflow="hidden"
	>
		<iframe
			title="Responsive stage"
			scrolling="no"
			srcdoc={doc}
			style:width="{specimen.viewport}px"
			style:height="{height}px"
			style:transform="scale({scale})"
			style:transform-origin="top left"
			style:border="0"
			style:display="block"
		></iframe>
	</div>
	<span class="row ycenter gap-2xs text-xs mono">
		<b class="text-theme weight-600">{specimen.viewport}px</b>
		{#if scale < 1}<span class="text-muted">shown at {Math.round(scale * 100)}%</span>{/if}
	</span>
</div>
