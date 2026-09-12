<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		checked?: boolean;
		label?: string;
		disabled?: boolean;
		children?: Snippet;
	};

	let { checked = $bindable(false), label, disabled = false, children }: Props = $props();
</script>

<label class="check" data-disabled={disabled || undefined}>
	<input type="checkbox" bind:checked {disabled} />
	<span class="check-box" aria-hidden="true">✓</span>
	<span>{#if children}{@render children()}{:else}{label}{/if}</span>
</label>
