<script lang="ts">
	import ToastItem from './ToastItem.svelte';

	export interface ToastData {
		id: string;
		title?: string;
		description?: string;
		variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
		duration?: number;
	}

	interface Props {
		toasts: ToastData[];
		onDismiss?: (id: string) => void;
		/** Corner where the stack is pinned. */
		position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
		class?: string;
	}

	let { toasts, onDismiss, position = 'bottom-right', class: className = '' }: Props = $props();
</script>

<div
	class="k-toast-viewport {className}"
	data-position={position}
	aria-live="polite"
	aria-label="Notifications"
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
