<script lang="ts">
	import Selector from './Selector.svelte';
	import type { SelectorOption } from './Selector.svelte';

	interface Props<T extends string = string> {
		value?: T;
		onValueChange?: (value: T) => void;
		options: SelectorOption<T>[];
		label?: string;
		class?: string;
	}

	let {
		value = $bindable<string>(''),
		onValueChange,
		options,
		label = 'Choose one',
		class: className = ''
	}: Props = $props();
</script>

<Selector type="single" {value} {onValueChange} {options} {label} class={className} />
