<script lang="ts">
	import { onMount } from 'svelte';

	// Light/dark toggle. Persists to localStorage and sets `data-theme` on
	// <html>, which the Acrolls scheme + fractalthemer respond to — so the whole
	// docs chrome (and prose) re-themes through the token bridge.
	type Props = {
		initial?: 'light' | 'dark' | 'system';
		storageKey?: string;
		label?: string;
	};

	let {
		initial = 'system',
		storageKey = 'acrolls-theme',
		label = 'Toggle color theme'
	}: Props = $props();

	let theme = $state<'light' | 'dark'>('light');

	function apply(next: 'light' | 'dark') {
		theme = next;
		if (typeof document === 'undefined') return;
		// Suppress transitions for one frame to avoid a flash on switch.
		const style = document.createElement('style');
		style.appendChild(
			document.createTextNode('*,*::before,*::after{transition:none!important}')
		);
		document.head.appendChild(style);
		document.documentElement.dataset.theme = next;
		try {
			localStorage.setItem(storageKey, next);
		} catch {
			/* storage unavailable (private mode) — theme still applies */
		}
		void window.getComputedStyle(document.documentElement).opacity;
		setTimeout(() => document.head.removeChild(style), 1);
	}

	function toggle() {
		apply(theme === 'dark' ? 'light' : 'dark');
	}

	onMount(() => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(storageKey);
		} catch {
			/* ignore */
		}
		const sys = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		const resolved: 'light' | 'dark' =
			stored === 'dark' || stored === 'light'
				? stored
				: initial === 'system'
					? sys
					: initial;
		theme = resolved;
		document.documentElement.dataset.theme = resolved;
	});
</script>

<button
	aria-label={label}
	class="acrolls-docs-icon-btn"
	data-acrolls-theme-toggle
	type="button"
	onclick={toggle}
>
	{#if theme === 'dark'}
		<svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
			<path
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
			/>
		</svg>
	{:else}
		<svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
			<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
				<circle cx="12" cy="12" r="4" />
				<path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
			</g>
		</svg>
	{/if}
</button>
