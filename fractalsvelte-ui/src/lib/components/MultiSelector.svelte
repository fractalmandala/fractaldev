<script lang="ts">
	import Selector from './Selector.svelte';
	import type { SelectorOption } from './Selector.svelte';

	interface Props<T extends string = string> {
		values?: T[];
		onValuesChange?: (values: T[]) => void;
		options: SelectorOption<T>[];
		label?: string;
		class?: string;
	}

	let {
		values = $bindable<string[]>([]),
		onValuesChange,
		options,
		label = 'Select options',
		class: className = ''
	}: Props = $props();
</script>

<Selector type="multiple" {values} {onValuesChange} {options} {label} class={className} />
