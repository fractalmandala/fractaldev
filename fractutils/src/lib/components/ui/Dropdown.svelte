<script lang="ts">

	import { tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import { clickOutsideAction } from '$lib/actions/clickoutside.svelte';
	import { slide } from 'svelte/transition'
	let dropdownEl: HTMLElement | undefined;
	let dropdownOpen = $state(false);

	interface Props {
		label?: string;
		children?: Snippet;
	}

	let {
		label = "Dropdown",
		children
	}: Props = $props()

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function closeDropdown() {
		dropdownOpen = false
	}

	function clickOutsideDropdown() {
		if (dropdownOpen) {
			dropdownOpen = false
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && dropdownOpen) closeDropdown();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="dropdown-wrapper" bind:this={dropdownEl} onkeydown={onKeydown} use:clickOutsideAction onclickoutside={clickOutsideDropdown}>
	<button
		type="button"
		aria-label="Accent color"
		aria-haspopup="listbox"
		aria-expanded={dropdownOpen}	
		aria-controls="accent-listbox"
		onclick={toggleDropdown}
	>
		<span class="accent-preview">{label}</span>
	</button>
	{#if dropdownOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="dropdown-child" role="listbox" tabindex="-1" onclick={closeDropdown} transition:slide={{ duration: 110 }}>
			{@render children?.()}
		</div>
	{/if}
</div>

<style lang="sass">

button
	background: none
	border: none
	padding: 0

.dropdown-wrapper
	position: relative

.dropdown-child
	position: absolute
	top: 2rem
	background: var(--bg-popover)
	border: 1px solid var(--border-subtle)

</style>
