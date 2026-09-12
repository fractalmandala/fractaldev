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

	function toggle() {
		if (disabled) return;
		selected = !selected;
		onSelectedChange?.(selected);
	}
</script>

<button
	type="button"
	class="k-selectable-card {className}"
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
