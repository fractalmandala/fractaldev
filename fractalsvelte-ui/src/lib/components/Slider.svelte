<script lang="ts">
	interface Props {
		value?: number;
		onValueChange?: (value: number) => void;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		/** Show a live value bubble above the thumb. */
		showValue?: boolean;
		label?: string;
		class?: string;
	}

	let {
		value = $bindable(50),
		onValueChange,
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		showValue = false,
		label = 'Slider',
		class: className = ''
	}: Props = $props();

	const pct = $derived(((value - min) / (max - min)) * 100);
	const inputId = `fs-slider-${Math.random().toString(36).slice(2, 8)}`;

	function onChange(e: Event) {
		const v = Number((e.currentTarget as HTMLInputElement).value);
		value = v;
		onValueChange?.(v);
	}
</script>

<div class="box gap-2xs {className}">
	{#if label || showValue}
		<div class="row xbetween wfull">
			<label class="field-label" for={inputId}>{label}</label>
			{#if showValue}<span class="weight-600" style="color: var(--theme-color)">{value}</span>{/if}
		</div>
	{/if}
	<input
		id={inputId}
		class="slider"
		type="range"
		{min}
		{max}
		{step}
		{value}
		{disabled}
		style={`--fs-slider-pct:${pct}%`}
		oninput={onChange}
	/>
</div>
