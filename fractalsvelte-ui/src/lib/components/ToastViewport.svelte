<script lang="ts">
	import ToastItem from './ToastItem.svelte';
	import type { BannerVariant, ToastPosition } from '#lib/data/componentTypes.ts';

	export interface ToastData {
		id: string;
		title?: string;
		description?: string;
		variant?: BannerVariant;
		duration?: number;
	}

	interface Props {
		toasts: ToastData[];
		onDismiss?: (id: string) => void;
		/** Corner where the stack is pinned. */
		position?: ToastPosition;
		class?: string;
		[key: string]: unknown;
	}

	let {
		toasts,
		onDismiss,
		position = 'bottom-right',
		class: className = '',
		...rest
	}: Props = $props();

	const rootClass = $derived(`k-toast-viewport ${className}`.trim());
</script>

<div
	class={rootClass}
	data-position={position}
	aria-live="polite"
	aria-label="Notifications"
	{...rest}
>
	{#each toasts as toast (toast.id)}
		<ToastItem
			variant={toast.variant}
			title={toast.title}
			description={toast.description}
			duration={toast.duration}
			onDismiss={() => onDismiss?.(toast.id)}
		/>
	{/each}
</div>

<style lang="sass">

.k-toast-viewport
	position: fixed
	z-index: var(--z-toast, 2000)
	display: flex
	flex-direction: column
	gap: 8px
	width: min(360px, 92vw)
	pointer-events: none

	:global(.k-toast)
		pointer-events: auto

	&[data-position='bottom-right']
		right: 16px
		bottom: 16px

	&[data-position='bottom-left']
		left: 16px
		bottom: 16px

	&[data-position='top-right']
		right: 16px
		top: 16px

	&[data-position='top-left']
		left: 16px
		top: 16px
</style>
