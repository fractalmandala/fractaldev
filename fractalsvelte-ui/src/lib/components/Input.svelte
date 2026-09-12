<script lang="ts">
	type Props = {
		value?: string;
		placeholder?: string;
		type?: 'text' | 'email' | 'password' | 'search' | 'number';
		disabled?: boolean;
		name?: string;
		id?: string;
		ariaLabel?: string;
	};

	let { value = $bindable(''), placeholder = '', type = 'text', disabled = false, name, id, ariaLabel }: Props = $props();
</script>

<input class="input" bind:value {placeholder} {type} {disabled} {name} {id} aria-label={ariaLabel} />
