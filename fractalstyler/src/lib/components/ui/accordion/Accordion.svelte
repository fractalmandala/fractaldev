<script lang="ts">
	import { setContext, type Snippet } from 'svelte'
	import { AccordionContext, ACCORDION_KEY, type AccordionMode, type IconPlacement } from './context.svelte.js'

	interface Props {
		/** `multiple` — any number open. `single` — one open, clicking it does not close it. `single-collapsible` — one open, clicking it closes it. */
		mode?: AccordionMode
		iconPlacement?: IconPlacement
		/** Heading level (1–6) wrapping each trigger, or `none` to omit the heading. */
		headingLevel?: string
		children: Snippet
	}

	let {
		mode = 'multiple',
		iconPlacement = 'end',
		headingLevel = '3',
		children
	}: Props = $props()

	const ctx = new AccordionContext(() => ({ mode, iconPlacement, headingLevel }))
	setContext(ACCORDION_KEY, ctx)

	export function expandAll() { ctx.expandAll() }
	export function collapseAll() { ctx.collapseAll() }
</script>

<div class="accordion">
	{@render children()}
</div>
