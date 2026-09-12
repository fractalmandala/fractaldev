<script lang="ts">
	interface Props {
		/** Content of the card. */
		content?: import('svelte').Snippet;
		/** Fallback text content. */
		text?: string;
		placement?: 'top' | 'bottom' | 'left' | 'right';
		/** Hover delay before showing, ms. */
		delay?: number;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		content,
		text,
		placement = 'bottom',
		delay = 150,
		class: className = '',
		children
	}: Props = $props();

	let open = $state(false);
	let showTimer: ReturnType<typeof setTimeout> | undefined = $state();
	let hideTimer: ReturnType<typeof setTimeout> | undefined = $state();

	function show() {
		clearTimeout(hideTimer);
		showTimer = setTimeout(() => (open = true), delay);
	}

	function hide() {
		clearTimeout(showTimer);
		hideTimer = setTimeout(() => (open = false), 80);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -- hover/focus wrapper around the trigger -->
<span
	class="k-popover-wrap {className}"
	onmouseenter={show}
	onmouseleave={hide}
	onfocusin={show}
	onfocusout={hide}
	onkeydown={onKeydown}
>
	{@render children?.()}
	<div class="k-popover k-hovercard" data-placement={placement} data-open={open} hidden={!open}>
		{#if content}{@render content?.()}{:else}{text}{/if}
	</div>
</span>
