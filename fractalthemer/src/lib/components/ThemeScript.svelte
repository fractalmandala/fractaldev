<script lang="ts">
	import { getAntiFlickerScript } from '../utils/anti-flicker.js';

	interface Props {
		defaultTheme?: string;
		defaultBgStyle?: 'plain' | 'aura' | 'gradient' | 'pattern';
	}

	let { defaultTheme = 'theme-light-default', defaultBgStyle = 'plain' }: Props = $props();

	const scriptCode = $derived(getAntiFlickerScript(defaultTheme, defaultBgStyle));
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script>${scriptCode}<\/script>`}
</svelte:head>
