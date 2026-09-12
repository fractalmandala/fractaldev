<script lang="ts">
	type Props = {
		checked?: boolean;
		label?: string;
		disabled?: boolean;
	};

	let { checked = $bindable(false), label, disabled = false }: Props = $props();
</script>

<label class="switch" data-disabled={disabled || undefined}>
	<input type="checkbox" role="switch" bind:checked {disabled} />
	<span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span>
	{#if label}<span>{label}</span>{/if}
</label>
