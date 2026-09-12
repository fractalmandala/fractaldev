<script lang="ts">
	import ColorPicker from '$lib/components/presets/ColorPicker.svelte';
	import LayoutPicker from '$lib/components/presets/LayoutPicker.svelte';
	import ModeToggle from '$lib/components/presets/ModeToggle.svelte';
	import MotionPicker from '$lib/components/presets/MotionPicker.svelte';
	import ShapePicker from '$lib/components/presets/ShapePicker.svelte';
	import ShellTypePicker from '$lib/components/presets/ShellTypePicker.svelte';
	import { presets } from '$lib/presets/presets.svelte';
	import UiAppshell from '$lib/components/ui/Appshell.svelte';
	import ShellAppshell from '$lib/components/shell/Appshell.svelte';
	import AppmainRails from '$lib/components/shell/AppmainRails.svelte';
	import AppRailsDocs from '$lib/components/shell/AppRailsDocs.svelte';
	import ArticleHeader from '$lib/components/shell/ArticleHeader.svelte';
	import MainSection from '$lib/components/shell/MainSection.svelte';
	import UiAccordion from '$lib/components/ui/Accordion.svelte';
	import AccordionSeries from '$lib/components/ui/AccordionSeries.svelte';
	import CtxAccordion from '$lib/components/ui/accordion/Accordion.svelte';
	import CtxAccordionItem from '$lib/components/ui/accordion/AccordionItem.svelte';
	import CodeBlock from '$lib/components/ui/CodeBlock.svelte';
	import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';
	import Frame from '$lib/components/ui/Frame.svelte';
	import SidebarLeft from '$lib/components/ui/SidebarLeft.svelte';

	let menuPick = $state('nothing yet');
	let seriesOpen = $state(['b']);
</script>

