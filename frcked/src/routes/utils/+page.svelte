<script lang="ts">
	import { onMount } from 'svelte';
	import { staggeredAnimation, singleElementAnimation, staggerPresets } from '$lib/utilities';
	import { Button, Card, LoadingSpinner } from '$lib/components/partials';
	import { ThemeIcons, NavigationIcons } from '$lib/components/icons';

	let loading = $state(true);
	let selectedDemo = $state('fade-in-up');
	let refreshCounter = $state(0);

	// Demo configurations
	const demos = [
		{
			id: 'fade-in-up',
			name: 'Fade In Up',
			icon: 'arrow-up',
			description: 'Fade in while sliding up from below'
		},
		{
			id: 'fade-in-down',
			name: 'Fade In Down',
			icon: 'arrow-down',
			description: 'Fade in while sliding down from above'
		},
		{
			id: 'fade-in-left',
			name: 'Fade In Left',
			icon: 'arrow-left',
			description: 'Fade in while sliding from the left'
		},
		{
			id: 'fade-in-right',
			name: 'Fade In Right',
			icon: 'arrow-right',
			description: 'Fade in while sliding from the right'
		},
		{
			id: 'scale-in',
			name: 'Scale In',
			icon: 'plus',
			description: 'Scale up from a smaller size'
		},
		{
			id: 'slide-up-scale',
			name: 'Slide Up Scale',
			icon: 'arrow-up',
			description: 'Slide up and scale in simultaneously'
		},
		{
			id: 'quick-fade',
			name: 'Quick Fade',
			icon: 'refresh',
			description: 'Fast fade in with minimal movement'
		},
		{
			id: 'dramatic',
			name: 'Dramatic',
			icon: 'star',
			description: 'Slow entrance with scale and movement'
		},
		{
			id: 'custom',
			name: 'Custom Mix',
			icon: 'settings',
			description: 'Custom animation parameters possible'
		}
	];

	// Sample data for animations
	const sampleCards = [
		{
			id: 1,
			title: 'Feature One',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			icon: 'dashboard',
			color: 'blue'
		},
		{
			id: 2,
			title: 'Feature Two',
			description: 'Sed do eiusmod tempor incididunt ut labore et dolore.',
			icon: 'user',
			color: 'green'
		},
		{
			id: 3,
			title: 'Feature Three',
			description: 'Ut enim ad minim veniam, quis nostrud exercitation.',
			icon: 'star',
			color: 'purple'
		},
		{
			id: 4,
			title: 'Feature Four',
			description: 'Duis aute irure dolor in reprehenderit in voluptate.',
			icon: 'heart',
			color: 'red'
		}
	];

	const listItems = [
		'Performance optimized with requestAnimationFrame',
		'GPU-accelerated transforms for smooth 60fps animations',
		'Intersection Observer for viewport detection',
		'Respects user animation preferences',
		'Resets on scroll when needed',
		'Lightweight and tree-shakable'
	];

	// Get current animation options based on selection
	function getCurrentAnimationOptions() {
		switch (selectedDemo) {
			case 'fade-in-up':
				return staggerPresets.fadeInUp();
			case 'fade-in-down':
				return staggerPresets.fadeInDown();
			case 'fade-in-left':
				return staggerPresets.fadeInLeft();
			case 'fade-in-right':
				return staggerPresets.fadeInRight();
			case 'scale-in':
				return staggerPresets.scaleIn();
			case 'slide-up-scale':
				return staggerPresets.slideUpScale();
			case 'quick-fade':
				return staggerPresets.quickFade();
			case 'dramatic':
				return staggerPresets.dramatic();
			case 'custom':
				return {
					duration: 800,
					fromOpacity: 0,
					fromY: 50,
					fromX: -20,
					fromScale: 0.7,
					staggerDelay: 150,
					easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
				};
			default:
				return staggerPresets.fadeInUp();
		}
	}

	// Reactive animation options
	const currentAnimationOptions = $derived(getCurrentAnimationOptions());

	function refreshAnimations() {
		refreshCounter += 1;
	}

	function selectDemo(demoId: string) {
		selectedDemo = demoId;
		refreshAnimations();
	}

	onMount(() => {
		loading = false;
	});
</script>

<svelte:head>
	<title>Utils | Svelte-GUI</title>
	<meta name="description" content="Explore powerful animation utilities in Svelte-GUI" />
</svelte:head>

