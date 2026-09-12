<script lang="ts">
	import { Accordion as WaAccordion, AccordionItem as WaAccordionItem } from '$lib/components/wa/accordion';
	import { Avatar } from '$lib/components/wa/avatar';
	import { Badge } from '$lib/components/wa/badge';
	import { Breadcrumb, BreadcrumbItem } from '$lib/components/wa/breadcrumb';
	import { ButtonGroup } from '$lib/components/wa/button-group';
	import { Button } from '$lib/components/wa/button';
	import { Callout } from '$lib/components/wa/callout';
	import { Card } from '$lib/components/wa/card';
	import { Carousel } from '$lib/components/wa/carousel';
	import { CarouselItem } from '$lib/components/wa/carousel-item';
	import { CheckboxGroup } from '$lib/components/wa/checkbox-group';
	import { Checkbox } from '$lib/components/wa/checkbox';
	import { ColorPicker as WaColorPicker } from '$lib/components/wa/color-picker';
	import { Comparison } from '$lib/components/wa/comparison';
	import { CopyButton } from '$lib/components/wa/copy-button';
	import { Details } from '$lib/components/wa/details';
	import { Dialog } from '$lib/components/wa/dialog';
	import { Divider } from '$lib/components/wa/divider';
	import { Drawer } from '$lib/components/wa/drawer';
	import { Dropdown } from '$lib/components/wa/dropdown';
	import { DropdownItem } from '$lib/components/wa/dropdown-item';
	import { FormatDate } from '$lib/components/wa/format-date';
	import { FormatNumber } from '$lib/components/wa/format-number';
	import { Icon } from '$lib/components/wa/icon';
	import { Include } from '$lib/components/wa/include';
	import { Input } from '$lib/components/wa/input';
	import { KnownDate } from '$lib/components/wa/known-date';
	import { Markdown } from '$lib/components/wa/markdown';
	import { NumberInput } from '$lib/components/wa/number-input';
	import { Option } from '$lib/components/wa/option';
	import { Page } from '$lib/components/wa/page';
	import { Pagination } from '$lib/components/wa/pagination';
	import { Popover } from '$lib/components/wa/popover';
	import { Popup } from '$lib/components/wa/popup';
	import { ProgressBar } from '$lib/components/wa/progress-bar';
	import { ProgressRing } from '$lib/components/wa/progress-ring';
	import { RadioGroup } from '$lib/components/wa/radio-group';
	import { Radio } from '$lib/components/wa/radio';
	import { RandomContent } from '$lib/components/wa/random-content';
	import { RelativeTime } from '$lib/components/wa/relative-time';
	import { Scroller } from '$lib/components/wa/scroller';
	import { Select } from '$lib/components/wa/select';
	import { Slider } from '$lib/components/wa/slider';
	import { SplitPanel } from '$lib/components/wa/split-panel';
	import { Switch } from '$lib/components/wa/switch';
	import { TabGroup } from '$lib/components/wa/tab-group';
	import { TabPanel } from '$lib/components/wa/tab-panel';
	import { Tab } from '$lib/components/wa/tab';
	import { Tag } from '$lib/components/wa/tag';
	import { Textarea } from '$lib/components/wa/textarea';
	import { TimeInput } from '$lib/components/wa/time-input';
	import { ToastItem } from '$lib/components/wa/toast-item';
	import { Toast } from '$lib/components/wa/toast';
	import { Tooltip } from '$lib/components/wa/tooltip';
	import { TreeItem } from '$lib/components/wa/tree-item';
	import { Tree } from '$lib/components/wa/tree';

	let dialogOpen = $state(false);
	let drawerOpen = $state(false);
	let dropPick = $state('none yet');
	let remember = $state(true);
	let wifi = $state(true);
	let radioVal = $state('a');
	let selectVal = $state('1');
	let sliderVal = $state(65);
	let page = $state(3);
	let paint = $state('#4a90e2');
	let who = $state('');
	let bio = $state('');
	let qty = $state('2');
	let starts = $state('09:30');
	let born = $state('1990-05-14');
	let splitAt = $state(35);
	let compareAt = $state(50);
	let moreOpen = $state(false);
	let toastOn = $state(false);
	let tabActive = $state('general');
	let popupOn = $state(false);

	const mdSample = '## Hello\n\n- one\n- two\n\n**bold** and _italic_';
	const starSrc =
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z'/%3E%3C/svg%3E";
</script>

