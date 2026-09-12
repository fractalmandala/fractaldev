<script lang="ts">
	import { Button, DropdownMenu } from '#lib/components/index.ts';
	import type { MenuItem } from '#lib/components/index.ts';
	import DemoCard from './DemoCard.svelte';

	let lastAction = $state('—');

	function act(label: string) {
		lastAction = label;
	}

	const basicItems: MenuItem[] = [
		{ label: 'Duplicate', shortcut: '⌘D', onSelect: () => act('Duplicate') },
		{ label: 'Rename', onSelect: () => act('Rename') },
		{ label: 'Move to…', onSelect: () => act('Move to…') }
	];

	const stateItems: MenuItem[] = [
		{ label: 'Publish', onSelect: () => act('Publish') },
		{ label: 'Unpublish', disabled: true, onSelect: () => act('Unpublish') },
		{ label: 'Delete draft', danger: true, onSelect: () => act('Delete draft') }
	];

	const basicCode = `<script>
	import { DropdownMenu } from 'fractalsvelte/components';

	const items = [
		{ label: 'Duplicate', shortcut: '⌘D', onSelect: () => duplicate() },
		{ label: 'Rename', onSelect: () => rename() },
		{ label: 'Move to…', onSelect: () => move() }
	];
<\/script>

<DropdownMenu {items} label="Actions" />`;

	const stateCode = `<script>
	import { DropdownMenu } from 'fractalsvelte/components';

	const items = [
		{ label: 'Publish', onSelect: () => publish() },
		{ label: 'Unpublish', disabled: true },
		{ label: 'Delete draft', danger: true, onSelect: () => remove() }
	];
<\/script>

<DropdownMenu {items} label="Draft" />`;

	const triggerCode = `<script>
	import { Button, DropdownMenu } from 'fractalsvelte/components';
<\/script>

<DropdownMenu {items} align="end">
	{#snippet trigger(tp)}
		<Button variant="ghost" {...tp} aria-label="More actions">⋯</Button>
	{/snippet}
</DropdownMenu>`;
</script>

<div class="stack gap-s">
	<DemoCard title="Basic" description="Arrow keys cycle items, Home/End jump, Escape closes and restores focus to the trigger." code={basicCode}>
		<div class="row gap-s">
			<DropdownMenu items={basicItems} label="Actions" />
			<span class="muted">Last action: {lastAction}</span>
		</div>
	</DemoCard>

	<DemoCard title="Danger and disabled" description="Disabled items are skipped by keyboard navigation; danger items render in the destructive color." code={stateCode}>
		<DropdownMenu items={stateItems} label="Draft" />
	</DemoCard>

	<DemoCard title="Custom trigger" description="The trigger snippet receives the wiring props — aria state, click, Escape — to spread on any element; the end alignment docks the panel to the trigger's right edge." code={triggerCode}>
		<DropdownMenu items={basicItems} align="end">
			{#snippet trigger(tp)}
				<Button variant="ghost" {...tp} aria-label="More actions">⋯</Button>
			{/snippet}
		</DropdownMenu>
	</DemoCard>
</div>