<div class="content-clamp marg-auto pad-x-16 pad-y-32">
	<!-- Header -->
	<header class="marg-bottom-32 ta-c">
		<h1 class="marg-bottom-16 text-4xl weight-700 text-primary">Animation Utilities</h1>
		<p class="mb-6 text-lg text-secondary">Staggered effects & viewport detection</p>
		<div class="marg-bottom-32 row xcenter gap-4">
			<Button onclick={refreshAnimations} variant="outline" size="md">
				<NavigationIcons name="refresh" class="marg-right-8 square-16" />
				Refresh Animations
			</Button>
		</div>
	</header>

	{#if loading}
		<div class="row xcenter pad-y-48">
			<LoadingSpinner text="Loading animation demos..." size="lg" />
		</div>
	{:else}
		<!-- Demo Selector -->
		<div class="marg-bottom-32">
			<h2 class="marg-bottom-16 text-2xl weight-600 text-primary">Choose Animation Type</h2>
			<div class="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
				{#each demos as demo (demo.id)}
					<Card
						padding="md"
						hover={true}
						clickable={true}
						class={selectedDemo === demo.id
							? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20'
							: ''}
						onclick={() => selectDemo(demo.id)}
					>
						<div class="row ytop gap-12">
							<ThemeIcons name={demo.icon} class="marg-top-4 h-5 w-5 text-secondary" />
							<div class="grow">
								<h3 class="weight-500 text-primary">
									{demo.name}
								</h3>
								<p class="marg-top-4 text-sm text-secondary">
									{demo.description}
								</p>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		</div>

		<!-- Card Grid Demo -->
		<section class="marg-bottom-48">
			<Card padding="lg">
				<h2 class="mb-6 text-2xl weight-600 text-primary">Card Grid</h2>
				<p class="mb-8 text-secondary">
					Watch as these cards animate into view with the selected stagger effect.
				</p>
				{#key refreshCounter}
					<div
						class="grid gap-24 sm:grid-cols-2 lg:grid-cols-4"
						use:staggeredAnimation={currentAnimationOptions}
					>
						{#each sampleCards as card (card.id)}
							<div class="radius-8 border bg pad-24 shadow-sm">
								<div class="marg-bottom-16 row ycenter xbetween">
									<ThemeIcons name={card.icon} class="square-32 text-{card.color}-500" />
									<span class="text-xs weight-500 text-muted">
										0{card.id}
									</span>
								</div>
								<h3 class="marg-bottom-8 text-lg weight-600 text-primary">
									{card.title}
								</h3>
								<p class="text-secondary">
									{card.description}
								</p>
							</div>
						{/each}
					</div>
				{/key}
			</Card>
		</section>

		<!-- List Demo -->
		<section class="marg-bottom-48">
			<Card padding="lg">
				<h2 class="mb-6 text-2xl weight-600 text-primary">Feature List</h2>
				<p class="mb-8 text-secondary">
					The stagger effect works with lists too. Each item appears with a cascading delay.
				</p>
				{#key refreshCounter}
					<div class="gap-12" use:staggeredAnimation={currentAnimationOptions}>
						{#each listItems as item, index (index)}
							<div class="row ycenter gap-12 radius-8 border surface pad-16">
								<div class="row square-32 ycenter xcenter radius-full surface text-theme">
									{index + 1}
								</div>
								<p class="text-primary">{item}</p>
							</div>
						{/each}
					</div>
				{/key}
			</Card>
		</section>

		<!-- Single Element Demo -->
		<section class="marg-bottom-48">
			<Card padding="lg">
				<h2 class="mb-6 text-2xl weight-600 text-primary">Single Element</h2>
				<p class="mb-8 text-secondary">
					You can also animate individual elements without staggering.
				</p>
				<div class="grid gap-32 md:grid-cols-2">
					{#key refreshCounter}
						<div
							class="radius-8 bg-linear-to-r from-blue-500 to-blue-950 p-8 text-inverse"
							use:singleElementAnimation={{
								duration: 800,
								fromOpacity: 0,
								fromY: 40,
								easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
							}}
						>
							<h3 class="marg-bottom-8 text-xl weight-700">Call-to-Action</h3>
							<p class="marg-bottom-16">This entire card animates.</p>
							<Button variant="secondary" size="sm" class="bg text-primary hover:bg-gray-100">
								Get Started
							</Button>
						</div>
					{/key}
					{#key refreshCounter + 1}
						<div
							class="radius-8 border-2 border-dashed border-gray-300 p-8 ta-c dark:border-gray-600"
							use:singleElementAnimation={{
								duration: 600,
								fromOpacity: 0,
								fromScale: 0.5,
								easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
							}}
						>
							<ThemeIcons name="star" class="mx-auto marg-bottom-16 h-12 w-48 text-yellow-500" />
							<h3 class="marg-bottom-8 text-lg weight-600 text-primary">Scale Animation</h3>
							<p class="text-secondary">This container scales up with a bounce effect</p>
						</div>
					{/key}
				</div>
			</Card>
		</section>

		<!-- Configuration Info -->
		<section>
			<div class="marg-auto max-w-2xl">
				<h3 class="marg-bottom-16 text-lg weight-500 text-primary">Preset Options</h3>
				<div class="overflow-hidden radius-8 surface">
					<div class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each Object.entries(currentAnimationOptions) as [key, value] (`${key}-${value}`)}
							<div class="row ycenter xbetween pad-x-16 pad-y-12">
								<span class="font-mono text-sm text-secondary">{key}</span>
								<span class="text-sm weight-500 text-primary">
									{typeof value === 'number' ? `${value}ms` : String(value)}
								</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>
	{/if}
</div>
