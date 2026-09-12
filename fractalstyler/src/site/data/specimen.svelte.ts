import type { Presets, Specimen, SpaceStep } from '$site/types.js'

/**
 * The specimen — one artifact, mutated by every rig, never reset between
 * screens. This is what makes the deck an assembly rather than nine demos.
 *
 * The ledger markup is DERIVED from this same object (see markup()), so the
 * code shown to the reader cannot drift from the thing being rendered.
 */

export const SPACE_STEPS: SpaceStep[] = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']

export function initialPresets(): Presets {
	return { theme: '', shape: '', layout: '', color: '', motion: '', mode: 'dark' }
}

export function initialSpecimen(): Specimen {
	return {
		viewport: 1240,
		gap: 'sm',
		pad: 'sm',
		axis: 'row',
		alignX: 'xbetween',
		alignY: 'ycenter',
		count: 6,
		drawer: false,
		surface: 'surface',
		bordered: true,
		radius: 'radius-md',
		presets: initialPresets()
	}
}

/** The attribute set the vitrine root carries. Absent axes stay absent. */
export function presetAttrs(p: Presets): Record<string, string> {
	const attrs: Record<string, string> = { 'data-mode': p.mode }
	if (p.shape) attrs['data-shape'] = p.shape
	if (p.layout) attrs['data-layout'] = p.layout
	if (p.color) attrs['data-color'] = p.color
	if (p.motion) attrs['data-motion'] = p.motion
	return attrs
}

/** The specimen's own root classes, in the order the deck reveals them. */
export function rootClasses(s: Specimen, upto: number): string[] {
	const out: string[] = []
	if (upto >= 2) out.push(s.axis, `gap-${s.gap}`, `pad-${s.pad}`)
	if (upto >= 3) out.push(s.alignY, s.alignX)
	if (upto >= 6) {
		out.push(s.surface)
		if (s.bordered) out.push('border')
		if (s.radius) out.push(s.radius)
	}
	return out
}

/**
 * The running markup, rebuilt from state on every change. `upto` is the
 * current screen index — earlier screens' lines stay, later ones have not
 * happened yet.
 */
export function markup(s: Specimen, upto: number): string[] {
	if (upto <= 1) return ['<div>', '  <h3>Fractalstyler</h3>', '  <p>Compose in markup.</p>', '</div>']

	const root = rootClasses(s, upto).join(' ')
	const dressed = upto >= 6
	return [
		`<div class="${root}">`,
		'  <div class="box gap-3xs min0">',
		dressed
			? '    <span class="text-md weight-600 text-primary">Fractalstyler</span>'
			: '    <span>Fractalstyler</span>',
		dressed
			? '    <span class="text-xs text-muted">Compose in markup.</span>'
			: '    <span>Compose in markup.</span>',
		'  </div>',
		dressed
			? '  <button class="button primary shrink-0">Continue</button>'
			: '  <button>Continue</button>',
		'</div>'
	]
}

/** The canonical L4 skeleton, shown on the enclosure screen. Docs 08 §1. */
export function shellMarkup(): string[] {
	return [
		'<div class="app-shell">',
		'  <header class="app-header row ycenter xbetween">…</header>',
		'  <main class="app-main">',
		'    <aside class="sidebar-left"><nav class="navtree">…</nav></aside>',
		'    <section class="main-section">',
		'      <article class="content-shell">…</article>',
		'    </section>',
		'    <aside class="sidebar-right"><nav class="toc">…</nav></aside>',
		'  </main>',
		'  <footer class="app-footer">…</footer>',
		'</div>'
	]
}
