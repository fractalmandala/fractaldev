<script lang="ts">
	type Step = { id: string; title: string; description?: string };
	type Props = {
		steps: Step[];
		current?: number;
		interactive?: boolean;
	};

	let { steps, current = $bindable(0), interactive = false }: Props = $props();

	function select(step: number) {
		if (interactive) current = step;
	}
</script>

<ol class="stepper" aria-label="Progress">
	{#each steps as step, index (step.id)}
		<li data-state={index < current ? 'complete' : index === current ? 'current' : 'upcoming'}>
			<button type="button" onclick={() => select(index)} disabled={!interactive} aria-current={index === current ? 'step' : undefined}><span class="stepper-number">{index < current ? '✓' : index + 1}</span><span><strong>{step.title}</strong>{#if step.description}<small>{step.description}</small>{/if}</span></button>
		</li>
	{/each}
</ol>
