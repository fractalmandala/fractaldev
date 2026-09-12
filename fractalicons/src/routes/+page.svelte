<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { luActivity, luSparkles, luFlame } from '$lib/lucide.js';
	import { phAcorn, phHeart, phLightning } from '$lib/phosphor.js';
	import { re24HoursLine, reFireLine } from '$lib/remix.js';
	import { maaLoadingLoop, maaAccountAlertLoop } from '$lib/materialanim.js';
	import { icAccessibilitySign } from '$lib/iconoir.js';
	import { anAccountBook } from '$lib/anticons.js';
	import { cuSpeedometer, cuChartLine } from '$lib/coreui.js';
	import { faFlameOutline, faHeartSharp } from '$lib/famicons.js';
	import { ciCoffeeCup, ciSearch } from '$lib/circum.js';
	import { bxAbacus } from '$lib/boxregular.js';
	import { bxsAdjust } from '$lib/boxsolid.js';
	import { ggAbstract } from '$lib/cssgg.js';
	import { feActivity } from '$lib/feathericons.js';
	import { farAlarmClock } from '$lib/fontawesome.js';
	import { fasHeart } from '$lib/fontawesomesolid.js';
	import { heAcademicCap } from '$lib/heroicons.js';
	import { hefAcademicCap } from '$lib/heroiconsfill.js';
	import { ocAlert16 } from '$lib/octicons.js';
	import { siFigma } from '$lib/simple.js';
	import { slAnchor } from '$lib/simpleline.js';
	import { tbArrowMerge } from '$lib/tabler.js';
	import { tbfAccessible } from '$lib/tablerfill.js';

	const sampleIcons = [
		{ set: 'Lucide (lu)', name: 'luActivity', icon: luActivity },
		{ set: 'Lucide (lu)', name: 'luSparkles', icon: luSparkles },
		{ set: 'Lucide (lu)', name: 'luFlame', icon: luFlame },
		{ set: 'Phosphor (ph)', name: 'phAcorn', icon: phAcorn },
		{ set: 'Phosphor (ph)', name: 'phHeart', icon: phHeart },
		{ set: 'Phosphor (ph)', name: 'phLightning', icon: phLightning },
		{ set: 'Remix (re)', name: 're24HoursLine', icon: re24HoursLine },
		{ set: 'Remix (re)', name: 'reFireLine', icon: reFireLine },
		{ set: 'Material Animated (maa)', name: 'maaLoadingLoop', icon: maaLoadingLoop },
		{ set: 'Material Animated (maa)', name: 'maaAccountAlertLoop', icon: maaAccountAlertLoop },
		{ set: 'Iconoir (ic)', name: 'icAccessibilitySign', icon: icAccessibilitySign },
		{ set: 'Ant Design (an)', name: 'anAccountBook', icon: anAccountBook },
		{ set: 'CoreUI (cu)', name: 'cuSpeedometer', icon: cuSpeedometer },
		{ set: 'CoreUI (cu)', name: 'cuChartLine', icon: cuChartLine },
		{ set: 'Famicons (fa)', name: 'faFlameOutline', icon: faFlameOutline },
		{ set: 'Famicons (fa)', name: 'faHeartSharp', icon: faHeartSharp },
		{ set: 'Circum (ci)', name: 'ciCoffeeCup', icon: ciCoffeeCup },
		{ set: 'Circum (ci)', name: 'ciSearch', icon: ciSearch },
		{ set: 'Boxicons (bx)', name: 'bxAbacus', icon: bxAbacus },
		{ set: 'Boxicons Solid (bxs)', name: 'bxsAdjust', icon: bxsAdjust },
		{ set: 'css.gg (gg)', name: 'ggAbstract', icon: ggAbstract },
		{ set: 'Feather (fe)', name: 'feActivity', icon: feActivity },
		{ set: 'Font Awesome (far)', name: 'farAlarmClock', icon: farAlarmClock },
		{ set: 'Font Awesome Solid (fas)', name: 'fasHeart', icon: fasHeart },
		{ set: 'Heroicons (he)', name: 'heAcademicCap', icon: heAcademicCap },
		{ set: 'Heroicons Solid (hef)', name: 'hefAcademicCap', icon: hefAcademicCap },
		{ set: 'Octicons (oc)', name: 'ocAlert16', icon: ocAlert16 },
		{ set: 'Simple Icons (si)', name: 'siFigma', icon: siFigma },
		{ set: 'Simple Line (sl)', name: 'slAnchor', icon: slAnchor },
		{ set: 'Tabler (tb)', name: 'tbArrowMerge', icon: tbArrowMerge },
		{ set: 'Tabler Filled (tbf)', name: 'tbfAccessible', icon: tbfAccessible }
	];
</script>

<main style="max-width: 960px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;">
	<header style="margin-bottom: 2rem;">
		<h1 style="font-size: 2rem; margin-bottom: 0.5rem;">fractalicons</h1>
		<p style="color: #64748b;">
			27,000+ icons across 25 families with short, ergonomic prefixes for Svelte 5.
		</p>
	</header>

	<div
		style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;"
	>
		{#each sampleIcons as item (item.name)}
			<div
				style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;"
			>
				<Icon icon={item.icon} size={32} />
				<div style="text-align: center;">
					<div style="font-weight: 600; font-size: 0.85rem; font-family: monospace;">
						{item.name}
					</div>
					<div style="font-size: 0.75rem; color: #94a3b8;">{item.set}</div>
				</div>
			</div>
		{/each}
	</div>
</main>
