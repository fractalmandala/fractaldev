<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luMenu, luX } from 'fractalicons/lucide';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		label?: string;
		class?: string;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		label = 'Toggle navigation',
		class: className = ''
	}: Props = $props();

	function toggle() {
		open = !open;
		onOpenChange?.(open);
	}

	const rootClass = $derived(`k-icon-button ${className}`.trim());
</script>

<button
	type="button"
	class={rootClass}
	data-variant="outline"
	aria-label={label}
	aria-expanded={open}
	aria-controls="k-mobile-nav"
	onclick={toggle}
>
	{#if open}<Icon icon={luX} size={18} />{:else}<Icon icon={luMenu} size={18} />{/if}
</button>

<style lang="sass">
.k-icon-button
	display: inline-flex
	align-items: center
	justify-content: center
	width: 36px
	height: 36px
	padding: 0
	border-radius: var(--radius-6)
	border: 1px solid var(--border)
	background: var(--bg)
	color: var(--text-secondary)
	cursor: pointer
	transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease

	&:hover
		background: var(--state-hover)
		color: var(--text-primary)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

	&[data-variant='solid']
		background: var(--theme-color)
		color: var(--text-inverse)

		&:hover
			background: var(--theme-color-alt)
			color: var(--text-inverse)
</style>
