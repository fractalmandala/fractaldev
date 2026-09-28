<script lang="ts">
	type Props = {
		value?: number;
		max?: number;
		label?: string;
		class?: string;
		[key: string]: unknown;
	};

	let {
		value = 0,
		max = 100,
		label,
		class: className = '',
		...rest
	}: Props = $props();

	const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
	const rootClass = $derived(`progress ${className}`.trim());
</script>

<div class={rootClass} aria-label={label} {...rest}>
	{#if label}
		<div class="progress-label">
			<span>{label}</span>
			<span>{Math.round(percentage)}%</span>
		</div>
	{/if}
	<div
		class="progress-track"
		role="progressbar"
		aria-valuemin="0"
		aria-valuemax={max}
		aria-valuenow={value}
	>
		<div class="progress-bar" style:width={`${percentage}%`}></div>
	</div>
</div>

<style lang="sass">

.progress
	display: flex
	flex-direction: column
	gap: calc(var(--space-3xs) * var(--gap-scale, 1))
	width: 100%
	max-width: 420px

	&-label
		display: flex
		align-items: center
		justify-content: space-between
		font-family: inherit
		font-size: var(--text-xs)
		font-weight: 500
		color: var(--text-secondary)

	&-track
		height: 8px
		width: 100%
		background: var(--bg-raised)
		border: 1px solid var(--border-subtle)
		border-radius: var(--radius-full)
		overflow: hidden

	&-bar
		height: 100%
		background: var(--theme-color)
		border-radius: var(--radius-full)
		transition: width var(--motionin1)
</style>
