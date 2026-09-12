<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		title: string;
		description?: string;
		children?: Snippet;
	};

	let { open = $bindable(false), title, description, children }: Props = $props();
	let dialog: HTMLDialogElement;

	function closeDialog() {
		open = false;
	}

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog class="dialog" bind:this={dialog} onclose={closeDialog} aria-labelledby="dialog-title">
	<div class="dialog-header">
		<div>
			<h2 id="dialog-title">{title}</h2>
			{#if description}<p>{description}</p>{/if}
		</div>
		<button class="dialog-close is-icon" type="button" aria-label="Close dialog" onclick={closeDialog}>×</button>
	</div>
	<div class="dialog-body">{@render children?.()}</div>
</dialog>
