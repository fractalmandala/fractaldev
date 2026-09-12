<script lang="ts">
	export interface SegmentOption<T extends string = string> {
		value: T;
		label: string;
		leading?: import('svelte').Snippet;
	}

	interface Props<T extends string = string> {
		value?: T;
		onValueChange?: (value: T) => void;
		options: SegmentOption<T>[];
		/** Accessible name for the group. */
		label?: string;
		class?: string;
	}

	let {
		value = $bindable<string>(''),
		onValueChange,
		options,
		label = 'Segmented control',
		class: className = ''
	}: Props = $props();

	function select(v: string) {
		value = v;
		onValueChange?.(v);
	}
</script>

<div class="k-segmented {className}" role="group" aria-label={label}>
	{#each options as option (option.value)}
		<button
			type="button"
			class="k-segmented-item"
			data-state={value === option.value ? 'selected' : undefined}
			aria-pressed={value === option.value}
			onclick={() => select(option.value)}
		>
			{#if option.leading}{@render option.leading?.()}{/if}
			{option.label}
		</button>
	{/each}
</div>
