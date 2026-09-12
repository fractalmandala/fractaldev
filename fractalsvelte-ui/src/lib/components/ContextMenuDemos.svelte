<script lang="ts">
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuContent,
		ContextMenuItem,
		ContextMenuCheckboxItem,
		ContextMenuRadioGroup,
		ContextMenuRadioItem,
		ContextMenuSeparator,
		ContextMenuLabel,
		ContextMenuShortcut
	} from '#lib/components/index.ts';
	import DemoCard from './DemoCard.svelte';

	let lastAction = $state('—');
	let snap = $state(true);
	let grid = $state('md');

	function act(label: string) {
		lastAction = label;
	}

	const basicCode = `<script>
	import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuLabel, ContextMenuShortcut } from 'fractalsvelte/components';
<\/script>

<ContextMenu>
	<ContextMenuTrigger>
		<div class="card">Right-click me</div>
	</ContextMenuTrigger>
	<ContextMenuContent>
		<ContextMenuLabel>Canvas</ContextMenuLabel>
		<ContextMenuItem onSelect={rename}>Rename<ContextMenuShortcut>⌘R</ContextMenuShortcut></ContextMenuItem>
		<ContextMenuSeparator />
		<ContextMenuItem tone="destructive" onSelect={remove}>Delete</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>`;

	const choicesCode = `<script>
	import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem } from 'fractalsvelte/components';

	let snap = $state(true);
	let grid = $state('md');
<\/script>

<ContextMenu>
	<ContextMenuTrigger><div class="card">Settings</div></ContextMenuTrigger>
	<ContextMenuContent>
		<ContextMenuCheckboxItem checked={snap} onCheckedChange={(v) => (snap = v)}>
			Snap to grid
		</ContextMenuCheckboxItem>
		<ContextMenuSeparator />
		<ContextMenuRadioGroup value={grid} onValueChange={(v) => (grid = v)}>
			<ContextMenuRadioItem value="sm">Small</ContextMenuRadioItem>
			<ContextMenuRadioItem value="md">Medium</ContextMenuRadioItem>
		</ContextMenuRadioGroup>
	</ContextMenuContent>
</ContextMenu>`;

	const pointerCode = `<script>
	import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from 'fractalsvelte/components';
<\/script>

<!-- Long-press opens on touch; ContextMenu key / Shift+F10 opens via keyboard.
     The panel morphs outward from the pointer origin and clamps to the viewport. -->
<ContextMenu>
	<ContextMenuTrigger><img src={photo} alt="Photo" /></ContextMenuTrigger>
	<ContextMenuContent>
		<ContextMenuItem onSelect={download}>Download</ContextMenuItem>
		<ContextMenuItem onSelect={share}>Share…</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>`;
</script>

<div class="stack gap-s">
	<DemoCard title="Basic" description="Right-click the surface (or focus it and press ContextMenu / Shift+F10). Arrow keys cycle, typing jumps via typeahead, Escape closes." code={basicCode}>
		<div class="row gap-s">
			<ContextMenu>
				<ContextMenuTrigger>
					<div class="card pad-m" style="min-width: 14rem">Right-click me</div>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuLabel>Canvas</ContextMenuLabel>
					<ContextMenuItem onSelect={() => act('Rename')}>Rename<ContextMenuShortcut>⌘R</ContextMenuShortcut></ContextMenuItem>
					<ContextMenuItem onSelect={() => act('Duplicate')}>Duplicate<ContextMenuShortcut>⌘D</ContextMenuShortcut></ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem tone="destructive" onSelect={() => act('Delete')}>Delete</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
			<span class="muted">Last action: {lastAction}</span>
		</div>
	</DemoCard>

	<DemoCard title="Checkbox and radio items" description="Checkbox items animate their check via the shared spring; radio groups derive checked state from a single value." code={choicesCode}>
		<ContextMenu>
			<ContextMenuTrigger>
				<div class="card pad-m" style="min-width: 14rem">View settings</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuCheckboxItem checked={snap} onCheckedChange={(v) => (snap = v)}>
					Snap to grid
				</ContextMenuCheckboxItem>
				<ContextMenuSeparator />
				<ContextMenuRadioGroup value={grid} onValueChange={(v) => (grid = v)}>
					<ContextMenuRadioItem value="sm">Small grid</ContextMenuRadioItem>
					<ContextMenuRadioItem value="md">Medium grid</ContextMenuRadioItem>
					<ContextMenuRadioItem value="lg">Large grid</ContextMenuRadioItem>
				</ContextMenuRadioGroup>
			</ContextMenuContent>
		</ContextMenu>
	</DemoCard>

	<DemoCard title="Any trigger surface" description="The trigger wraps arbitrary markup — cards, images, rows. Touch users long-press; the panel clamps to the viewport on every open." code={pointerCode}>
		<ContextMenu>
			<ContextMenuTrigger>
				<div class="card pad-m" style="min-width: 14rem">Photo.jpg</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onSelect={() => act('Download')}>Download</ContextMenuItem>
				<ContextMenuItem onSelect={() => act('Share')}>Share…</ContextMenuItem>
				<ContextMenuItem disabled>Get info</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	</DemoCard>
</div>
