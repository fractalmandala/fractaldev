<script lang="ts">
	import RadioIndicator from './RadioIndicator.svelte';

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

	const rootClass = $derived(['k-selector', className].filter(Boolean).join(' '));

	function select() {
		if (disabled) return;
		selected = true;
		onSelectedChange?.(true);
	}
</script>

<button
	type="button"
	class={rootClass}
	data-state={selected ? 'selected' : undefined}
	role="radio"
	aria-checked={selected}
	{disabled}
	onclick={select}
>
	<RadioIndicator state={selected ? 'checked' : 'unchecked'} {disabled} />
	<span class="box gap-3xs grow">
		{#if title}<span class="k-selector-title">{title}</span>{/if}
		{#if description}<span class="k-selector-desc">{description}</span>{/if}
		{@render children?.()}
	</span>
</button>

<style lang="sass">
.k-selector
	display: flex
	align-items: center
	gap: 12px
	width: 100%
	padding: 10px 14px
	border: 1px solid var(--border)
	border-radius: var(--radius-sm)
	background: var(--bg-surface)
	color: var(--text-primary)
	cursor: pointer
	text-align: left
	transition: border-color var(--motion-fast) ease, background-color var(--motion-fast) ease
	&:hover
		background: var(--state-hover)
	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px
	&[data-state='selected']
		border-color: var(--theme-color)
		background: color-mix(in srgb, var(--theme-color) 6%, var(--bg-surface))
	&:disabled
		opacity: 0.5
		cursor: not-allowed

.k-selector-title
	font-size: var(--text-md)
	font-weight: 500

.k-selector-desc
	font-size: var(--text-sm)
	color: var(--text-muted)
</style>
