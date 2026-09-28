<script lang="ts">
	import DemoCard from '#lib/components/DemoCard.svelte';

	import PortedButtonVariants from './demos/PortedButtonVariants.svelte';
	import portedButtonVariantsRaw from './demos/PortedButtonVariants.svelte?raw';
	import PortedButtonSizes from './demos/PortedButtonSizes.svelte';
	import portedButtonSizesRaw from './demos/PortedButtonSizes.svelte?raw';
	import PortedButtonIconSizes from './demos/PortedButtonIconSizes.svelte';
	import portedButtonIconSizesRaw from './demos/PortedButtonIconSizes.svelte?raw';
	import PortedButtonWithIcons from './demos/PortedButtonWithIcons.svelte';
	import portedButtonWithIconsRaw from './demos/PortedButtonWithIcons.svelte?raw';
	import PortedButtonStates from './demos/PortedButtonStates.svelte';
	import portedButtonStatesRaw from './demos/PortedButtonStates.svelte?raw';
	import PortedButtonAnchor from './demos/PortedButtonAnchor.svelte';
	import portedButtonAnchorRaw from './demos/PortedButtonAnchor.svelte?raw';
</script>

<div class="stack gap-m">

	<DemoCard
		title="Variants"
		description="All six shadcn intents. Default maps to the fractal primary treatment."
		code={portedButtonVariantsRaw}
	>
		<PortedButtonVariants />
	</DemoCard>

	<DemoCard
		title="Sizes"
		description="Text sizes snap to the nearest fractal density: xs→sm (26px), sm/default→md (32px), lg→lg (38px)."
		code={portedButtonSizesRaw}
	>
		<PortedButtonSizes />
	</DemoCard>

	<DemoCard
		title="Icon sizes"
		description="Square icon densities. Always pair with an aria-label."
		code={portedButtonIconSizesRaw}
	>
		<PortedButtonIconSizes />
	</DemoCard>

	<DemoCard
		title="With icons"
		description="Inline icons compose via fractalicons; spacing follows the button gap."
		code={portedButtonWithIconsRaw}
	>
		<PortedButtonWithIcons />
	</DemoCard>

	<DemoCard
		title="States"
		description="Disabled blocks interaction at 50% opacity — the same contract as the fractal button."
		code={portedButtonStatesRaw}
	>
		<PortedButtonStates />
	</DemoCard>

	<DemoCard
		title="Anchor"
		description="Passing href renders an anchor that keeps every visual state."
		code={portedButtonAnchorRaw}
	>
		<PortedButtonAnchor />
	</DemoCard>
</div>
