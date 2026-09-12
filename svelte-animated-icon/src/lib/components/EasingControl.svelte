<script lang="ts">
	import BezierEditor from './BezierEditor.svelte';
	import { bezierCss, matchPreset, DEFAULT_BEZIER, type Bezier } from '$lib/utils/easings';

	// `value` is the resulting CSS easing string, or null when the template keeps its own.
	let { value = $bindable<string | null>(null) }: { value?: string | null } = $props();

	let enabled = $state(true);
	let bezier = $state<Bezier>([...DEFAULT_BEZIER]);
	let open = $state(true);
	let root = $state<HTMLDivElement | null>(null);

	const label = $derived(enabled ? (matchPreset(bezier)?.label ?? 'custom') : 'default');

	// Push the resolved easing up to the parent whenever the override or curve changes.
	$effect(() => {
		value = enabled ? bezierCss(bezier) : null;
	});

	$effect(() => {
		function onWindowClick(e: MouseEvent) {
			if (!open || root?.contains(e.target as Node)) return;
			open = false;
		}
		window.addEventListener('click', onWindowClick);
		return () => window.removeEventListener('click', onWindowClick);
	});
</script>

<div class="easing-control row ycenter gap4" bind:this={root}>
	<BezierEditor bind:value={bezier} onchange={() => (enabled = true)} />
</div>
