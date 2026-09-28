<script lang="ts">
	import DemoCard from './DemoCard.svelte';
	import SliderBasic from './demos/slider/SliderBasic.svelte';
	import sliderBasicRaw from './demos/slider/SliderBasic.svelte?raw';
	import SliderLiveValue from './demos/slider/SliderLiveValue.svelte';
	import sliderLiveValueRaw from './demos/slider/SliderLiveValue.svelte?raw';
	import SliderRange from './demos/slider/SliderRange.svelte';
	import sliderRangeRaw from './demos/slider/SliderRange.svelte?raw';
</script>

<div class="box gap-2xl">
	<DemoCard title="Basic" description="A labeled range input bound to state. Keyboard arrows adjust by step." code={sliderBasicRaw}>
		<SliderBasic />
	</DemoCard>

	<DemoCard title="Live value" description="showValue echoes the current number beside the label while dragging." code={sliderLiveValueRaw}>
		<SliderLiveValue />
	</DemoCard>

	<DemoCard title="Range and step" description="Custom min, max, and step constrain the track — useful for zoom, percentage, and quantity fields." code={sliderRangeRaw}>
		<SliderRange />
	</DemoCard>
</div>
