<script lang="ts">
	import DemoCard, { type DemoOption } from './DemoCard.svelte';
	import ButtonIntents from './demos/button/ButtonIntents.svelte';
	import buttonIntentsRaw from './demos/button/ButtonIntents.svelte?raw';
	import ButtonStates from './demos/button/ButtonStates.svelte';
	import buttonStatesRaw from './demos/button/ButtonStates.svelte?raw';
	import ButtonSizes from './demos/button/ButtonSizes.svelte';
	import buttonSizesRaw from './demos/button/ButtonSizes.svelte?raw';
	import ButtonPill from './demos/button/ButtonPill.svelte';
	import buttonPillRaw from './demos/button/ButtonPill.svelte?raw';
	import ButtonShapes from './demos/button/ButtonShapes.svelte';
	import buttonShapesRaw from './demos/button/ButtonShapes.svelte?raw';
	import ButtonIcons from './demos/button/ButtonIcons.svelte';
	import buttonIconsRaw from './demos/button/ButtonIcons.svelte?raw';
	import ButtonIconOnly from './demos/button/ButtonIconOnly.svelte';
	import buttonIconOnlyRaw from './demos/button/ButtonIconOnly.svelte?raw';
	import ButtonLoading from './demos/button/ButtonLoading.svelte';
	import buttonLoadingRaw from './demos/button/ButtonLoading.svelte?raw';
	import ButtonFullWidth from './demos/button/ButtonFullWidth.svelte';
	import buttonFullWidthRaw from './demos/button/ButtonFullWidth.svelte?raw';
	import ButtonAnchor from './demos/button/ButtonAnchor.svelte';
	import buttonAnchorRaw from './demos/button/ButtonAnchor.svelte?raw';
	// Enumerations (variant/size/shape/icon-size) read the unions; curated
	// scenarios (states/pill/icons) read the single list in `scenarios.ts`.
	// Either way there is exactly one declaration per member/scenario.
	import { BUTTON_SIZES, BUTTON_VARIANTS, SIZES, SHAPES } from '#lib/data/componentTypes.ts';
	import {
		BTN_IMPORT,
		ICON_ONLY_IMPORT,
		ICON_ONLY_META,
		BUTTON_ICON_SCENARIOS,
		BUTTON_PILL_SCENARIOS,
		BUTTON_STATE_SCENARIOS,
		optionsFrom
	} from './demos/button/scenarios.ts';

	/** Demo copy only — the member set itself comes from componentTypes. */
	const sizeLabels: Record<string, string> = { sm: 'Small', md: 'Medium', bs: 'Base', lg: 'Large' };
	const titleCase = (v: string) => v.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

	const all = (code: string): DemoOption => ({ value: 'all', label: 'All', code });
	const clause = (attr: 'variant' | 'size' | 'shape', value: string, text: string): string =>
		`${BTN_IMPORT}\n\n<Button ${attr}="${value}">${text}</Button>`;

	const variantOptions: DemoOption[] = [
		all(buttonIntentsRaw),
		...BUTTON_VARIANTS.map((value) => ({ value, label: titleCase(value), code: clause('variant', value, titleCase(value)) }))
	];

	const stateOptions: DemoOption[] = [all(buttonStatesRaw), ...optionsFrom(BUTTON_STATE_SCENARIOS)];

	// Base sizes only — the icon sizes are demonstrated in the "Icon only" card.
	const sizeOptions: DemoOption[] = [
		all(buttonSizesRaw),
		...SIZES.map((value) => {
			const label = sizeLabels[value] ?? titleCase(value);
			return { value, label, code: clause('size', value, `${label} (${value})`) };
		})
	];

	const pillOptions: DemoOption[] = [all(buttonPillRaw), ...optionsFrom(BUTTON_PILL_SCENARIOS)];

	// Base shapes only — `pill` is a ButtonShape member with its own card below.
	const shapeOptions: DemoOption[] = [
		all(buttonShapesRaw),
		...SHAPES.map((value) => ({ value, label: titleCase(value), code: clause('shape', value, titleCase(value)) }))
	];

	const iconOptions: DemoOption[] = [all(buttonIconsRaw), ...optionsFrom(BUTTON_ICON_SCENARIOS)];

	// The sizes are whatever the union marks as icon-only; the copy per size comes
	// from the shared scenario file, with a fallback so a newly-added icon size
	// still renders.
	const iconOnlyOptions: DemoOption[] = [
		all(buttonIconOnlyRaw),
		...BUTTON_SIZES.filter((size) => size.startsWith('icon')).map((size) => {
			const meta = ICON_ONLY_META[size];
			const label = meta?.label ?? titleCase(size);
			const code = meta
				? `${ICON_ONLY_IMPORT}\n\n<Button size="${size}" variant="${meta.variant}" aria-label="${meta.aria}">\n\t<Icon icon={${meta.iconName}} />\n</Button>`
				: `${ICON_ONLY_IMPORT}\n\n<Button size="${size}" aria-label="${label}">\n\t<Icon icon={luSettings} />\n</Button>`;
			return { value: size, label, code };
		})
	];
