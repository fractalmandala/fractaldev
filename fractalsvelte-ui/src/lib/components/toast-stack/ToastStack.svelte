<script lang="ts">
	import { untrack } from 'svelte';
	import { AnimatePresence } from '@humanspeak/svelte-motion';
	import type { AnimatedToastStackProps } from './types.js';
	import ToastStackItem from './ToastStackItem.svelte';

	let {
		toasts,
		onDismiss,
		position = 'bottom-right',
		placement,
		fixed = false,
		portal,
		portalRoot,
		maxVisible = 4,
		class: className,
		classNames,
		icons,
		renderToast
	}: AnimatedToastStackProps = $props();

	const visibleToasts = $derived(toasts.slice(-maxVisible));
	const isBottom = $derived(position.startsWith('bottom'));
	const resolvedPlacement = $derived(placement ?? (fixed ? 'fixed' : 'static'));
	const shouldPortal = $derived(portal ?? resolvedPlacement === 'fixed');

	let portalTarget = $state<Element | null>(null);
	let stackEl = $state<HTMLOListElement | null>(null);

	$effect(() => {
		portalTarget = shouldPortal ? (portalRoot ?? document.body) : null;
	});

	// Port of createPortal: move the mounted <ol> into the target. When the
	// target is null (static placement) the list renders in place.
	$effect(() => {
		const el = untrack(() => stackEl);
		const target = untrack(() => portalTarget);
		if (!el || !target) return;
		if (el.parentElement === target) return;
		target.appendChild(el);
	});
</script>

{#if !shouldPortal || portalTarget}
	<ol
		bind:this={stackEl}
		aria-live="polite"
		aria-atomic="false"
		data-slot="toast-stack"
		data-placement={resolvedPlacement}
		data-position={position}
		data-direction={isBottom ? 'bottom' : 'top'}
		class={[classNames?.root, className].filter(Boolean).join(' ')}
	>
		<AnimatePresence initial={false} mode="popLayout">
			{#each visibleToasts as toast, index (toast.id)}
				<ToastStackItem
					{toast}
					{index}
					{onDismiss}
					{classNames}
					{icons}
					{renderToast}
				/>
			{/each}
		</AnimatePresence>
	</ol>
{/if}

<style lang="sass">
[data-slot='toast-stack']
	display: flex
	flex-direction: column
	list-style: none
	margin: 0
	padding: 0
	gap: var(--space-2xs)
	width: min(360px, 92vw)

	&[data-position='bottom-right']
		align-items: flex-end

	&[data-position='bottom-left']
		align-items: flex-start

	&[data-position='top-right']
		align-items: flex-end

	&[data-position='top-left']
		align-items: flex-start

	&[data-position^='top']
		flex-direction: column-reverse

:global([data-slot='toast-item'])
	width: 100%

:global([data-slot='toast-item-surface'])
	display: flex
	flex-direction: column
	gap: var(--space-3xs)
	padding: var(--space-xs) var(--space-sm)
	background: var(--bg-popover)
	border: 1px solid var(--border)
	border-radius: var(--radius-6)
	box-shadow: var(--shadow-popover)

:global([data-slot='toast-item-row'])
	display: flex
	align-items: flex-start
	gap: var(--space-2xs)

:global([data-slot='toast-item-icon'])
	display: inline-flex
	align-items: center
	justify-content: center
	width: 22px
	height: 22px
	border-radius: var(--radius-full)

	&[data-status='success']
		color: var(--success)

	&[data-status='error']
		color: var(--danger)

	&[data-status='info']
		color: var(--info)

	&[data-status='warning']
		color: var(--warning)

	&[data-status='loading']
		color: var(--text-muted)

:global([data-slot='toast-content'])
	flex: 1 1 auto
	display: flex
	flex-direction: column
	gap: 2px
	min-width: 0

:global([data-slot='toast-title'])
	color: var(--text-primary)
	font-size: var(--text-sm)
	font-weight: 600

:global([data-slot='toast-description'])
	color: var(--text-secondary)
	font-size: var(--text-sm)
	line-height: 1.45

:global([data-slot='toast-action'])
	align-self: flex-start
	border: 0
	background: transparent
	color: var(--text-secondary)
	font-size: var(--text-sm)
	cursor: pointer

	&:hover
		color: var(--text-primary)

:global([data-slot='toast-close'])
	align-self: center
	display: inline-flex
	align-items: center
	justify-content: center
	width: 22px
	height: 22px
	border: 0
	border-radius: var(--radius-full)
	background: transparent
	color: var(--text-secondary)
	cursor: pointer

	&:hover
		background: var(--state-hover)
		color: var(--text-primary)
</style>
