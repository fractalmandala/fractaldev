<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/styles/index.sass';
	import type { LayoutProps } from './$types';
	import ThemePicker from '$lib/components/ThemePicker.svelte';
	import AuraBackground from '$lib/components/AuraBackground.svelte';
	import { themeState } from '$lib/utils/theme.svelte';

	let { data, children }: LayoutProps = $props();
	onMount(() => {
		themeState.init();

		function handleResize() {
			if (window.innerWidth >= 1024 && menuState.open) {
				closeMenuState();
			}
		}

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			if (browser) {
				document.documentElement.style.removeProperty('overflow');
				document.body.style.removeProperty('overflow');
			}
		};
	});
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<AuraBackground />
<div class="appshell">
	<header class="appheader">
		<div class="logoarea">
			<a href="/"><span style="color: #aa1e1e">svelte</span> animated icon</a>
		</div>
		<div class="row gap16">
			<a class="header-nav" href="/flowbite">flowbite</a>
			<a class="header-nav" href="/hero">hero</a>
			<a class="header-nav" href="/ion">ion</a>
			<a class="header-nav" href="/phosphor">phosphor</a>
						<a class="header-nav" href="/remix">remix</a>
			<ThemePicker />
		</div>
	</header>
	<main class="bodyshell">
		{@render children()}
	</main>
</div>
