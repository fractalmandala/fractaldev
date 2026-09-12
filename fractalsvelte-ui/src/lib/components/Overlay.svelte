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
</script>

<dialog
	bind:this={dialog}
	class="k-overlay-panel {className}"
	aria-label={label}
	onclose={handleClose}
	onclick={onBackdrop}
>
	{@render children?.()}
</dialog>
