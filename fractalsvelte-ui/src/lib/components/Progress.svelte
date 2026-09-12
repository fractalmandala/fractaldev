<script lang="ts">
	type Props = {
		value?: number;
		max?: number;
		label?: string;
	};

	let { value = 0, max = 100, label }: Props = $props();
	let percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div class="progress" aria-label={label}>
	{#if label}<div class="progress-label"><span>{label}</span><span>{Math.round(percentage)}%</span></div>{/if}
	<div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax={max} aria-valuenow={value}>
		<div class="progress-bar" style:width={`${percentage}%`}></div>
	</div>
</div>
