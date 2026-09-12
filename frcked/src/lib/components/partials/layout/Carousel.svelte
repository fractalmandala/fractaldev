<script lang="ts">
	let {
		children,
		showArrows = true,
		showDots = true,
		class: className = '',
		autoplay = false,
		autoplayInterval = 3000,
		totalItems,
		itemsVisible = 3,
		marquee = false,
		marqueeSpeed = 30
	}: {
		children: import('svelte').Snippet;
		showArrows?: boolean;
		showDots?: boolean;
		class?: string;
		autoplay?: boolean;
		autoplayInterval?: number;
		totalItems: number;
		itemsVisible?: number;
		marquee?: boolean;
		marqueeSpeed?: number;
	} = $props();

	let currentIndex = $state(0);
	let autoplayTimer: number | null = null;

	// Simple marquee references
	let marqueeContainer: HTMLDivElement;
	let marqueeTrack: HTMLDivElement;

	let isMobile = $state(false);
	let resizeTimeout: number | null = null;

	$effect(() => {
		const checkMobile = () => {
			if (resizeTimeout) clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				const newIsMobile = window.innerWidth <= 767;
				if (newIsMobile !== isMobile) {
					isMobile = newIsMobile;
				}
			}, 100);
		};

		// Initial check
		isMobile = window.innerWidth <= 767;
		window.addEventListener('resize', checkMobile, { passive: true });

		return () => {
			window.removeEventListener('resize', checkMobile);
			if (resizeTimeout) clearTimeout(resizeTimeout);
		};
	});

	// Memoize calculations to prevent unnecessary recalculations
	const effectiveItemsVisible = $derived(isMobile ? 1 : itemsVisible);
	const totalPages = $derived(Math.ceil(totalItems / effectiveItemsVisible));
	const maxIndex = $derived(Math.max(0, totalPages - 1));
	const canGoPrevious = $derived(currentIndex > 0);
	const canGoNext = $derived(currentIndex < maxIndex);
	const shouldShowArrows = $derived(showArrows && totalPages > 1 && !marquee);
	const shouldShowDots = $derived(showDots && totalPages > 1 && !marquee);

	// Pre-calculate transform to avoid recalculation on every render
	const transformOffset = $derived(marquee ? 'none' : `translateX(-${currentIndex * 100}%)`);

	function previous() {
		if (canGoPrevious) {
			currentIndex--;
		}
	}

	function next() {
		if (canGoNext) {
			currentIndex++;
		} else if (autoplay && totalPages > 1) {
			currentIndex = 0;
		}
	}

	function goToPage(pageIndex: number) {
		if (pageIndex >= 0 && pageIndex <= maxIndex) {
			currentIndex = pageIndex;
		}
	}

	// Optimized autoplay management
	function startAutoplay() {
		if (!autoplay || totalPages <= 1) return;
		stopAutoplay();
		autoplayTimer = setInterval(() => next(), autoplayInterval) as unknown as number;
	}

	function stopAutoplay() {
		if (autoplayTimer) {
			clearInterval(autoplayTimer);
			autoplayTimer = null;
		}
	}

	function pauseAutoplay() {
		stopAutoplay();
		if (autoplay) {
			setTimeout(() => startAutoplay(), 2000);
		}
	}

	// Optimized touch handling with constant threshold

	let touchStartX = 0;
	const SWIPE_THRESHOLD = 50;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		const touchEndX = e.changedTouches[0].screenX;
		const diff = touchStartX - touchEndX;
		if (Math.abs(diff) > SWIPE_THRESHOLD) {
			if (diff > 0) next();
			else previous();
		}
	}

	// Pure CSS marquee - no JavaScript animation needed!

	// Initialize autoplay with cleanup
	$effect(() => {
		if (autoplay && totalPages > 1 && !marquee) {
			const timeoutId = setTimeout(() => startAutoplay(), 500);
			return () => {
				clearTimeout(timeoutId);
				stopAutoplay();
			};
		}
		return () => stopAutoplay();
	});
</script>

<div
	class="carousel {className}"
	class:mobile={isMobile}
	class:marquee-mode={marquee}
	style="--items-visible: {effectiveItemsVisible}; --marquee-speed: {marqueeSpeed}s"
