<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PopoverPlacement } from '#lib/data/componentTypes.ts';

	interface Props {
		/** Content of the card. */
		content?: Snippet;
		/** Fallback text content. */
		text?: string;
		placement?: PopoverPlacement;
		/** Hover delay before showing, ms. */
		delay?: number;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		content,
		text,
		placement = 'bottom',
		delay = 150,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	let open = $state(false);
	let showTimer: ReturnType<typeof setTimeout> | undefined = $state();
	let hideTimer: ReturnType<typeof setTimeout> | undefined = $state();
	const rootClass = $derived(`k-hovercard-wrap ${className}`.trim());

	function show() {
		clearTimeout(hideTimer);
		showTimer = setTimeout(() => (open = true), delay);
	}

	function hide() {
		clearTimeout(showTimer);
		hideTimer = setTimeout(() => (open = false), 80);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	class={rootClass}
	onmouseenter={show}
	onmouseleave={hide}
	onfocusin={show}
	onfocusout={hide}
	onkeydown={onKeydown}
	{...rest}
>
	{@render children?.()}
	<div class="k-hovercard" data-placement={placement} data-open={open} hidden={!open}>
		{#if content}{@render content?.()}{:else}{text}{/if}
	</div>
</span>

<style lang="sass">

.k-hovercard-wrap
	position: relative
	display: inline-flex

.k-hovercard
	position: absolute
	z-index: var(--z-modal, 1000)
	top: calc(100% + 8px)
	left: 50%
	transform: translateX(-50%)
	display: flex
	flex-direction: column
	gap: 8px
	padding: 12px 16px
	background: var(--bg-popover, var(--bg-surface))
	color: var(--text-primary)
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.15))
	max-width: min(320px, 90vw)
	min-width: 180px
	pointer-events: auto

	&[data-placement='top']
		top: auto
		bottom: calc(100% + 8px)
		transform: translateX(-50%)

	&[data-placement='left']
		top: 50%
		left: auto
		right: calc(100% + 8px)
		transform: translateY(-50%)

	&[data-placement='right']
		top: 50%
		left: calc(100% + 8px)
		transform: translateY(-50%)

	&[data-open='false']
		display: none
</style>
