<script lang="ts">
	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		/** true = modal (blocks page), false = non-modal overlay. */
		modal?: boolean;
		closeOnBackdrop?: boolean;
		label?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		modal = true,
		closeOnBackdrop = true,
		label = 'Overlay',
		class: className = '',
		children
	}: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	const uid = Math.random().toString(36).slice(2, 8);

	$effect(() => {
		const el = dialog;
		if (!el) return;
		if (open) {
			if (!el.open) {
				if (modal) el.showModal();
				else el.show();
			}
		} else if (el.open) {
			el.close();
		}
	});

	function handleClose() {
		if (!open) return;
		open = false;
		onOpenChange?.(false);
	}

	function onBackdrop(e: MouseEvent) {
		if (closeOnBackdrop && e.target === dialog) dialog?.close();
	}

	const rootClass = $derived(`k-overlay-panel ${className}`.trim());
</script>

<dialog
	bind:this={dialog}
	class={rootClass}
	aria-label={label}
	onclose={handleClose}
	onclick={onBackdrop}
>
	{@render children?.()}
</dialog>

<style lang="sass">
.k-overlay-panel
	display: flex
	flex-direction: column
	max-width: min(560px, 92vw)
	max-height: 85vh
	overflow: auto
	background: var(--bg-popover)
	border: 1px solid var(--border)
	border-radius: var(--radius-16)
	box-shadow: var(--shadow-lg)
	padding: 0
	color: inherit

	&::backdrop
		background: rgba(0, 0, 0, 0.45)
</style>
