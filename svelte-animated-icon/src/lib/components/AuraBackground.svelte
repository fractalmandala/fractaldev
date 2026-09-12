<script lang="ts">
	import { themeState } from '$lib/utils/theme.svelte';
</script>

{#if themeState.isAura}
	<div class="aura-ambient" aria-hidden="true">
		{#if themeState.activeCustomAuraLayers && themeState.activeCustomAuraLayers.length > 0}
			{#each themeState.activeCustomAuraLayers as layer, i (layer.layer || i)}
				<div
					class="aura-layer"
					style:background={layer.background}
					style:mix-blend-mode={layer.blendMode || 'normal'}
					style:filter={`blur(${layer.blurMobile || layer.blur || 75}px)`}
					style:opacity={layer.opacity !== undefined ? layer.opacity : 1}
				></div>
			{/each}
		{:else}
			<div class="aura-layer aura-layer-1"></div>
			<div class="aura-layer aura-layer-2"></div>
			<div class="aura-layer aura-layer-3"></div>
			<div class="aura-layer aura-layer-4"></div>
			<div class="aura-layer aura-layer-5"></div>
			<div class="aura-layer aura-layer-6"></div>
		{/if}
	</div>
{/if}
