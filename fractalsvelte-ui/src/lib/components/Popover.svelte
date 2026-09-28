<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { PopoverPlacement } from '#lib/data/componentTypes.ts';

	export type Placement = PopoverPlacement;

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		placement?: PopoverPlacement;
		/** Rendered label for the trigger. */
		label?: Snippet;
		/** Trigger content (defaults to a labelled button). */
		trigger?: Snippet;
		children?: Snippet;
		class?: string;
		[key: string]: unknown;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		placement = 'bottom',
		label,
		trigger,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	let wrap: HTMLSpanElement | undefined = $state();
	const rootClass = $derived(`k-popover-wrap ${className}`.trim());

	function toggle() {
		open = !open;
		onOpenChange?.(open);
	}

	function close() {
		if (open) {
			open = false;
			onOpenChange?.(false);
		}
	}

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (open && !wrap?.contains(e.target as Node)) close();
		}
		function onDocKey(e: KeyboardEvent) {
			if (open && e.key === 'Escape') close();
		}
		document.addEventListener('click', onDocClick);
		document.addEventListener('keydown', onDocKey);
		return () => {
			document.removeEventListener('click', onDocClick);
			document.removeEventListener('keydown', onDocKey);
		};
	});
</script>

<span class={rootClass} bind:this={wrap} {...rest}>
	{#if trigger}
		{@render trigger?.()}
	{:else}
		<button
			type="button"
			class="k-popover-trigger"
			data-state={open ? 'open' : undefined}
			onclick={toggle}
			aria-expanded={open}
		>
			{#if label}{@render label?.()}{:else}Open popover{/if}
		</button>
	{/if}
	<div class="k-popover" data-placement={placement} data-open={open} hidden={!open}>
		{@render children?.()}
	</div>
</span>

<style lang="sass">

.k-popover-wrap
	position: relative
	display: inline-flex

.k-popover-trigger
	display: inline-flex
	align-items: center
	justify-content: center
	gap: var(--space-xs)
	padding-inline: var(--space-sm)
	height: var(--control-h-md, 24px)
	border: 1px solid var(--border)
	border-radius: var(--radius-sm)
	font-family: inherit
	font-size: var(--text-sm)
	font-weight: 500
	background: var(--bg-raised)
	color: var(--text-primary)
	cursor: pointer
	transition: background var(--motionin1), border-color var(--motionin1)

	&:hover
		background: var(--state-hover)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 1px

.k-popover
	position: absolute
	z-index: var(--z-modal, 1000)
	top: calc(100% + 8px)
	left: 50%
	transform: translateX(-50%)
	display: flex
	flex-direction: column
	gap: 8px
	padding: 16px
	background: var(--bg-popover, var(--bg-surface))
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.15))
	max-width: min(320px, 90vw)
	min-width: 180px

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
