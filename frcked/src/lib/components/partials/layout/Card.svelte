<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { NavigationIcons } from '$lib/components/icons';
	import { scrollToElementSmooth, animations } from '$lib/utilities';
	import { untrack } from 'svelte';

	let {
		title,
		subtitle,
		padding = 'md',
		shadow = 'md',
		rounded = 'lg',
		hover = false,
		clickable = false,
		expandable = false,
		defaultExpanded = false,
		href,
		target,
		onclick,
		class: className = '',
		headerClass = '',
		bodyClass = '',
		children
	}: {
		title?: string;
		subtitle?: string;
		padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
		shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
		rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
		hover?: boolean;
		clickable?: boolean;
		expandable?: boolean;
		defaultExpanded?: boolean;
		href?: string;
		target?: string;
		onclick?: () => void;
		class?: string;
		headerClass?: string;
		bodyClass?: string;
		children?: import('svelte').Snippet;
	} = $props();

	let isExpanded = $state(untrack(() => defaultExpanded));
	let cardElement: HTMLElement | undefined = $state();

	// Pre-computed static classes - no reactive recalculation
	const paddingClasses = {
		none: '',
		sm: 'pad-12',
		md: 'pad-16 pad-24-desk',
		lg: 'pad-24 pad-32-desk',
		xl: 'pad-32 pad-40-desk'
	};

	const shadowClasses = {
		none: '',
		sm: 'shadow-sm',
		md: 'shadow-md',
		lg: 'shadow-lg',
		xl: 'shadow-lg'
	};

	const roundedClasses = {
		none: '',
		sm: 'radius-2',
		md: 'radius-6',
		lg: 'radius-8',
		xl: 'radius-12',
		full: 'radius-full'
	};

	// Base styles - fractal card owns surface/border/radius
	const baseStyles = 'card relative overflow-hidden';

	// Optimized class computation with caching
	const cardClasses = $derived.by(() => {
		const parts = [
			baseStyles,
			expandable ? '' : paddingClasses[padding],
			shadowClasses[shadow],
			roundedClasses[rounded],
			className
		];

		// Determine if we need hover effects
		const needsHover = hover || clickable || href || onclick;
		const isInteractiveCard = clickable || href || onclick;

		// Interactive styles
		if (isInteractiveCard) {
			parts.push('cursor-pointer');
		}

		// Hover motion dropped: fractal components own their states; card
		// keeps surface/border from .card with no scale/border-color shifts.

		return parts.filter(Boolean).join(' ');
	});

	// Cached computations
	const hasHeader = $derived(!!(title || subtitle || expandable));
	const isInteractive = $derived(!!(href || onclick || clickable));

	// Optimized event handlers
	function handleClick() {
		onclick?.();
	}

	function toggleExpand() {
		isExpanded = !isExpanded;

		// Scroll to card when expanding with slight delay to avoid conflicts
		if (isExpanded && cardElement) {
			scrollToElementSmooth(cardElement, {
				delay: transitionDuration + 100,
				disableScrollDuration: 400
			});
		}
	}

	function handleHeaderClick() {
		if (expandable) {
			toggleExpand();
		} else {
			onclick?.();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return;

		event.preventDefault();

		if (expandable) {
			toggleExpand();
		} else if (onclick) {
			onclick();
		}
	}

	// Pre-computed header classes for expandable cards
	const expandableHeaderClasses = $derived(
		`row ytop xbetween wfull cursor-pointer pad-16 ${headerClass}`
	);

	const staticHeaderClasses = $derived(`marg-bottom-16 ${headerClass}`);

	// Transition duration - optimized for smooth performance
	const transitionDuration = 300;
</script>

{#if href}
	<a
		bind:this={cardElement}
		{href}
		{target}
		class={cardClasses}
		tabindex="0"
		onkeydown={handleKeydown}
	>
		<!-- Content wrapper -->
		<div class="relative">
			{#if hasHeader}
				{#if expandable}
					<button
						type="button"
						class={expandableHeaderClasses}
						onclick={handleHeaderClick}
						onkeydown={handleKeydown}
						aria-expanded={isExpanded}
						aria-controls="card-content"
					>
						<div class="min0 grow pad-right-12">
							{#if title}
								<h3 class="text-bs weight-600 text-tight text-primary">
									{title}
								</h3>
							{/if}
							{#if subtitle}
								<p class="marg-top-4 text-xs weight-500 text-secondary">
									{subtitle}
								</p>
							{/if}
						</div>
						<div class="row ycenter xcenter shrink-0 square-32 radius-8">
							<NavigationIcons
								name="chevron-down"
								size="square-16"
								class="text-muted {isExpanded ? 'rotate-180' : 'rotate-0'}"
							/>
						</div>
					</button>
				{:else}
					<div class={staticHeaderClasses}>
						{#if title}
							<h3 class="text-bs weight-600 text-tight text-primary">
								{title}
							</h3>
						{/if}
						{#if subtitle}
							<p class="marg-top-4 text-xs weight-500 text-secondary">
								{subtitle}
							</p>
						{/if}
					</div>
				{/if}
			{/if}

			{#if expandable}
				{#if isExpanded}
					<div
						id="card-content"
						in:slide={animations.enabled
							? { duration: transitionDuration, easing: quintOut }
							: { duration: 0 }}
						out:slide={animations.enabled
							? { duration: Math.floor(transitionDuration * 0.8), easing: quintOut }
							: { duration: 0 }}
						class="border-top"
					>
						<div class="pad-16 pad-24-desk {bodyClass}">
							{#if children}
								{@render children()}
							{/if}
						</div>
					</div>
				{/if}
			{:else}
				<div class={bodyClass}>
					{#if children}
						{@render children()}
					{/if}
				</div>
			{/if}
		</div>
	</a>
{:else}
	<div
		bind:this={cardElement}
		class={cardClasses}
		role={isInteractive ? 'button' : undefined}
		{...isInteractive ? { tabindex: 0 } : {}}
		onclick={isInteractive ? handleClick : undefined}
		onkeydown={isInteractive ? handleKeydown : undefined}
	>
		<!-- Content wrapper -->
		<div class="relative">
			{#if hasHeader}
				{#if expandable}
					<div
						class={expandableHeaderClasses}
						onclick={handleHeaderClick}
						onkeydown={handleKeydown}
						role="button"
						tabindex="0"
						aria-expanded={isExpanded}
						aria-controls="card-content"
					>
						<div class="min0 grow pad-right-12">
							{#if title}
								<h3 class="text-bs weight-600 text-tight text-primary">
									{title}
								</h3>
							{/if}
							{#if subtitle}
								<p class="marg-top-4 text-xs weight-500 text-secondary">
									{subtitle}
								</p>
							{/if}
						</div>
						<div class="row ycenter xcenter shrink-0 square-32 radius-8">
							<NavigationIcons
								name="chevron-down"
								size="square-16"
								class="text-muted {isExpanded ? 'rotate-180' : 'rotate-0'}"
							/>
						</div>
					</div>
				{:else}
					<div class={staticHeaderClasses}>
						{#if title}
							<h3 class="text-bs weight-600 text-tight text-primary">
								{title}
							</h3>
						{/if}
						{#if subtitle}
							<p class="marg-top-4 text-xs weight-500 text-secondary">
								{subtitle}
							</p>
						{/if}
					</div>
				{/if}
			{/if}

			{#if expandable}
				{#if isExpanded}
					<div
						id="card-content"
						in:slide={animations.enabled
							? { duration: transitionDuration, easing: quintOut }
							: { duration: 0 }}
						out:slide={animations.enabled
							? { duration: Math.floor(transitionDuration * 0.8), easing: quintOut }
							: { duration: 0 }}
						class="border-top"
					>
						<div class="pad-16 pad-24-desk {bodyClass}">
							{#if children}
								{@render children()}
							{/if}
						</div>
					</div>
				{/if}
			{:else}
				<div class={bodyClass}>
					{#if children}
						{@render children()}
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style lang="sass">
:global(.transform-gpu)
	transform: translateZ(0)
	backface-visibility: hidden
</style>
