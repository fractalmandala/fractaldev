<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { NavigationIcons } from '$lib/components/icons';

	let showButton = $state(false);
	let scrollY = $state(0);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};

	const handleScroll = () => {
		scrollY = window.scrollY;
		showButton = scrollY > 300;
	};

	onMount(() => {
		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

{#if showButton}
	<button
		onclick={scrollToTop}
		class="group fixed right-6 z-40 square-40 cursor-pointer radius-8 border surface text-secondary shadow-sm"
		style="bottom: max(0.5rem, env(safe-area-inset-bottom, 0.5rem));"
		aria-label="Scroll to top"
		in:fly={{ y: 20, duration: 300 }}
		out:fly={{ y: 20, duration: 200 }}
	>
		<div
			class="row h-full w-full ycenter xcenter transition-transform duration-200 group-hover:-translate-y-0.5"
		>
			<NavigationIcons name="chevron-up" size="square-16" />
		</div>
	</button>
{/if}
