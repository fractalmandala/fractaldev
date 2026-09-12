<script lang="ts">

	import '$lib/aura.css'
	let { children } = $props();

</script>

<!-- Copper Patina - Aura (mesh) -->
<div class="aura-container">
  <!-- Layer 1 -->
  <div class="aura-layer aura-layer-1" aria-hidden="true"></div>

  <!-- Layer 2 -->
  <div class="aura-layer aura-layer-2" aria-hidden="true"></div>

  <!-- Layer 3 -->
  <div class="aura-layer aura-layer-3" aria-hidden="true"></div>

  <!-- Layer 4 -->
  <div class="aura-layer aura-layer-4" aria-hidden="true"></div>

  <!-- Content wrapper -->
  <div class="aura-content">
   {@render children()}
  </div>
</div>