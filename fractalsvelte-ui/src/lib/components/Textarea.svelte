<script lang="ts">
	type Props = {
		value?: string;
		placeholder?: string;
		rows?: number;
		disabled?: boolean;
		name?: string;
		id?: string;
		ariaLabel?: string;
	};

	let { value = $bindable(''), placeholder = '', rows = 4, disabled = false, name, id, ariaLabel }: Props = $props();
</script>

<textarea class="input" bind:value {placeholder} {rows} {disabled} {name} {id} aria-label={ariaLabel}></textarea>
