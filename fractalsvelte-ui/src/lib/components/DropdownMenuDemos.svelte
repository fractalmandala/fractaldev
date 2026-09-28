<script lang="ts">
	import DemoCard from './DemoCard.svelte';
	import DropdownMenuBasic from './demos/dropdown-menu/DropdownMenuBasic.svelte';
	import dropdownMenuBasicRaw from './demos/dropdown-menu/DropdownMenuBasic.svelte?raw';
	import DropdownMenuState from './demos/dropdown-menu/DropdownMenuState.svelte';
	import dropdownMenuStateRaw from './demos/dropdown-menu/DropdownMenuState.svelte?raw';
	import DropdownMenuTrigger from './demos/dropdown-menu/DropdownMenuTrigger.svelte';
	import dropdownMenuTriggerRaw from './demos/dropdown-menu/DropdownMenuTrigger.svelte?raw';
</script>

<div class="box gap-2xl">
	<DemoCard
		title="Basic"
		description="Arrow keys cycle items, Home/End jump, Escape closes and restores focus to the trigger."
		code={dropdownMenuBasicRaw}
	>
		<DropdownMenuBasic />
	</DemoCard>

	<DemoCard
		title="Danger and disabled"
		description="Disabled items are skipped by keyboard navigation; danger items render in the destructive color."
		code={dropdownMenuStateRaw}
	>
		<DropdownMenuState />
	</DemoCard>

	<DemoCard
		title="Custom trigger"
		description="The trigger snippet receives the wiring props — aria state, click, Escape — to spread on any element; the end alignment docks the panel to the trigger's right edge."
		code={dropdownMenuTriggerRaw}
	>
		<DropdownMenuTrigger />
	</DemoCard>
</div>