</script>

<div class="box gap-2xl">
	<DemoCard
		title="Variants"
		description="Activated by using the `variant=` clause in markup inline."
		code={buttonIntentsRaw}
		options={variantOptions}
		styleProps={{ selector: '.button' }}
	>
		{#snippet children(selected)}
			<ButtonIntents {selected} />
		{/snippet}
	</DemoCard>

	<DemoCard
		title="States"
		description="Disabled, loading, and combinations with intents. Interactive buttons suppress clicks during loading."
		code={buttonStatesRaw}
		options={stateOptions}
		styleProps={{ selector: '.button' }}
	>
		{#snippet children(selected)}
			<ButtonStates {selected} />
		{/snippet}
	</DemoCard>

	<DemoCard
		title="Sizes"
		description="Three scale steps keep typography and touch targets aligned with the fluid type ladder."
		code={buttonSizesRaw}
		options={sizeOptions}
		styleProps={{ selector: '.button' }}
	>
		{#snippet children(selected)}
			<ButtonSizes {selected} />
		{/snippet}
	</DemoCard>

	<DemoCard
		title="Pill shape"
		description="Capsule geometry using fully rounded borders; pairs with any intent or size."
		code={buttonPillRaw}
		options={pillOptions}
		styleProps={{ selector: '.button' }}
	>
		{#snippet children(selected)}
			<ButtonPill {selected} />
		{/snippet}
	</DemoCard>

	<DemoCard
		title="Shapes"
		description="Standardized shape geometry: square (0px), modern (4px), curved (8px), and round (pill/capsule)."
		code={buttonShapesRaw}
		options={shapeOptions}
		styleProps={{ selector: '.button' }}
	>
		{#snippet children(selected)}
			<ButtonShapes {selected} />
		{/snippet}
	</DemoCard>

	<DemoCard
		title="With icons"
		description="Drop an SVG icon directly inside the default slot alongside text."
		code={buttonIconsRaw}
		options={iconOptions}
		styleProps={{ selector: '.button' }}
	>
		{#snippet children(selected)}
			<ButtonIcons {selected} />
		{/snippet}
	</DemoCard>

	<DemoCard
		title="Icon only"
		description="Square proportions with aria-label for assistive tech."
		code={buttonIconOnlyRaw}
		options={iconOnlyOptions}
		styleProps={{ selector: '.button' }}
	>
		{#snippet children(selected)}
			<ButtonIconOnly {selected} />
		{/snippet}
	</DemoCard>

	<DemoCard
		title="Loading trigger"
		description="Click to see the loading spinner replace the label, then auto-reset."
		code={buttonLoadingRaw}
	>
		<ButtonLoading />
	</DemoCard>

	<DemoCard
		title="Full width"
		description="Stretch across the parent container using layout utility classes."
		code={buttonFullWidthRaw}
	>
		<ButtonFullWidth />
	</DemoCard>

	<DemoCard
		title="Rendered as link"
		description="Passing an href attribute renders an accessible <a> styled as a button."
		code={buttonAnchorRaw}
	>
		<ButtonAnchor />
	</DemoCard>
</div>
