<script lang="ts">
	interface Props {
		state?: 'checked' | 'unchecked';
		disabled?: boolean;
		class?: string;
	}

	let { state = 'unchecked', disabled = false, class: className = '' }: Props = $props();
</script>

<span class="k-radio {className}" data-state={disabled ? 'disabled' : state} aria-hidden="true"
></span>
