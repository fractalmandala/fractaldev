<script lang="ts">
	import { Slider } from '#lib/components/index.ts';
	import DemoCard from './DemoCard.svelte';

	let volume = $state(50);
	let brightness = $state(72);
	let zoom = $state(100);

	const basicCode = `<script>
	import { Slider } from 'fractalsvelte/components';
	let volume = $state(50);
<\/script>

<Slider label="Volume" bind:value={volume} />`;

	const liveCode = `<script>
	import { Slider } from 'fractalsvelte/components';
	let brightness = $state(72);
<\/script>

<Slider label="Brightness" bind:value={brightness} showValue />`;

	const rangeCode = `<script>
	import { Slider } from 'fractalsvelte/components';
	let zoom = $state(100);
<\/script>

<Slider label="Zoom" bind:value={zoom} min={50} max={200} step={10} showValue />`;
</script>

<div class="stack gap-s">
	<DemoCard title="Basic" description="A labeled range input bound to state. Keyboard arrows adjust by step." code={basicCode}>
		<div class="wfull" style="max-width: 22rem">
			<Slider label="Volume" bind:value={volume} />
		</div>
	</DemoCard>

	<DemoCard title="Live value" description="showValue echoes the current number beside the label while dragging." code={liveCode}>
		<div class="wfull" style="max-width: 22rem">
			<Slider label="Brightness" bind:value={brightness} showValue />
		</div>
	</DemoCard>

	<DemoCard title="Range and step" description="Custom min, max, and step constrain the track — useful for zoom, percentage, and quantity fields." code={rangeCode}>
		<div class="wfull" style="max-width: 22rem">
			<Slider label="Zoom" bind:value={zoom} min={50} max={200} step={10} showValue />
		</div>
	</DemoCard>
</div>