<div class="box gap-md">
	<div class="box gap-2xs">
		<span class="eyebrow">Gallery · presets</span>
		<h3 class="text-xl weight-700 text-primary">Preset pickers — live on this page</h3>
		<p class="text-sm text-secondary">
			The real components, functioning as installed: they write <span class="mono">data-*</span> to
			<span class="mono">&lt;html&gt;</span> globally. The canvas above stays scoped, so this is also a
			demo of scoped-vs-global. Live state:
			<span class="mono">layout={presets.layout} · shape={presets.shape} · color={presets.color} · motion={presets.motion} · mode={presets.mode} · shell={presets.shell}</span>
		</p>
	</div>
	<div class="card box gap-sm">
		<div class="row gap-md wrap ycenter">
			<div class="field">
				<span class="field-label">Layout · shape · color · shell</span>
				<div class="row gap-bs wrap ycenter">
					<LayoutPicker />
					<ShapePicker />
					<ColorPicker />
					<ShellTypePicker />
				</div>
			</div>
			<div class="field">
				<span class="field-label">Motion · mode</span>
				<div class="row gap-bs ycenter">
					<MotionPicker />
					<ModeToggle />
				</div>
			</div>
		</div>
		<span class="text-xs text-muted">Shell picker drives the whole docs chrome and the miniature shell below — that is what it does when installed.</span>
	</div>

	<div class="box gap-2xs">
		<span class="eyebrow">Gallery · shells</span>
		<h3 class="text-xl weight-700 text-primary">Shells — canonical markup, live</h3>
	</div>
	<div class="grid-2 gap-md">
		<div class="card box gap-sm min0">
			<span class="field-label">ui/Appshell — follows the shell picker above</span>
			<div class="border radius-md">
				<UiAppshell>
					{#snippet appHeader()}<span class="text-sm weight-600">Mini header</span>{/snippet}
					{#snippet sidebarLeft()}<span class="text-xs text-muted">nav rail</span>{/snippet}
					{#snippet sidebarRight()}<span class="text-xs text-muted">toc rail</span>{/snippet}
					{#snippet appFooter()}<span class="text-xs text-muted">mini footer</span>{/snippet}
					<p class="text-sm text-secondary">Content. Pick Shell → l, f or c above and watch rails and footer come and go.</p>
				</UiAppshell>
			</div>
			<span class="text-xs mono text-muted">ui/Appshell</span>
		</div>
		<div class="card box gap-sm min0">
			<span class="field-label">shell/Appshell — static frame</span>
			<div class="border radius-md">
				<ShellAppshell>
					{#snippet appHeader()}<span class="text-sm weight-600">Static header</span>{/snippet}
					{#snippet appFooter()}<span class="text-xs text-muted">static footer</span>{/snippet}
					<p class="text-sm text-secondary">Header → main → footer, no rails.</p>
				</ShellAppshell>
			</div>
			<span class="text-xs mono text-muted">shell/Appshell</span>
		</div>
		<div class="card box gap-sm min0">
			<span class="field-label">shell/AppmainRails — both rails</span>
			<div class="border radius-md">
				<AppmainRails>
					{#snippet sidebarLeft()}<span class="text-xs text-muted">left nav</span>{/snippet}
					{#snippet sidebarRight()}<span class="text-xs text-muted">right toc</span>{/snippet}
					<p class="text-sm text-secondary">Main section between two rails.</p>
				</AppmainRails>
			</div>
			<span class="text-xs mono text-muted">shell/AppmainRails</span>
		</div>
		<div class="card box gap-sm min0">
			<span class="field-label">shell/AppRailsDocs — docs rails</span>
			<div class="border radius-md">
				<AppRailsDocs>
					{#snippet sidebarLeft()}<span class="text-xs text-muted">docs nav</span>{/snippet}
					{#snippet sidebarRight()}<span class="text-xs text-muted">page toc</span>{/snippet}
					<p class="text-sm text-secondary">Docs variant of the railed main.</p>
				</AppRailsDocs>
			</div>
			<span class="text-xs mono text-muted">shell/AppRailsDocs</span>
		</div>
		<div class="card box gap-sm min0">
			<span class="field-label">shell/ArticleHeader + MainSection</span>
			<ArticleHeader title="Article title" description="Standalone header with lede and optional children." />
			<MainSection mainType={true}>
				<p class="text-sm text-secondary">MainSection with mainType — constrained reading column.</p>
			</MainSection>
			<span class="text-xs mono text-muted">shell/ArticleHeader · shell/MainSection</span>
		</div>
		<div class="card box gap-sm min0">
			<span class="field-label">ui/SidebarLeft — nav stack</span>
			<SidebarLeft>
				<span class="text-sm weight-600">Section</span>
				<a class="link" href="/playground">Playground</a>
				<a class="link" href="/docs">Docs</a>
			</SidebarLeft>
			<span class="text-xs mono text-muted">ui/SidebarLeft</span>
		</div>
	</div>

	<div class="box gap-2xs">
		<span class="eyebrow">Gallery · ui</span>
		<h3 class="text-xl weight-700 text-primary">UI primitives — live</h3>
	</div>
	<div class="grid-2 gap-md">
		<div class="card box gap-sm min0">
			<span class="field-label">ui/Accordion — single item + slide</span>
			{#snippet accPanel()}
				<p class="text-sm text-secondary">Panel body with a slide transition and a rotating chevron.</p>
			{/snippet}
			<UiAccordion label="First item" triggerClass="accordion-trigger" panel={accPanel} />
			<span class="text-xs mono text-muted">ui/Accordion</span>
		</div>
		<div class="card box gap-sm min0">
			<span class="field-label">ui/AccordionSeries — single-open from [b]</span>
			<AccordionSeries
				items={[
					{ id: 'a', label: 'Alpha' },
					{ id: 'b', label: 'Beta' },
					{ id: 'c', label: 'Gamma' }
				]}
				bind:open={seriesOpen}
				single
			>
				{#snippet panel(id)}
					<p class="text-sm text-secondary">Panel {id} body. Open now: {seriesOpen.join(', ') || 'none'}.</p>
				{/snippet}
			</AccordionSeries>
			<span class="text-xs mono text-muted">ui/AccordionSeries</span>
		</div>
		<div class="card box gap-sm min0">
			<span class="field-label">ui/accordion — context group, collapsible</span>
			<CtxAccordion mode="single-collapsible">
				<CtxAccordionItem text="First" expanded>
					<p class="text-sm text-secondary">Context-grouped item one.</p>
				</CtxAccordionItem>
				<CtxAccordionItem text="Second">
					<p class="text-sm text-secondary">Context-grouped item two.</p>
				</CtxAccordionItem>
				<CtxAccordionItem text="Disabled" disabled>
					<p class="text-sm text-secondary">You cannot open this one.</p>
				</CtxAccordionItem>
			</CtxAccordion>
			<span class="text-xs mono text-muted">ui/accordion/Accordion + AccordionItem</span>
		</div>
		<div class="card box gap-sm min0">
			<span class="field-label">ui/DropdownMenu — picked: {menuPick}</span>
			<DropdownMenu
				label="Actions"
				items={[
					{ label: 'Edit', onSelect: () => (menuPick = 'Edit') },
					{ label: 'Duplicate', onSelect: () => (menuPick = 'Duplicate') },
					{ label: 'Delete', danger: true, onSelect: () => (menuPick = 'Delete') }
				]}
			/>
			<span class="text-xs mono text-muted">ui/DropdownMenu</span>
		</div>
		<div class="card box gap-sm min0">
			<span class="field-label">ui/CodeBlock — copy works</span>
			<CodeBlock code={'<div class="box gap-md pad-lg">hello</div>'} title="example.svelte" />
			<span class="text-xs mono text-muted">ui/CodeBlock</span>
		</div>
		<div class="card box gap-sm min0">
			<span class="field-label">ui/Frame — captioned frame</span>
			<Frame title="demo" frameClass="pad-lg">
				<p class="text-sm text-secondary">Framed content with an inset top-edge label.</p>
			</Frame>
			<span class="text-xs mono text-muted">ui/Frame</span>
		</div>
	</div>
</div>
