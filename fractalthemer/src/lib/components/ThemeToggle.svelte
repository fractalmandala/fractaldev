<script lang="ts">
	import { onMount } from 'svelte';
	import { themeState } from '../state/theme.svelte.js';
	import Sun from '../icons/Sun.svelte';
	import Moon from '../icons/Moon.svelte';

	interface Props {
		class?: string;
		title?: string;
	}

	let { class: className = '', title }: Props = $props();

	onMount(() => {
		themeState.init();
	});
</script>

<button
	type="button"
	class="theme-icon-btn {className}"
	title={title || (themeState.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
	aria-label={title || (themeState.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
	onclick={() => themeState.toggleMode()}
>
	{#if themeState.isDark}
		<Sun />
	{:else}
		<Moon />
	{/if}
</button>
