<script lang="ts">
	import { onMount } from 'svelte';

	type Placement = 'top' | 'bottom' | 'left' | 'right';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		placement?: Placement;
		/** Rendered label for the trigger. */
		label?: import('svelte').Snippet;
		/** Trigger content (defaults to a labelled button). */
		trigger?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		class?: string;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		placement = 'bottom',
		label,
		trigger,
		children,
		class: className = ''
	}: Props = $props();

	let wrap: HTMLSpanElement | undefined = $state();

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

<span class="k-popover-wrap {className}" bind:this={wrap}>
	{#if trigger}
		{@render trigger?.()}
	{:else}
		<button
			class="k-button"
			data-variant="secondary"
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
