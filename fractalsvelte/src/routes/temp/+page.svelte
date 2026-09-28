<script lang="ts">
	import * as FS from '$lib/index.js';

	// --- data-driven component fixtures ---------------------------------------
	const accordionItems = [
		{ value: 'a', title: 'What is fractalsvelte?' },
		{ value: 'b', title: 'How is it styled?' },
		{ value: 'c', title: 'Can I extend it?', disabled: true }
	];

	const tabItems = [
		{ value: 'one', label: 'First' },
		{ value: 'two', label: 'Second' },
		{ value: 'three', label: 'Third', disabled: true }
	];

	const toastItems = [
		{ id: 't1', variant: 'success' as const, title: 'Saved successfully' },
		{ id: 't2', variant: 'danger' as const, title: 'Connection lost', duration: 0 }
	];

	const treeNodes = [
		{
			value: 'src',
			label: 'src',
			children: [
				{ value: 'lib', label: 'lib', children: [{ value: 'components', label: 'components' }] },
				{ value: 'routes', label: 'routes' }
			]
		},
		{ value: 'static', label: 'static' }
	];

	const dropdownItems = [
		{ id: 'profile', label: 'Account Profile' },
		{ id: 'settings', label: 'Settings' },
		{ id: 'sep', label: '', divider: true },
		{ id: 'signout', label: 'Sign out', danger: true }
	];

	const carouselItems = [
		{ id: 1, caption: 'Slide one' },
		{ id: 2, caption: 'Slide two' },
		{ id: 3, caption: 'Slide three' }
	];

	let dialogOpen = $state(false);
	let drawerOpen = $state(false);
	let selectValue = $state('');

	// --- universal variant axes ------------------------------------------------
	// The token-remap sets from styles/_09_modifiers.sass, applied on <html> so
	// every component on the page follows the axis. Per-instance variation is
	// the shape/density props each component also accepts.
	let pageShape = $state('');
	let pageDensity = $state('');
	let pageScale = $state('');

	function applyAxis(attr: string, value: string) {
		const root = document.documentElement;
		if (value) root.setAttribute(attr, value);
		else root.removeAttribute(attr);
	}

	$effect(() => {
		applyAxis('data-shape', pageShape);
		applyAxis('data-density', pageDensity);
		applyAxis('data-scale', pageScale);
	});
</script>

<svelte:head>
	<title>fractalsvelte — component gallery</title>
</svelte:head>

