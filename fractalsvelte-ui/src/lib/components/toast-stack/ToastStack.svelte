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
