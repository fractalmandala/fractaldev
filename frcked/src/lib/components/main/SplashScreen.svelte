<script lang="ts">
	import { ProgressBar } from '$lib/components/partials';
	import { onMount } from 'svelte';
	import { splashScreenState, splashScreen } from '$lib/states/splashScreen';
	import { APP_NAME } from '$lib/states/config.svelte';

	let state = $derived($splashScreenState);

	onMount(() => {
		splashScreen.startLoading();

		return () => {
			splashScreen.stop();
		};
	});
</script>

{#if state.isVisible}
	<div class="frk-appshell">
		<div class="row hfull ycenter xcenter">
			<div class="box ycenter gap-32 pad-x-16">
				<!-- Logo -->
				<div class="animate-pulse">
					<img src="/favicon.png" alt="Loading" class="h-24 w-24 sm:h-32 sm:w-32" />
				</div>

				<!-- App Name -->
				<div class="ta-c">
					<h1 class="marg-bottom-8 text-2xl weight-700 text-primary sm:text-3xl">{APP_NAME}</h1>
				</div>

				<!-- Progress Bar -->
				<div class="w-48 sm:w-64">
					<ProgressBar value={state.progress} label="Loading..." size="sm" animated={true} />
				</div>
			</div>
		</div>
	</div>
{/if}
