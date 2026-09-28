<script lang="ts">
	import DemoCard from './DemoCard.svelte';
	import ContextMenuBasic from './demos/context-menu/ContextMenuBasic.svelte';
	import contextMenuBasicRaw from './demos/context-menu/ContextMenuBasic.svelte?raw';
	import ContextMenuChoices from './demos/context-menu/ContextMenuChoices.svelte';
	import contextMenuChoicesRaw from './demos/context-menu/ContextMenuChoices.svelte?raw';
	import ContextMenuTriggerSurface from './demos/context-menu/ContextMenuTriggerSurface.svelte';
	import contextMenuTriggerSurfaceRaw from './demos/context-menu/ContextMenuTriggerSurface.svelte?raw';
</script>

<div class="box gap-2xl">
	<DemoCard
		title="Basic"
		description="Right-click the surface (or focus it and press ContextMenu / Shift+F10). Arrow keys cycle, typing jumps via typeahead, Escape closes."
		code={contextMenuBasicRaw}
	>
		<ContextMenuBasic />
	</DemoCard>

	<DemoCard
		title="Checkbox and radio items"
		description="Checkbox items animate their check via the shared spring; radio groups derive checked state from a single value."
		code={contextMenuChoicesRaw}
	>
		<ContextMenuChoices />
	</DemoCard>

	<DemoCard
		title="Any trigger surface"
		description="The trigger wraps arbitrary markup — cards, images, rows. Touch users long-press; the panel clamps to the viewport on every open."
		code={contextMenuTriggerSurfaceRaw}
	>
		<ContextMenuTriggerSurface />
	</DemoCard>
</div>
