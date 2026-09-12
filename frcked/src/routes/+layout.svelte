<script lang="ts">
	import '$lib/styles/fractalpop-demo.sass'
	import '$fractalstyler/index.sass';
	import '$lib/styles/index.sass';;
	import { fade } from 'svelte/transition';
	import AppHeader from '$lib/components/ui/AppHeader.svelte';
	import { Footer, SplashScreen } from '$lib/components/main';
	import { splashScreenState } from '$lib/states/splashScreen';
	import { Toast } from '$lib/components/partials';
	import { Mouse, ScrollToTop, Seo } from '$lib/components/ui';
	import Aura from '$lib/components/ui/AuraBackground.svelte';
	let { children } = $props();
	let splashState = $derived($splashScreenState);
</script>

<Seo />

<Aura/>
<SplashScreen />
{#if !splashState.isVisible}
	<div class="frk-appshell">
		<AppHeader headerName="frkced" />
		<main class="app-main wfull" in:fade>
			{@render children()}
		</main>
		<Footer />
	</div>
{/if}

<Toast />
<Mouse />
<ScrollToTop />
