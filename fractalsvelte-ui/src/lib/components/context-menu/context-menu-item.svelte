<script lang="ts">
	import ContextMenuItemBase from './context-menu-item-base.svelte';
	import type { ContextMenuItemProps } from './context-menu.types.js';

	let { class: className, ...rest }: ContextMenuItemProps = $props();
</script>

<ContextMenuItemBase class={className} {...rest} />
