<script lang="ts">
	import { Button } from '#lib/components/index.ts';
	import DemoCard from './DemoCard.svelte';
	import { Icon } from 'fractalicons';
	import { luSettings, luBell, luArchive, luMail, luArrowRight } from 'fractalicons/lucide';

	let saving = $state(false);

	// Auto-reset the loading demo shortly after triggering it.
	$effect(() => {
		if (!saving) return;
		const timer = setTimeout(() => (saving = false), 1600);
		return () => clearTimeout(timer);
	});

	const intentsCode = `<script>
	import { Button } from 'fractalsvelte/components';
<\/script>

<div class="row wrap gap-2xs">
	<Button variant="primary">Primary</Button>
	<Button variant="secondary">Secondary</Button>
	<Button variant="soft">Soft</Button>
	<Button variant="outline">Outline</Button>
	<Button variant="ghost">Ghost</Button>
	<Button variant="link">Link</Button>
	<Button variant="destructive">Destructive</Button>
</div>`;

	const statesCode = `<script>
	import { Button } from 'fractalsvelte/components';
<\/script>

<div class="row wrap gap-2xs">
	<Button disabled>Disabled</Button>
	<Button variant="outline" disabled>Disabled</Button>
	<Button variant="destructive" disabled>Delete workspace</Button>
	<Button loading>Working</Button>
</div>`;

	const sizesCode = `<script>
	import { Button } from 'fractalsvelte/components';
<\/script>

<div class="row wrap gap-2xs">
	<Button size="sm">Compact</Button>
	<Button size="md">Default</Button>
	<Button size="lg">Prominent</Button>
</div>`;

	const pillCode = `<script>
	import { Button } from 'fractalsvelte/components';
	import { Icon } from 'fractalicons';
	import { luArrowRight } from 'fractalicons/lucide';
<\/script>

<div class="row wrap gap-2xs">
	<Button>Default</Button>
	<Button shape="pill">Pill</Button>
	<Button shape="pill" variant="secondary">
		Next
		<Icon icon={luArrowRight} />
	</Button>
</div>`;

	const iconsCode = `<script>
	import { Button } from 'fractalsvelte/components';
	import { Icon } from 'fractalicons';
	import { luMail, luArrowRight } from 'fractalicons/lucide';
<\/script>

<div class="row wrap gap-2xs">
	<Button variant="secondary">
		<Icon icon={luMail} />
		Email us
	</Button>
	<Button variant="outline">
		Continue
		<Icon icon={luArrowRight} />
	</Button>
</div>`;

	const iconOnlyCode = `<script>
	import { Button } from 'fractalsvelte/components';
	import { Icon } from 'fractalicons';
	import { luSettings, luBell, luArchive } from 'fractalicons/lucide';
<\/script>

<div class="row wrap gap-2xs">
	<Button size="icon-sm" variant="ghost" aria-label="Settings"><Icon icon={luSettings} /></Button>
	<Button size="icon" variant="outline" aria-label="Notifications"><Icon icon={luBell} /></Button>
	<Button size="icon-lg" variant="soft" aria-label="Archive"><Icon icon={luArchive} /></Button>
</div>`;

	const loadingCode = `<script>
	import { Button } from 'fractalsvelte/components';

	let saving = $state(false);

	$effect(() => {
		if (!saving) return;
		const timer = setTimeout(() => (saving = false), 1600);
		return () => clearTimeout(timer);
	});
<\/script>

<div class="row wrap gap-2xs">
	<Button loading={saving} onclick={() => (saving = true)}>Save changes</Button>
	<Button variant="outline" loading>Uploading…</Button>
</div>`;

	const fullWidthCode = `<script>
	import { Button } from 'fractalsvelte/components';
<\/script>

<div class="stack gap-2xs" style="width: 100%">
	<Button>Create workspace</Button>
	<Button variant="outline">Import from backup</Button>
</div>`;

	const anchorCode = `<script>
	import { Button } from 'fractalsvelte/components';
<\/script>

<div class="row wrap gap-2xs">
	<Button href="https://svelte.dev" variant="outline">External link</Button>
	<Button href="/guides" variant="link">Read the guide</Button>
</div>`;
</script>

<div class="stack gap-m">
	<DemoCard
		title="Intents"
		description="Seven visual intents share one geometry. The legacy danger value still works as an alias of destructive."
		code={intentsCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<Button variant="primary">Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="soft">Soft</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
			<Button variant="destructive">Destructive</Button>
		</div>
	</DemoCard>

	<DemoCard
		title="States"
		description="Disabled and loading both block interaction; loading also sets aria-busy and swaps in a spinner."
		code={statesCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<Button disabled>Disabled</Button>
			<Button variant="outline" disabled>Disabled</Button>
			<Button variant="destructive" disabled>Delete workspace</Button>
			<Button loading>Working</Button>
		</div>
	</DemoCard>

	<DemoCard title="Sizes" description="Three text densities share one height scale." code={sizesCode}>
		<div class="row wrap gap-2xs ycenter">
			<Button size="sm">Compact</Button>
			<Button size="md">Default</Button>
			<Button size="lg">Prominent</Button>
		</div>
	</DemoCard>

	<DemoCard
		title="Pill"
		description="The pill shape swaps the corner radius without touching size or intent."
		code={pillCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<Button>Default</Button>
			<Button shape="pill">Pill</Button>
			<Button shape="pill" variant="secondary">
				Next
				<Icon icon={luArrowRight} />
			</Button>
		</div>
	</DemoCard>

	<DemoCard
		title="Icons"
		description="Compose fractalicons' Icon with any intent; the default 1em icon size tracks the button's type scale."
		code={iconsCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<Button variant="secondary">
				<Icon icon={luMail} />
				Email us
			</Button>
			<Button variant="outline">
				Continue
				<Icon icon={luArrowRight} />
			</Button>
		</div>
	</DemoCard>

	<DemoCard
		title="Icon-only"
		description="Square icon sizes require an aria-label — the icon itself is hidden from assistive tech."
		code={iconOnlyCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<Button size="icon-sm" variant="ghost" aria-label="Settings"><Icon icon={luSettings} /></Button>
			<Button size="icon" variant="outline" aria-label="Notifications"><Icon icon={luBell} /></Button>
			<Button size="icon-lg" variant="soft" aria-label="Archive"><Icon icon={luArchive} /></Button>
		</div>
	</DemoCard>

	<DemoCard
		title="Loading"
		description="The first button resets itself after 1.6s; the second shows the static loading state."
		code={loadingCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<Button loading={saving} onclick={() => (saving = true)}>Save changes</Button>
			<Button variant="outline" loading>Uploading…</Button>
		</div>
	</DemoCard>

	<DemoCard
		title="Full-width"
		description="Buttons are inline-flex; stretch them with plain width when a form needs a full-column action."
		code={fullWidthCode}
	>
		<div class="stack gap-2xs" style="width: 100%">
			<Button>Create workspace</Button>
			<Button variant="outline">Import from backup</Button>
		</div>
	</DemoCard>

	<DemoCard
		title="Anchor"
		description="Passing href renders an anchor that keeps every visual state; target and rel flow through rest props."
		code={anchorCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<Button href="https://svelte.dev" variant="outline">External link</Button>
			<Button href="/guides" variant="link">Read the guide</Button>
		</div>
	</DemoCard>
</div>
