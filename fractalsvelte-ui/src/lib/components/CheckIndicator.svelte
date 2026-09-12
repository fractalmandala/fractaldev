<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luCheck, luMinus } from 'fractalicons/lucide';

	interface Props {
		state?: 'checked' | 'unchecked' | 'indeterminate';
		disabled?: boolean;
		class?: string;
	}

	let { state = 'unchecked', disabled = false, class: className = '' }: Props = $props();
</script>

<span class="k-check {className}" data-state={disabled ? 'disabled' : state} aria-hidden="true">
	{#if state === 'checked'}
		<Icon icon={luCheck} size={13} />
	{:else if state === 'indeterminate'}
		<Icon icon={luMinus} size={13} />
	{/if}
</span>
