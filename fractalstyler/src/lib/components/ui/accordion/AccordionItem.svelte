<script lang="ts">
	import { getContext, type Snippet } from 'svelte'
	import Chevron from '$lib/icons/chevron-right.svelte'
	import { ACCORDION_KEY, type AccordionContext, type ItemHandle } from './context.svelte.js'

	interface Props {
		/** Plain-text label. Use the `label` snippet instead when you need markup. */
		text?: string
		expanded?: boolean
		disabled?: boolean
		/** Return `false` to cancel the expand. */
		onexpand?: () => boolean | void
		/** Return `false` to cancel the collapse. */
		oncollapse?: () => boolean | void
		onafterexpand?: () => void
		onaftercollapse?: () => void
		label?: Snippet
		icon?: Snippet<[boolean]>
		children: Snippet
	}

	let {
		text = '',
		expanded = $bindable(false),
		disabled = false,
		onexpand,
		oncollapse,
		onafterexpand,
		onaftercollapse,
		label,
		icon,
		children
	}: Props = $props()

	// An item outside a group still works; it just governs itself.
	const ctx = getContext<AccordionContext | undefined>(ACCORDION_KEY)

	const uid = $props.id()
	const headingLevel = $derived(ctx?.headingLevel ?? '3')
	const iconPlacement = $derived(ctx?.iconPlacement ?? 'end')
	const heading = $derived.by(() => {
		if (headingLevel === 'none') return null
		const level = parseInt(headingLevel, 10)
		return `h${level >= 1 && level <= 6 ? level : 3}`
	})

	let trigger = $state<HTMLButtonElement>()

	function expand() {
		if (expanded || disabled) return
		if (onexpand?.() === false) return
		expanded = true
	}

	function collapse() {
		if (!expanded || disabled) return
		if (oncollapse?.() === false) return
		expanded = false
	}

	export function toggle() {
		if (ctx) ctx.toggle(handle)
		else if (expanded) collapse()
		else expand()
	}

	export function focus(options?: FocusOptions) {
		trigger?.focus(options)
	}

	const handle: ItemHandle = {
		el: undefined as unknown as HTMLElement,
		get disabled() { return disabled },
		get expanded() { return expanded },
		expand,
		collapse,
		focus
	}

	function join(node: HTMLElement) {
		handle.el = node
		return ctx?.register(handle)
	}

	// The panel animates via grid-template-rows in SASS, so "after expand/collapse"
	// is just that transition ending — no animation bookkeeping in JS.
	function settled(event: TransitionEvent) {
		if (event.propertyName !== 'grid-template-rows') return
		if (expanded) onafterexpand?.()
		else onaftercollapse?.()
	}
</script>

{#snippet button()}
	<button
		bind:this={trigger}
		type="button"
		class="accordion-trigger"
		id="{uid}-trigger"
		aria-expanded={expanded}
		aria-controls="{uid}-panel"
		aria-disabled={disabled}
		tabindex={disabled ? -1 : 0}
		onclick={toggle}
		onkeydown={(e) => ctx?.keydown(e, handle)}
	>
		{#if iconPlacement === 'start'}
			<span>{#if icon}{@render icon(expanded)}{:else}<Chevron rotate={expanded} />{/if}</span>
		{/if}
		<span>{#if label}{@render label()}{:else}{text}{/if}</span>
		{#if iconPlacement === 'end'}
			<span>{#if icon}{@render icon(expanded)}{:else}<Chevron rotate={expanded} />{/if}</span>
		{/if}
	</button>
{/snippet}

<div class="accordion-item" class:open={expanded} {@attach join}>
	{#if heading}
		<svelte:element this={heading}>{@render button()}</svelte:element>
	{:else}
		{@render button()}
	{/if}

	<div
		class="accordion-content"
		id="{uid}-panel"
		role="region"
		aria-labelledby="{uid}-trigger"
		inert={!expanded}
		ontransitionend={settled}
	>
		<div class="accordion-panel">
			{@render children()}
		</div>
	</div>
</div>