<div class="box gap-md">
	<div class="box gap-2xs">
		<span class="eyebrow">Gallery · wa</span>
		<h3 class="text-xl weight-700 text-primary">WA components — every one live</h3>
		<p class="text-sm text-secondary">State below is bound — flip switches, drag sliders, open dialogs. Nothing is a screenshot.</p>
	</div>

	<div class="grid-2 gap-md">
		<div class="card box gap-sm min0">
			<span class="field-label">Button + ButtonGroup</span>
			<div class="row gap-bs wrap ycenter">
				<Button variant="brand">Save</Button>
				<Button variant="neutral" appearance="outlined">Cancel</Button>
				<Button variant="success" pill>Go</Button>
				<Button loading>Retry</Button>
			</div>
			<ButtonGroup label="More actions">
				<Button>One</Button>
				<Button variant="brand">Two</Button>
				<Button withCaret>Three</Button>
			</ButtonGroup>
			<span class="text-xs mono text-muted">wa/button · wa/button-group</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Badge · Tag · CopyButton</span>
			<div class="row gap-bs wrap ycenter">
				<Badge variant="success" appearance="filled" pill>New</Badge>
				<Badge variant="danger" attention="pulse">Live</Badge>
				<Tag variant="success" pill>Active</Tag>
				<Tag variant="warning" withRemove>Filter</Tag>
			</div>
			<div class="row gap-bs ycenter">
				<CopyButton value="npm i fractalstyler" />
				<span class="text-xs text-muted">copies a real string</span>
			</div>
			<span class="text-xs mono text-muted">wa/badge · wa/tag · wa/copy-button</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Avatar · Callout · Card</span>
			<div class="row gap-bs ycenter">
				<Avatar initials="AB" label="Ada B" />
				<Avatar initials="CD" label="Cee Dee" shape="rounded" />
			</div>
			<Callout variant="warning">Check your quota before deploying.</Callout>
			<Card>
				{#snippet header()}<span class="text-sm weight-600">Card title</span>{/snippet}
				<span class="text-sm text-secondary">Body with header and footer slots.</span>
				{#snippet footer()}<Button size="s">Go</Button>{/snippet}
			</Card>
			<span class="text-xs mono text-muted">wa/avatar · wa/callout · wa/card</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Breadcrumb · Divider</span>
			<Breadcrumb label="Trail">
				<BreadcrumbItem href="/playground">Playground</BreadcrumbItem>
				<BreadcrumbItem href="">Gallery</BreadcrumbItem>
			</Breadcrumb>
			<p class="text-sm text-secondary">Above the rule.</p>
			<Divider />
			<p class="text-sm text-secondary">Below the rule.</p>
			<span class="text-xs mono text-muted">wa/breadcrumb · wa/divider</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Accordion (wa)</span>
			<WaAccordion mode="single-collapsible">
				<WaAccordionItem text="First" expanded>Content one.</WaAccordionItem>
				<WaAccordionItem text="Second">Content two.</WaAccordionItem>
			</WaAccordion>
			<span class="text-xs mono text-muted">wa/accordion</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Details — open: {moreOpen ? 'yes' : 'no'}</span>
			<Details summary="More info" bind:open={moreOpen}>Hidden details content here.</Details>
			<Details summary="Grouped A" name="pg-g">One</Details>
			<Details summary="Grouped B" name="pg-g">Two — same name, one open at a time.</Details>
			<span class="text-xs mono text-muted">wa/details</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Dialog + Drawer — real modals</span>
			<div class="row gap-bs wrap">
				<Button onclick={() => (dialogOpen = true)}>Open dialog</Button>
				<Button onclick={() => (drawerOpen = true)} appearance="outlined">Open drawer</Button>
			</div>
			<Dialog bind:open={dialogOpen} label="Confirm" lightDismiss>
				Delete this item?
				{#snippet footer()}<Button onclick={() => (dialogOpen = false)}>OK</Button>{/snippet}
			</Dialog>
			<Drawer bind:open={drawerOpen} label="Settings" placement="end" lightDismiss>
				<p class="text-sm text-secondary">Drawer body.</p>
				{#snippet footer()}<Button onclick={() => (drawerOpen = false)}>Close</Button>{/snippet}
			</Drawer>
			<span class="text-xs mono text-muted">wa/dialog · wa/drawer</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Dropdown — picked: {dropPick}</span>
			<Dropdown>
				{#snippet trigger()}<Button>Actions</Button>{/snippet}
				<DropdownItem value="copy" onclick={() => (dropPick = 'copy')}>Copy</DropdownItem>
				<DropdownItem value="pin" type="checkbox">Pin</DropdownItem>
				<DropdownItem value="del" variant="danger" onclick={() => (dropPick = 'delete')}>Delete</DropdownItem>
			</Dropdown>
			<span class="text-xs mono text-muted">wa/dropdown · wa/dropdown-item</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Popover + Popup + Tooltip</span>
			<div class="row gap-bs wrap ycenter">
				<button id="pg-pop-btn" type="button" class="button small">Popover</button>
				<Popover for="pg-pop-btn" placement="top">
					<p class="text-sm">Popover body.</p>
					<button type="button" data-popover="close" class="button small ghost">Close</button>
				</Popover>
				<button id="pg-tip-btn" type="button" class="button small ghost">Hover me</button>
				<Tooltip for="pg-tip-btn" content="Helpful hint" placement="top" />
				<Button size="s" onclick={() => (popupOn = !popupOn)}>Popup: {popupOn ? 'on' : 'off'}</Button>
			</div>
			<Popup active={popupOn} placement="bottom" arrow>
				{#snippet anchorSnippet()}<span class="text-xs text-muted">anchored panel ↓</span>{/snippet}
				<div class="pad-sm text-sm">Popup panel content.</div>
			</Popup>
			<span class="text-xs mono text-muted">wa/popover · wa/tooltip · wa/popup</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Toast — real stack, real placement</span>
			{#if toastOn}
				<Toast placement="bottom-end">
					<ToastItem
						variant="success"
						duration={5000}
						onclose={() => (toastOn = false)}
					>
						Saved — auto-dismisses in 5s, or close it.
					</ToastItem>
				</Toast>
			{/if}
			<div class="row gap-bs wrap">
				<Button size="s" onclick={() => (toastOn = true)}>Show toast</Button>
				<Button size="s" appearance="outlined" onclick={() => (toastOn = false)}>Dismiss</Button>
			</div>
			<span class="text-xs text-muted">The stack is fixed bottom-end — visible when summoned, not permanently pinned over the page.</span>
			<span class="text-xs mono text-muted">wa/toast · wa/toast-item</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Checkbox + Switch — {remember ? 'remembering' : 'not remembering'} · wifi {wifi ? 'on' : 'off'}</span>
			<Checkbox label="Remember me" bind:checked={remember} />
			<Checkbox label="Select all" indeterminate />
			<CheckboxGroup label="Toppings" orientation="horizontal">
				<Checkbox label="Cheese" checked />
				<Checkbox label="Bacon" />
			</CheckboxGroup>
			<Switch label="Wi-Fi" bind:checked={wifi} />
			<span class="text-xs mono text-muted">wa/checkbox · wa/checkbox-group · wa/switch</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Radio + Select — {radioVal} · {selectVal}</span>
			<RadioGroup bind:value={radioVal} label="Pick one" orientation="horizontal">
				<Radio value="a">Option A</Radio>
				<Radio value="b">Option B</Radio>
			</RadioGroup>
			<Select placeholder="Pick one" bind:value={selectVal}>
				<Option value="1">One</Option>
				<Option value="2">Two</Option>
				<Option value="3" disabled>Three (disabled)</Option>
			</Select>
			<span class="text-xs mono text-muted">wa/radio-group · wa/radio · wa/select · wa/option</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Inputs — bound below</span>
			<Input label="Name" placeholder="Ada Lovelace" bind:value={who} withClear />
			<Textarea label="Bio" placeholder="Tell us…" rows={3} maxlength={140} withCount bind:value={bio} />
			<NumberInput label="Quantity" bind:value={qty} min={1} max={10} step={1} />
			<TimeInput label="Start" bind:value={starts} hourFormat="12" clearable withNow />
			<KnownDate label="Birthday" bind:value={born} />
			<span class="text-xs text-muted">name="{who}" · qty={qty} · start={starts} · born={born} · bio {bio.length}/140</span>
			<span class="text-xs mono text-muted">wa/input · wa/textarea · wa/number-input · wa/time-input · wa/known-date</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Slider drives bar + ring — {sliderVal}</span>
			<Slider min={0} max={100} bind:value={sliderVal} label="Volume" withTooltip />
			<ProgressBar value={sliderVal}>{sliderVal}%</ProgressBar>
			<div class="row gap-bs ycenter">
				<ProgressRing value={sliderVal} size="64px">{sliderVal}%</ProgressRing>
				<ProgressBar indeterminate label="Loading…" />
			</div>
			<span class="text-xs mono text-muted">wa/slider · wa/progress-bar · wa/progress-ring</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Color picker (wa) — {paint}</span>
			<WaColorPicker label="Accent" bind:value={paint} format="hex" />
			<WaColorPicker inline swatches={['#ff3b1f', '#2F9E44', '#3B82F6']} />
			<span class="text-xs mono text-muted">wa/color-picker</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Tabs — active: {tabActive}</span>
			<TabGroup bind:active={tabActive}>
				{#snippet nav()}<Tab panel="general">General</Tab><Tab panel="adv">Advanced</Tab>{/snippet}
				<TabPanel name="general"><p class="text-sm text-secondary">General content.</p></TabPanel>
				<TabPanel name="adv"><p class="text-sm text-secondary">Advanced content.</p></TabPanel>
			</TabGroup>
			<span class="text-xs mono text-muted">wa/tab-group · wa/tab · wa/tab-panel</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Tree — single select</span>
			<Tree selection="single">
				<TreeItem value="docs" expanded>
					{#snippet label()}Docs{/snippet}
					<TreeItem value="guide">
						{#snippet label()}Guide{/snippet}
					</TreeItem>
					<TreeItem value="api">
						{#snippet label()}API{/snippet}
					</TreeItem>
				</TreeItem>
				<TreeItem value="blog">
					{#snippet label()}Blog{/snippet}
				</TreeItem>
			</Tree>
			<span class="text-xs mono text-muted">wa/tree · wa/tree-item</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Carousel + Pagination — page {page}</span>
			<Carousel navigation pagination loop>
				<CarouselItem><div class="pad-xl surface text-sm ta-c">Slide 1</div></CarouselItem>
				<CarouselItem><div class="pad-xl raised text-sm ta-c">Slide 2</div></CarouselItem>
				<CarouselItem><div class="pad-xl panel text-sm ta-c">Slide 3</div></CarouselItem>
			</Carousel>
			<Pagination total={237} pageSize={10} bind:page withSummary />
			<span class="text-xs mono text-muted">wa/carousel · wa/carousel-item · wa/pagination</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Comparison + Scroller + SplitPanel</span>
			<Comparison bind:position={compareAt}>
				{#snippet before()}<div class="pad-lg surface text-sm ta-c">Before</div>{/snippet}
				{#snippet after()}<div class="pad-lg terminal text-sm ta-c">After</div>{/snippet}
			</Comparison>
			<Scroller orientation="horizontal">
				<div style="display: flex; gap: 8px; width: max-content;">
					<span class="badge">one</span><span class="badge">two</span><span class="badge">three</span><span class="badge">four</span><span class="badge">five</span><span class="badge">six</span>
				</div>
			</Scroller>
			<div style="height: 180px;">
				<SplitPanel bind:position={splitAt}>
					{#snippet start()}<div class="pad-md surface text-sm">Left {Math.round(splitAt)}%</div>{/snippet}
					{#snippet end()}<div class="pad-md raised text-sm">Right</div>{/snippet}
				</SplitPanel>
			</div>
			<span class="text-xs mono text-muted">wa/comparison · wa/scroller · wa/split-panel</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Formats + Markdown + Times</span>
			<p class="text-sm text-secondary"><FormatDate date="2026-09-11" year="numeric" month="long" day="numeric" /></p>
			<p class="text-sm text-secondary"><FormatNumber value={49.99} type="currency" currency="USD" /> · <FormatNumber value={0.42} type="percent" /></p>
			<p class="text-sm text-secondary">An hour ago: <RelativeTime date={new Date(Date.now() - 3600e3)} format="long" sync /></p>
			<Markdown content={mdSample} />
			<span class="text-xs mono text-muted">wa/format-date · wa/format-number · wa/relative-time · wa/markdown</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Icon · Include · RandomContent</span>
			<div class="row gap-bs ycenter">
				<Icon src={starSrc} label="Star" />
				<Icon src={starSrc} label="Star rotated" rotate={45} />
				<span class="text-xs text-muted">data-URI source, no library needed</span>
			</div>
			<template id="pg-hello"><p class="text-sm text-secondary">Hello from an in-page template.</p></template>
			<Include src="#pg-hello" />
			<RandomContent items={1} mode="unique" animation="fade">
				<div class="text-sm">Quote one.</div>
				<div class="text-sm">Quote two.</div>
				<div class="text-sm">Quote three.</div>
			</RandomContent>
			<span class="text-xs mono text-muted">wa/icon · wa/include · wa/random-content</span>
		</div>

		<div class="card box gap-sm min0">
			<span class="field-label">Page shell (wa) — compact, height-capped</span>
			<!-- Bare `page` on this wrapper would inherit .wa-page min-height:100%
			     from the cascade — viewport-tall inside the card. Cap the demo and
			     keep the real shell's class name intact. -->
			<div class="border radius-md" style="height: 420px; overflow: auto;">
				<div class="page wa-page-demo">
					<Page>
						{#snippet header()}<span class="text-sm weight-600">WA Page header</span>{/snippet}
						{#snippet navigation()}<span class="text-xs text-muted">menu</span>{/snippet}
						{#snippet aside()}<span class="text-xs text-muted">aside</span>{/snippet}
						<p class="text-sm text-secondary">Main content with menu and aside rails.</p>
					</Page>
				</div>
			</div>
			<span class="text-xs mono text-muted">wa/page</span>
		</div>
	</div>
</div>
