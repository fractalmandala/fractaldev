<script lang="ts">
	import { getContextMenuRadioGroupContext } from './context-menu-context.js';
	import ContextMenuItemBase from './context-menu-item-base.svelte';
	import type { ContextMenuRadioItemProps } from './context-menu.types.js';

	// Radio selection keeps the menu open unless the consumer opts into closing.
	let { children, value, closeOnSelect = false, ...rest }: ContextMenuRadioItemProps = $props();

	const group = getContextMenuRadioGroupContext('ContextMenuRadioItem');
	const checked = $derived(group.value === value);
</script>

<ContextMenuItemBase
	{...rest}
	role="menuitemradio"
	ariaChecked={checked}
	{closeOnSelect}
	onSelect={() => group.onValueChange?.(value)}
>
	<span data-slot="context-menu-icon">
		<span data-slot="context-menu-radio-dot" data-checked={checked ? 'true' : undefined}></span>
	</span>
	{@render children()}
</ContextMenuItemBase>

<style lang="sass">
[data-slot="context-menu-icon"]
	display: flex
	width: 1rem
	height: 1rem
	flex-shrink: 0
	align-items: center
	justify-content: center

[data-slot="context-menu-radio-dot"]
	width: 0.375rem
	height: 0.375rem
	border-radius: var(--radius-full)
	background: currentColor
	opacity: 0
	transition: opacity 0.15s ease

	&[data-checked="true"]
		opacity: 1
</style>
