<script lang="ts">
	import MotionCore from './MotionCore.svelte';

	type Props = { pattern: string; items?: string[]; text?: string; label?: string };
	let { pattern, items, text, label }: Props = $props();
</script>

<MotionCore {pattern} {items} {text} {label} />
