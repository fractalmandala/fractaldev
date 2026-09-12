<script lang="ts">
	import { PortedButton } from '#lib/ported/index.ts';
	import type { PortedButtonSize, PortedButtonVariant } from '#lib/ported/index.ts';
	import DemoCard from '#lib/components/DemoCard.svelte';
	import { Icon } from 'fractalicons';
	import { luMail, luArrowRight, luSettings, luBell, luArchive } from 'fractalicons/lucide';

	let variant = $state<PortedButtonVariant>('default');
	let size = $state<PortedButtonSize>('default');
	let disabled = $state(false);
	let label = $state('Save changes');

	const isIcon = $derived(size.startsWith('icon'));

	const playgroundCode = $derived(
		`<script>\n\timport { PortedButton } from 'fractalsvelte/ported';\n<\/script>\n\n<PortedButton\n\tvariant="${variant}"\n\tsize="${size}"${disabled ? '\n\tdisabled' : ''}\n>\n\t${isIcon ? '··· icon ···' : label}\n</PortedButton>`
	);

	const variantsCode = `<script>
	import { PortedButton } from 'fractalsvelte/ported';
<\/script>

<div class="row wrap gap-2xs">
	<PortedButton variant="default">Default</PortedButton>
	<PortedButton variant="secondary">Secondary</PortedButton>
	<PortedButton variant="outline">Outline</PortedButton>
	<PortedButton variant="ghost">Ghost</PortedButton>
	<PortedButton variant="destructive">Delete</PortedButton>
	<PortedButton variant="link">Read more</PortedButton>
</div>`;

	const sizesCode = `<script>
	import { PortedButton } from 'fractalsvelte/ported';
<\/script>

<div class="row wrap gap-2xs">
	<PortedButton size="xs">Extra small</PortedButton>
	<PortedButton size="sm">Small</PortedButton>
	<PortedButton size="default">Default</PortedButton>
	<PortedButton size="lg">Large</PortedButton>
</div>`;

	const iconSizesCode = `<script>
	import { PortedButton } from 'fractalsvelte/ported';
	import { Icon } from 'fractalicons';
	import { luSettings, luBell } from 'fractalicons/lucide';
<\/script>

<div class="row wrap gap-2xs">
	<PortedButton size="icon-xs" aria-label="Settings"><Icon icon={luSettings} /></PortedButton>
	<PortedButton size="icon-sm" aria-label="Notifications"><Icon icon={luBell} /></PortedButton>
</div>`;

	const statesCode = `<script>
	import { PortedButton } from 'fractalsvelte/ported';
<\/script>

<div class="row wrap gap-2xs">
	<PortedButton disabled>Disabled</PortedButton>
	<PortedButton variant="outline" disabled>Disabled</PortedButton>
	<PortedButton variant="destructive" disabled>Delete workspace</PortedButton>
</div>`;

	const anchorCode = `<script>
	import { PortedButton } from 'fractalsvelte/ported';
<\/script>

<div class="row wrap gap-2xs">
	<PortedButton href="https://svelte.dev" variant="outline">External link</PortedButton>
	<PortedButton href="/guides" variant="link">Read the guide</PortedButton>
</div>`;
</script>

