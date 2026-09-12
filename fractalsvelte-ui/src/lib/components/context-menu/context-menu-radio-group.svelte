<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContextMenuRadioGroupContext } from './context-menu-context.js';

	let {
		children,
		value,
		onValueChange,
		class: className
	}: {
		children: Snippet;
		value: string;
		onValueChange?: (value: string) => void;
		class?: string;
	} = $props();

	setContextMenuRadioGroupContext({
		get value() {
			return value;
		},
		get onValueChange() {
			return onValueChange;
		}
	});
</script>

<div data-slot="context-menu-radio-group" class={className}>
	{@render children()}
</div>