<div class="box gp-lg pad-lg">
	<header>
		<h1 class="text-3xl bold">fractalsvelte</h1>
		<p class="text-md text-secondary">
			Svelte 5 component library on the fractalthemer styling system — 38 components, every one
			registry classes plus a declared component layer.
		</p>
	</header>

	<!-- ================================================== variant axes -->
	<section class="box gp-lg">
		<h2 class="text-xl bold">Variant axes</h2>
		<p class="text-sm text-secondary">
			Universal token remaps applied to &lt;html&gt; — every component on the page follows. Each component also accepts shape/density props for per-instance variants.
		</p>
		<div class="row gp-md wrap">
			<FS.Select bind:value={pageShape} label="Corner geometry">
				<FS.SelectOption value="" label="Default" />
				<FS.SelectOption value="square" label="Square" />
				<FS.SelectOption value="subtle" label="Subtle" />
				<FS.SelectOption value="modern" label="Modern" />
				<FS.SelectOption value="round" label="Round" />
				<FS.SelectOption value="pill" label="Pill" />
			</FS.Select>
			<FS.Select bind:value={pageDensity} label="Density">
				<FS.SelectOption value="" label="Default" />
				<FS.SelectOption value="tight" label="Tight" />
				<FS.SelectOption value="normal" label="Normal" />
				<FS.SelectOption value="comfort" label="Comfort" />
			</FS.Select>
			<FS.Select bind:value={pageScale} label="Font scale">
				<FS.SelectOption value="" label="Default" />
				<FS.SelectOption value="compact" label="Compact" />
				<FS.SelectOption value="normal" label="Normal" />
				<FS.SelectOption value="expanded" label="Expanded" />
			</FS.Select>
		</div>
	</section>

	<!-- ================================================== actions -->
	<section class="box gp-lg">
		<h2 class="text-xl bold">Actions</h2>

		<div class="row gp-md wrap">
			<FS.Button>Primary</FS.Button>
			<FS.Button variant="soft">Secondary</FS.Button>
			<FS.Button variant="ghost">Ghost</FS.Button>
			<FS.Button variant="danger">Danger</FS.Button>
			<FS.Button size="sm">Small</FS.Button>
			<FS.Button size="lg">Large</FS.Button>
			<FS.Button loading>Saving</FS.Button>
			<FS.Button disabled>Disabled</FS.Button>
		</div>

		<div class="row gp-sm wrap">
			<FS.ButtonGroup>
				<FS.Button variant="soft">Day</FS.Button>
				<FS.Button variant="soft">Week</FS.Button>
				<FS.Button variant="soft">Month</FS.Button>
			</FS.ButtonGroup>
			<FS.CopyButton value="copied from fractalsvelte" />
			<FS.Dropdown items={dropdownItems} onselect={(item) => console.log(item.id)}>
				{#snippet trigger()}
					<FS.Button variant="soft">Dropdown ▾</FS.Button>
				{/snippet}
			</FS.Dropdown>
		</div>
	</section>

	<!-- ================================================== forms -->
	<section class="box gp-lg">
		<h2 class="text-xl bold">Forms</h2>

		<div class="row gp-lg wrap">
			<div class="row gp-md">
				<FS.Input label="Email" placeholder="you@example.com" />
				<FS.Textarea label="Message" rows={3} placeholder="Write something…" />
				<FS.NumberInput label="Quantity" value={1} min={1} max={10} />
				<FS.Select bind:value={selectValue} label="Theme">
					<FS.SelectOption value="light" label="Light" />
					<FS.SelectOption value="dark" label="Dark" />
					<FS.SelectOption value="auto" label="Auto" />
				</FS.Select>
			</div>

			<div class="row gp-md">
				<FS.CheckboxGroup label="Notifications">
					<FS.Checkbox label="Email" checked />
					<FS.Checkbox label="Push" />
					<FS.Checkbox label="SMS" disabled />
				</FS.CheckboxGroup>
				<FS.RadioGroup name="plan" label="Plan">
					<FS.Radio value="free" label="Free" checked />
					<FS.Radio value="pro" label="Pro" />
					<FS.Radio value="team" label="Team" />
				</FS.RadioGroup>
			</div>

			<div class="row gp-md">
				<FS.Switch label="Dark mode" />
				<FS.Switch label="Checked" checked />
				<FS.Slider label="Volume" value={40} showValue />
			</div>
		</div>
	</section>

	<!-- ================================================== surfaces & feedback -->
	<section class="box gp-lg">
		<h2 class="text-xl bold">Surfaces &amp; feedback</h2>

		<div class="row gp-md wrap">
			<FS.Badge>brand</FS.Badge>
			<FS.Badge variant="success">success</FS.Badge>
			<FS.Badge variant="warning" appearance="outlined">warning</FS.Badge>
			<FS.Badge variant="danger" appearance="filled" pill>danger</FS.Badge>
			<FS.Tag withRemove onremove={() => {}}>svelte-5</FS.Tag>
			<FS.Tag variant="brand" pill>fractalthemer</FS.Tag>
		</div>

		<FS.Card appearance="elevated">
			{#snippet header()}
				<span class="bold">Card</span>
			{/snippet}
			<p class="text-sm text-secondary">
				Composable card: header, content, footer are slots — no prop sprawl.
			</p>
			{#snippet footer()}
				<FS.Button size="sm" variant="ghost">Action</FS.Button>
			{/snippet}
		</FS.Card>

		<FS.Callout variant="brand" title="Heads up">
			Callouts carry status through the token channel — try switching modes.
		</FS.Callout>

		<FS.Accordion items={accordionItems}>
			{#snippet children(item)}
				<p class="text-sm">Body of {item.title}.</p>
			{/snippet}
		</FS.Accordion>

		<FS.TabGroup items={tabItems} active="one">
			{#snippet children(item)}
				<p class="text-sm">Panel for {item.label}.</p>
			{/snippet}
		</FS.TabGroup>

		<FS.Details summary="Native disclosure">
			<p class="text-sm">Details/summary with a themed chevron.</p>
		</FS.Details>

		<FS.Toast items={toastItems} />

		<div class="row gp-md">
			<FS.ProgressBar value={65} label="Uploading" />
			<FS.ProgressRing value={65} />
		</div>
	</section>

	<!-- ================================================== overlays -->
	<section class="box gp-lg">
		<h2 class="text-xl bold">Overlays</h2>

		<div class="row gp-md wrap">
			<FS.Button variant="soft" onclick={() => (dialogOpen = true)}>Open dialog</FS.Button>
			<FS.Button variant="soft" onclick={() => (drawerOpen = true)}>Open drawer</FS.Button>
			<FS.Popover>
				{#snippet trigger()}
					<FS.Button variant="soft">Popover</FS.Button>
				{/snippet}
				<div class="pad-sm">Popover body lives in the system shells layer.</div>
			</FS.Popover>
			<FS.Tooltip content="I am a tooltip">
				<FS.Button variant="ghost">Hover me</FS.Button>
			</FS.Tooltip>
		</div>
	</section>

	<!-- ================================================== navigation & data -->
	<section class="box gp-lg">
		<h2 class="text-xl bold">Navigation &amp; data</h2>

		<FS.Breadcrumb>
			<li><a href="/">Home</a></li>
			<li><a href="/library">Library</a></li>
			<li><span aria-current="page">Gallery</span></li>
		</FS.Breadcrumb>

		<FS.Pagination page={4} totalPages={20} showEdges />

		<div class="row gp-md wrap">
			<FS.Avatar initials="AV" status="online" />
			<FS.Avatar label="Amrit" shape="rounded" />
		</div>

		<div class="row gp-lg wrap">
			<FS.Tree items={treeNodes} />
		</div>
	</section>

	<!-- ================================================== complex layout -->
	<section class="box gp-lg">
		<h2 class="text-xl bold">Complex layout</h2>

		<FS.Carousel items={carouselItems} showArrows showDots>
			{#snippet slide({ item })}
				<div class="pad-lg">{item.caption}</div>
			{/snippet}
		</FS.Carousel>

		<FS.SplitPanel>
			{#snippet start()}
				<div class="pad-md">Start pane</div>
			{/snippet}
			{#snippet end()}
				<div class="pad-md">End pane — drag the handle</div>
			{/snippet}
		</FS.SplitPanel>

		<FS.Scroller fade maxHeight="12rem">
			<div class="pad-md">
				{#each Array(12) as _, i}
					<p class="text-sm">Scrollable row {i + 1}</p>
				{/each}
			</div>
		</FS.Scroller>

		<FS.Comparison beforeLabel="Before" afterLabel="After">
			{#snippet before()}
				<div class="pad-lg">Before</div>
			{/snippet}
			<div class="pad-lg">After — drag to compare</div>
		</FS.Comparison>
	</section>

	<!-- ================================================== utilities -->
	<section class="box gp-lg">
		<h2 class="text-xl bold">Utilities</h2>
		<div class="row gp-md wrap ycenter">
			<FS.Avatar initials="FS" />
			<FS.Divider orientation="vertical" />
			<span class="text-sm text-secondary">fractalsvelte</span>
			<FS.Divider>or</FS.Divider>
			<FS.Button size="sm" variant="ghost">Continue</FS.Button>
		</div>
	</section>
</div>

<FS.Dialog bind:open={dialogOpen} title="Example dialog" size="sm">
	<p class="text-sm">Dialog body — Escape closes, overlay click closes.</p>
	{#snippet footer()}
		<FS.Button variant="ghost" onclick={() => (dialogOpen = false)}>Close</FS.Button>
		<FS.Button onclick={() => (dialogOpen = false)}>Confirm</FS.Button>
	{/snippet}
</FS.Dialog>

<FS.Drawer bind:open={drawerOpen} title="Example drawer" placement="right">
	<p class="text-sm">Drawer body slides in from the right.</p>
</FS.Drawer>