<div class="stack gap-m">
	<section class="card pad-m stack gap-s" aria-labelledby="ported-playground-heading">
		<strong id="ported-playground-heading" class="text-md weight-600">Interactive Playground</strong>
		<div class="row wrap gap-s">
			<label class="field">
				<span class="field-label">Variant</span>
				<select class="select" bind:value={variant}>
					<option value="default">default</option>
					<option value="secondary">secondary</option>
					<option value="outline">outline</option>
					<option value="ghost">ghost</option>
					<option value="destructive">destructive</option>
					<option value="link">link</option>
				</select>
			</label>
			<label class="field">
				<span class="field-label">Size</span>
				<select class="select" bind:value={size}>
					<option value="xs">xs</option>
					<option value="sm">sm</option>
					<option value="default">default</option>
					<option value="lg">lg</option>
					<option value="icon-xs">icon-xs</option>
					<option value="icon-sm">icon-sm</option>
					<option value="icon">icon</option>
					<option value="icon-lg">icon-lg</option>
				</select>
			</label>
			<label class="field">
				<span class="field-label">Label</span>
				<input class="input" type="text" bind:value={label} disabled={isIcon} />
			</label>
			<label class="field">
				<span class="field-label">State</span>
				<span class="row ycenter gap-2xs">
					<input type="checkbox" bind:checked={disabled} />
					<span class="text-sm">Disabled</span>
				</span>
			</label>
		</div>
		<div class="row ycenter xcenter pad-m surface radius-8 border">
			{#if isIcon}
				<PortedButton {variant} {size} {disabled} aria-label={label}>
					<Icon icon={luBell} />
				</PortedButton>
			{:else}
				<PortedButton {variant} {size} {disabled}>{label}</PortedButton>
			{/if}
		</div>
		<pre class="playground__code-content"><code>{playgroundCode}</code></pre>
	</section>

	<DemoCard
		title="Variants"
		description="All six shadcn intents. Default maps to the fractal primary treatment."
		code={variantsCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<PortedButton variant="default">Default</PortedButton>
			<PortedButton variant="secondary">Secondary</PortedButton>
			<PortedButton variant="outline">Outline</PortedButton>
			<PortedButton variant="ghost">Ghost</PortedButton>
			<PortedButton variant="destructive">Delete</PortedButton>
			<PortedButton variant="link">Read more</PortedButton>
		</div>
	</DemoCard>

	<DemoCard
		title="Sizes"
		description="Text sizes snap to the nearest fractal density: xs→sm (26px), sm/default→md (32px), lg→lg (38px)."
		code={sizesCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<PortedButton size="xs">Extra small</PortedButton>
			<PortedButton size="sm">Small</PortedButton>
			<PortedButton size="default">Default</PortedButton>
			<PortedButton size="lg">Large</PortedButton>
		</div>
	</DemoCard>

	<DemoCard
		title="Icon sizes"
		description="Square icon densities. Always pair with an aria-label."
		code={iconSizesCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<PortedButton size="icon-xs" variant="ghost" aria-label="Settings">
				<Icon icon={luSettings} />
			</PortedButton>
			<PortedButton size="icon-sm" variant="outline" aria-label="Notifications">
				<Icon icon={luBell} />
			</PortedButton>
			<PortedButton size="icon" variant="secondary" aria-label="Archive">
				<Icon icon={luArchive} />
			</PortedButton>
			<PortedButton size="icon-lg" variant="default" aria-label="Email">
				<Icon icon={luMail} />
			</PortedButton>
		</div>
	</DemoCard>

	<DemoCard
		title="With icons"
		description="Inline icons compose via fractalicons; spacing follows the button gap."
		code={variantsCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<PortedButton variant="secondary">
				<Icon icon={luMail} />
				Email us
			</PortedButton>
			<PortedButton variant="outline">
				Continue
				<Icon icon={luArrowRight} />
			</PortedButton>
		</div>
	</DemoCard>

	<DemoCard
		title="States"
		description="Disabled blocks interaction at 50% opacity — the same contract as the fractal button."
		code={statesCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<PortedButton disabled>Disabled</PortedButton>
			<PortedButton variant="outline" disabled>Disabled</PortedButton>
			<PortedButton variant="destructive" disabled>Delete workspace</PortedButton>
		</div>
	</DemoCard>

	<DemoCard
		title="Anchor"
		description="Passing href renders an anchor that keeps every visual state."
		code={anchorCode}
	>
		<div class="row wrap gap-2xs ycenter">
			<PortedButton href="https://svelte.dev" variant="outline">External link</PortedButton>
			<PortedButton href="/guides" variant="link">Read the guide</PortedButton>
		</div>
	</DemoCard>
</div>
