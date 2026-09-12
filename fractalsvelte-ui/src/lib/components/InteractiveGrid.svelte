<script lang="ts">import MotionCoreComponent from './MotionCoreComponent.svelte'; let { items, text, label }: { items?: string[]; text?: string; label?: string } = $props();</script>
<MotionCoreComponent pattern="interactive-grid" {items} {text} {label} />
