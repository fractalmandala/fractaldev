<script lang="ts">
	import { themeState } from '../state/theme.svelte.js';

	function patternStyleToCss(style: Record<string, string | number | undefined> | undefined): string {
		if (!style) return '';
		return Object.entries(style)
			.filter(([_, v]) => v !== undefined && v !== '')
			.map(([k, v]) => {
				const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
				return `${cssKey}: ${v};`;
			})
			.join(' ');
	}
</script>

{#if themeState.isAura}
	<div
		class="aura-ambient"
		aria-hidden="true"
		style="position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;"
	>
		{#if themeState.activeAuraPreset?.layers?.length}
			{#each themeState.activeAuraPreset.layers as layer, i (layer.layer || i)}
				<div
					class="aura-layer"
					style:background={layer.background}
					style:mix-blend-mode={layer.blendMode || 'normal'}
					style:filter={`blur(${layer.blurMobile || layer.blur || 75}px)`}
					style:opacity={layer.opacity !== undefined ? layer.opacity : 1}
					style="position: absolute; inset: 0; pointer-events: none;"
				></div>
			{/each}
		{:else if themeState.activeCustomAuraLayers && themeState.activeCustomAuraLayers.length > 0}
			{#each themeState.activeCustomAuraLayers as layer, i (layer.layer || i)}
				<div
					class="aura-layer"
					style:background={layer.background}
					style:mix-blend-mode={layer.blendMode || 'normal'}
					style:filter={`blur(${layer.blurMobile || layer.blur || 75}px)`}
					style:opacity={layer.opacity !== undefined ? layer.opacity : 1}
					style="position: absolute; inset: 0; pointer-events: none;"
				></div>
			{/each}
		{:else}
			<div class="aura-layer aura-layer-1" style="position: absolute; inset: 0; pointer-events: none;"></div>
			<div class="aura-layer aura-layer-2" style="position: absolute; inset: 0; pointer-events: none;"></div>
			<div class="aura-layer aura-layer-3" style="position: absolute; inset: 0; pointer-events: none;"></div>
			<div class="aura-layer aura-layer-4" style="position: absolute; inset: 0; pointer-events: none;"></div>
			<div class="aura-layer aura-layer-5" style="position: absolute; inset: 0; pointer-events: none;"></div>
			<div class="aura-layer aura-layer-6" style="position: absolute; inset: 0; pointer-events: none;"></div>
		{/if}
	</div>
{:else if themeState.isGradient}
	<div
		class="aura-gradient-backdrop"
		aria-hidden="true"
		style="position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;"
	>
		<div
			class="gradient-canvas"
			style:background={themeState.activeGradientPreset ? themeState.activeGradientPreset.css : 'var(--bg-gradient, transparent)'}
			style="position: absolute; inset: 0; pointer-events: none;"
		></div>
		<div
			class="gradient-overlay-soft"
			style="position: absolute; inset: 0; pointer-events: none;"
		></div>
	</div>
{:else if themeState.isPattern && themeState.activePatternObject}
	<div
		class="aura-pattern-backdrop"
		aria-hidden="true"
		style="position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;"
	>
		<div
			class="pattern-canvas"
			style={patternStyleToCss(themeState.activePatternObject.style)}
			style:position="absolute"
			style:inset="0"
			style:pointer-events="none"
		></div>
		<div
			class="pattern-overlay-soft"
			style="position: absolute; inset: 0; pointer-events: none;"
		></div>
	</div>
{/if}
