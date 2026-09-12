<script lang="ts">
	type Option = { label: string; value: string; disabled?: boolean };
	type Props = {
		value?: string;
		options: Option[];
		placeholder?: string;
		disabled?: boolean;
	};

	let { value = $bindable(''), options, placeholder = 'Select an option', disabled = false }: Props = $props();
</script>

<select class="select" bind:value {disabled} aria-label={placeholder}>
	<option value="" disabled>{placeholder}</option>
	{#each options as option}
		<option value={option.value} disabled={option.disabled}>{option.label}</option>
	{/each}
</select>
