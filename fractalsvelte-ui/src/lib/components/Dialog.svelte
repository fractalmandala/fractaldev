<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		title: string;
		description?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};

	let {
		open = $bindable(false),
		title,
		description,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	let dialog: HTMLDialogElement;
	const rootClass = $derived(`dialog ${className}`.trim());

	function closeDialog() {
		open = false;
	}

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	class={rootClass}
	bind:this={dialog}
	onclose={closeDialog}
	aria-labelledby="dialog-title"
	{...rest}
>
	<div class="dialog-header">
		<div>
			<h2 id="dialog-title">{title}</h2>
			{#if description}<p>{description}</p>{/if}
		</div>
		<button class="dialog-close" type="button" aria-label="Close dialog" onclick={closeDialog}>×</button>
	</div>
	<div class="dialog-body">{@render children?.()}</div>
</dialog>

<style lang="sass">

.dialog
	position: fixed
	top: 50%
	left: 50%
	translate: -50% -50%
	margin: 0
	padding: 0
	z-index: var(--z-modal, 1000)
	max-width: min(92vw, 540px)
	width: 100%
	background: var(--bg-surface, var(--bg-raised))
	color: var(--text-primary)
	border: 1px solid var(--border)
	border-radius: var(--radius-lg)
	box-shadow: var(--shadow-lg, 0 16px 40px rgba(0, 0, 0, 0.24))

	&:not([open])
		display: none

	&::backdrop
		background: rgba(0, 0, 0, 0.5)
		backdrop-filter: blur(2px)

	&-header
		display: flex
		align-items: flex-start
		justify-content: space-between
		gap: calc(var(--space-xs) * var(--gap-scale, 1))
		padding: calc(var(--space-sm) * var(--pad-scale, 1)) calc(var(--space-sm) * var(--pad-scale, 1)) calc(var(--space-xs) * var(--pad-scale, 1))

		h2
			font-family: inherit
			font-size: var(--text-lg)
			font-weight: 600
			margin: 0

		p
			margin-top: calc(var(--space-3xs) * var(--gap-scale, 1))
			margin-bottom: 0
			font-size: var(--text-sm)
			color: var(--text-secondary)

	&-close
		display: inline-flex
		align-items: center
		justify-content: center
		width: 28px
		height: 28px
		padding: 0
		background: none
		border: 0
		border-radius: var(--radius-sm)
		color: var(--text-muted)
		font-size: var(--text-lg)
		cursor: pointer
		transition: background var(--motionin1), color var(--motionin1)

		&:hover
			background: var(--state-hover)
			color: var(--text-primary)

		&:focus-visible
			outline: 2px solid var(--ring)
			outline-offset: 1px

	&-body
		padding: calc(var(--space-2xs) * var(--pad-scale, 1)) calc(var(--space-sm) * var(--pad-scale, 1)) calc(var(--space-sm) * var(--pad-scale, 1))
		font-size: var(--text-sm)
		color: var(--text-secondary)
</style>