>
	<div class="carousel-container" bind:this={marqueeContainer}>
		<div class="carousel-wrapper pad-16">
			<div
				bind:this={marqueeTrack}
				class="carousel-track pad-y-16"
				class:marquee-track={marquee}
				style="transform: {marquee
					? 'none'
					: transformOffset}; will-change: transform; backface-visibility: hidden;"
				ontouchstart={!marquee ? handleTouchStart : undefined}
				ontouchend={!marquee ? handleTouchEnd : undefined}
				onmouseenter={() => {
					if (!marquee && autoplay) {
						stopAutoplay();
					}
				}}
				onmouseleave={() => {
					if (!marquee && autoplay) {
						startAutoplay();
					}
				}}
				role="region"
				aria-label="Carousel"
			>
				{#if marquee}
					<!-- Optimized content duplication for seamless CSS animation -->
					<div class="marquee-content-original">
						{@render children()}
					</div>
					<div class="marquee-content-duplicate">
						{@render children()}
					</div>
				{:else}
					{@render children()}
				{/if}
			</div>
		</div>

		<!-- Navigation Arrows -->
		{#if shouldShowArrows}
			<button
				class="carousel-arrow carousel-arrow-left"
				onclick={() => {
					previous();
					pauseAutoplay();
				}}
				disabled={!canGoPrevious}
				aria-label="Previous"
			>
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>

			<button
				class="carousel-arrow carousel-arrow-right"
				onclick={() => {
					next();
					pauseAutoplay();
				}}
				disabled={!canGoNext && !autoplay}
				aria-label="Next"
			>
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Dots -->
	{#if shouldShowDots}
		<div class="carousel-dots">
			{#each Array.from({ length: totalPages }, (_, i) => i) as pageIndex (pageIndex)}
				<button
					class="carousel-dot"
					class:active={pageIndex === currentIndex}
					onclick={() => {
						goToPage(pageIndex);
						pauseAutoplay();
					}}
					aria-label="Go to page {pageIndex + 1}"
				></button>
			{/each}
		</div>
	{/if}
</div>

<style lang="sass">
.carousel
	position: relative
	width: 100%

.carousel-container
	position: relative

.carousel-wrapper
	overflow: hidden
	border-radius: 0.5rem
	mask: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)
	-webkit-mask: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)
	transform: translateZ(0)
	contain: layout style paint

.carousel-track
	display: flex
	gap: 1rem
	transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)
	will-change: transform
	transform-style: preserve-3d
	contain: layout style

.marquee-mode
	.carousel-wrapper
		mask: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)
		-webkit-mask: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)
		will-change: contents

.marquee-track
	transition: none
	width: max-content
	animation: marquee var(--marquee-speed, 30s) linear infinite
	will-change: transform
	transform-style: preserve-3d
	backface-visibility: hidden
	transform: translateZ(0)
	-webkit-font-smoothing: subpixel-antialiased
	contain: layout style paint

	&:hover
		animation-play-state: paused

@keyframes marquee
	0%
		transform: translate3d(0, 0, 0)
	100%
		transform: translate3d(-50%, 0, 0)

:global(.carousel-item)
	flex: 0 0 calc(100% / var(--items-visible, 3) - 1rem * (var(--items-visible, 3) - 1) / var(--items-visible, 3))
	min-width: 0
	will-change: transform
	backface-visibility: hidden

.marquee-content-original,
.marquee-content-duplicate
	display: flex
	gap: 1rem
	flex-shrink: 0

:global(.marquee-mode .carousel-item)
	flex: 0 0 auto
	width: auto
	min-width: auto
	will-change: transform
	backface-visibility: hidden
	transform: translateZ(0)
	-webkit-font-smoothing: antialiased

.carousel-arrow
	position: absolute
	top: 50%
	transform: translateY(-50%)
	z-index: 10
	display: flex
	align-items: center
	justify-content: center
	width: 2.5rem
	height: 2.5rem
	background: white
	border: none
	border-radius: 50%
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
	cursor: pointer
	transition: all 0.2s ease

	svg
		width: 1.25rem
		height: 1.25rem
		color: rgb(55, 65, 81)

	&:hover:not(:disabled)
		transform: translateY(-50%) scale(1.1)
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2)

	&:disabled
		opacity: 0.4
		cursor: not-allowed
		transform: translateY(-50%) scale(0.9)

.carousel-arrow-left
	left: 1rem

.carousel-arrow-right
	right: 1rem

:global([data-theme='dark'])
	.carousel-arrow
		background: rgb(31, 41, 55)
		border: 1px solid rgb(55, 65, 81)

		svg
			color: rgb(209, 213, 219)

	.carousel-dot
		background: rgb(75, 85, 99)

		&:hover
			background: rgb(107, 114, 128)

		&.active
			background: rgb(59, 130, 246)

.carousel-dots
	display: flex
	justify-content: center
	gap: 0.5rem
	margin-top: 1.5rem

.carousel-dot
	width: 0.5rem
	height: 0.5rem
	border: none
	border-radius: 50%
	background: rgb(209, 213, 219)
	cursor: pointer
	transition: all 0.3s ease

	&:hover
		background: rgb(156, 163, 175)
		transform: scale(1.2)

	&.active
		width: 2rem
		border-radius: 0.25rem
		background: rgb(59, 130, 246)

@media (max-width: 767px)
	.carousel-arrow
		width: 2rem
		height: 2rem

		svg
			width: 1rem
			height: 1rem

	.carousel-arrow-left
		left: 0.5rem

	.carousel-arrow-right
		right: 0.5rem

	:global(.carousel-item)
		flex: 0 0 calc(100% - 0rem)

	.carousel-track
		gap: 0rem
</style>
