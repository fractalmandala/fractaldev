<script lang="ts">
	import CheckIndicator from './CheckIndicator.svelte';

	interface Props {
		selected?: boolean;
		onSelectedChange?: (selected: boolean) => void;
		title?: string;
		description?: string;
		disabled?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		selected = $bindable(false),
		onSelectedChange,
		title,
		description,
		disabled = false,
		class: className = '',
		children
	}: Props = $props();

	const rootClass = $derived(['k-selectable-card', className].filter(Boolean).join(' '));

	function toggle() {
		if (disabled) return;
		selected = !selected;
		onSelectedChange?.(selected);
	}
</script>

<button
	type="button"
	class={rootClass}
	data-state={selected ? 'selected' : undefined}
	aria-pressed={selected}
	{disabled}
	onclick={toggle}
>
	<CheckIndicator state={selected ? 'checked' : 'unchecked'} />
	<span class="box gap-3xs grow">
		{#if title}<span class="k-card-title">{title}</span>{/if}
		{#if description}<span class="k-card-desc">{description}</span>{/if}
		{@render children?.()}
	</span>
</button>

<style lang="sass">
.k-selectable-card
	display: flex
	align-items: flex-start
	gap: 12px
	width: 100%
	padding: var(--space-sm)
	text-align: left
	background: var(--bg-surface)
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	color: var(--text-primary)
	cursor: pointer
	transition: border-color var(--motion-fast) ease, background-color var(--motion-fast) ease, box-shadow var(--motion-fast) ease
	&:hover
		background: var(--state-hover)
	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px
	&[data-state='selected']
		border-color: var(--theme-color)
		background: color-mix(in srgb, var(--theme-color) 6%, var(--bg-surface))
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--theme-color) 30%, transparent)
	&:disabled
		opacity: 0.5
		cursor: not-allowed

.k-card-title
	font-size: var(--text-lg)
	font-weight: 600

.k-card-desc
	font-size: var(--text-sm)
	color: var(--text-muted)
</style>
