<script lang="ts">
	type Step = { id: string; title: string; description?: string };
	type Props = {
		steps: Step[];
		current?: number;
		interactive?: boolean;
		class?: string;
		[key: string]: unknown;
	};

	let {
		steps,
		current = $bindable(0),
		interactive = false,
		class: className = '',
		...rest
	}: Props = $props();

	const rootClass = $derived(`stepper ${className}`.trim());

	function select(step: number) {
		if (interactive) current = step;
	}
</script>

<ol class={rootClass} aria-label="Progress" {...rest}>
	{#each steps as step, index (step.id)}
		<li data-state={index < current ? 'complete' : index === current ? 'current' : 'upcoming'}>
			<button
				type="button"
				onclick={() => select(index)}
				disabled={!interactive}
				aria-current={index === current ? 'step' : undefined}
			>
				<span class="stepper-number">{index < current ? '✓' : index + 1}</span>
				<span>
					<strong>{step.title}</strong>
					{#if step.description}<small>{step.description}</small>{/if}
				</span>
			</button>
		</li>
	{/each}
</ol>

<style lang="sass">

.stepper
	display: flex
	flex-direction: column
	gap: calc(var(--space-2xs) * var(--gap-scale, 1))
	list-style: none
	margin: 0
	padding: 0

	li
		display: flex
		list-style: none

		&[data-state='complete']
			.stepper-number
				background: var(--theme-color)
				border-color: var(--theme-color)
				color: var(--text-inverse)

			button
				color: var(--text-primary)

		&[data-state='current']
			.stepper-number
				border-color: var(--theme-color)
				color: var(--theme-color)

			button
				color: var(--text-primary)
				font-weight: 600

	button
		display: flex
		align-items: center
		gap: calc(var(--space-2xs) * var(--gap-scale, 1))
		padding: calc(var(--space-2xs) * var(--pad-scale, 1)) calc(var(--space-xs) * var(--pad-scale, 1))
		border: 1px solid transparent
		border-radius: var(--radius-md)
		background: transparent
		color: var(--text-secondary)
		font: inherit
		font-size: var(--text-sm)
		text-align: left
		cursor: pointer
		transition: background var(--motionin1), border-color var(--motionin1)

		&:disabled
			cursor: default

		&:not(:disabled):hover
			border-color: var(--border)
			background: var(--bg-raised)

		&:focus-visible
			outline: 2px solid var(--theme-color)
			outline-offset: 2px

	strong
		display: block

	small
		display: block
		font-size: var(--text-xs)
		font-weight: 400
		color: var(--text-muted)

.stepper-number
	display: inline-flex
	align-items: center
	justify-content: center
	inline-size: 1.75rem
	block-size: 1.75rem
	flex-shrink: 0
	border-radius: var(--radius-full)
	border: 1px solid var(--border)
	background: var(--bg-raised)
	color: var(--text-secondary)
	font-size: var(--text-xs)
	font-weight: 600
</style>
