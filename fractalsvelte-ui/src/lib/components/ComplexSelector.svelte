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

	function select() {
		if (disabled) return;
		selected = true;
		onSelectedChange?.(true);
	}
</script>

<button
	type="button"
	class="k-selector {className}"
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
