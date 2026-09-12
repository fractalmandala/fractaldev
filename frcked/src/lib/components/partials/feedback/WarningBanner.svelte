<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { StatusIcons, NavigationIcons } from '$lib/components/icons';

	let {
		message = 'Ohaithere',
		dismissible = true,
		color = 'yellow',
		size = 'sm',
		class: className = '',
		onDismiss,
		delay = 150
	}: {
		message?: string;
		dismissible?: boolean;
		color?: 'yellow' | 'blue' | 'red' | 'gray' | 'green';
		size?: 'xs' | 'sm';
		class?: string;
		onDismiss?: () => void;
		delay?: number;
	} = $props();

	let isDismissed = $state(true);

	// Show banner after delay
	$effect(() => {
		const timer = setTimeout(() => {
			isDismissed = false;
		}, delay);
		return () => clearTimeout(timer);
	});

	const colorVariants = {
		yellow: 'surface text-warning border-bottom',
		blue: 'surface text-theme border-bottom',
		red: 'surface text-danger border-bottom',
		gray: 'surface text-secondary border-bottom',
		green: 'surface text-success border-bottom'
	};

	const sizeVariants = {
		xs: 'pad-x-8 pad-y-4 text-xs',
		sm: 'pad-x-12 pad-y-6 text-xs'
	};

	// Auto-select icon based on color
	const iconMap = {
		yellow: 'warning',
		red: 'error',
		blue: 'info',
		gray: 'info',
		green: 'success'
	} as const;

	let bannerClasses = $derived(`wfull ${colorVariants[color]} ${sizeVariants[size]} ${className}`);

	let selectedIcon = $derived(iconMap[color]);

	function handleDismiss() {
		isDismissed = true;
		onDismiss?.();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && dismissible) {
			handleDismiss();
		}
	}
</script>

{#if !isDismissed}
	<div transition:slide={{ duration: 300, easing: quintOut }} class={bannerClasses} role="alert">
		<div class="content-clamp row ycenter xbetween gap-sm">
			<div class="row ycenter gap-sm grow min0">
				<span class="shrink-0">
					<StatusIcons name={selectedIcon} size="square-16" />
				</span>
				<p class="truncate text-tight weight-500">
					{message}
				</p>
			</div>

			{#if dismissible}
				<button
					onclick={handleDismiss}
					onkeydown={handleKeydown}
					class="shrink-0 radius-full pad-4 transition-colors hover:bg-black/5 focus:ring-2 focus:ring-current focus:ring-offset-1 focus:outline-none dark:hover:bg-white/5"
					aria-label="Dismiss warning"
				>
					<NavigationIcons name="close" size="square-12" />
				</button>
			{/if}
		</div>
	</div>
{/if}
