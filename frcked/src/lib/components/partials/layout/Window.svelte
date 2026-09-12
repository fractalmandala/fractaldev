<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import { browser } from '$app/environment';

	// Props
	let {
		title = 'Window',
		open = $bindable(true),
		closable = true,
		resizable = true,
		draggable = true,
		width = 400,
		height = 300,
		minWidth = 200,
		minHeight = 150,
		x = 100,
		y = 100,
		zIndex = 1000,
		boundary = 'viewport', // 'viewport' | 'parent' | 'manual'
		boundaryElement = null, // HTMLElement for manual boundary
		boundaries = null, // { top, right, bottom, left } for manual boundaries
		class: className = '',
		headerClass = '',
		bodyClass = '',
		onClose = () => {},
		onResize = () => {},
		onMove = () => {},
		children
	}: {
		title?: string;
		open?: boolean;
		closable?: boolean;
		resizable?: boolean;
		draggable?: boolean;
		width?: number;
		height?: number;
		minWidth?: number;
		minHeight?: number;
		x?: number;
		y?: number;
		zIndex?: number;
		boundary?: 'viewport' | 'parent' | 'manual';
		boundaryElement?: HTMLElement | null;
		boundaries?: { top: number; right: number; bottom: number; left: number } | null;
		class?: string;
		headerClass?: string;
		bodyClass?: string;
		onClose?: () => void;
		onResize?: (size: { width: number; height: number }) => void;
		onMove?: (position: { x: number; y: number }) => void;
		children?: import('svelte').Snippet;
	} = $props();

	// Reactive state
	let windowElement = $state<HTMLElement>();
	let headerElement = $state<HTMLElement>();
	let resizeHandle = $state<HTMLElement>();
	let isDragging = $state(false);
	let isResizing = $state(false);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let windowStartX = $state(untrack(() => x));
	let windowStartY = $state(untrack(() => y));
	let resizeStartWidth = $state(untrack(() => width));
	let resizeStartHeight = $state(untrack(() => height));
	let resizeStartX = $state(0);
	let resizeStartY = $state(0);
	let isMobile = $state(false);

	// Grid snapping configuration
	const GRID_SIZE = 36; // 36px grid

	// Check if mobile on mount and resize
	$effect(() => {
		if (browser) {
			const checkMobile = () => {
				isMobile = window.innerWidth <= 768;
			};

			checkMobile();
			window.addEventListener('resize', checkMobile);
			return () => window.removeEventListener('resize', checkMobile);
		}
	});

	// Calculate boundary constraints
	let currentBoundaryArea = $state({ width: 0, height: 0, top: 0, left: 0 });

	// Update boundary area when needed
	$effect(() => {
		if (!browser) {
			currentBoundaryArea = { width: 0, height: 0, top: 0, left: 0 };
			return;
		}

		if (boundary === 'viewport') {
			// Full viewport
			currentBoundaryArea = {
				width: window.innerWidth,
				height: window.innerHeight,
				top: 0,
				left: 0
			};
		} else if (boundary === 'parent' && windowElement?.parentElement) {
			// Parent content-clamp - use relative positioning within parent
			const parent = windowElement.parentElement;
			const rect = parent.getBoundingClientRect();

			currentBoundaryArea = {
				width: rect.width,
				height: rect.height,
				top: 0, // Relative to parent
				left: 0
			};

			// Ensure parent has relative positioning
			if (parent && window.getComputedStyle(parent).position === 'static') {
				parent.style.position = 'relative';
			}
		} else if (boundary === 'manual') {
			if (boundaries) {
				// Manual coordinates
				currentBoundaryArea = {
					width: boundaries.right - boundaries.left,
					height: boundaries.bottom - boundaries.top,
					top: boundaries.top,
					left: boundaries.left
				};
			} else if (boundaryElement) {
				// Manual element
				const rect = boundaryElement.getBoundingClientRect();
				currentBoundaryArea = {
					width: rect.width,
					height: rect.height,
					top: rect.top,
					left: rect.left
				};
			}
		} else {
			// Fallback to full viewport
			currentBoundaryArea = {
				width: window.innerWidth,
				height: window.innerHeight,
				top: 0,
				left: 0
			};
		}
	});

	// Update parent boundaries when window element changes or on window resize
	$effect(() => {
		if (boundary === 'parent' && browser) {
			const updateParentBounds = () => {
				if (windowElement?.parentElement) {
					const parent = windowElement.parentElement;
					const rect = parent.getBoundingClientRect();
					currentBoundaryArea = {
						width: rect.width,
						height: rect.height,
						top: 0, // Use relative positioning to parent
						left: 0
					};
				}
			};

			updateParentBounds();

			// Also update on window resize in case parent changes
			const handleResize = () => {
				updateParentBounds();
			};

			window.addEventListener('resize', handleResize);
			return () => window.removeEventListener('resize', handleResize);
		}
	});

	// Opacity state
	let isTransparent = $state(false);

	// Grid snapping function
	function snapToGrid(value: number): number {
		return Math.round(value / GRID_SIZE) * GRID_SIZE;
	}

	// Constrain position to boundary area
	function constrainPosition(posX: number, posY: number): { x: number; y: number } {
		if (!browser) return { x: posX, y: posY };

		const area = currentBoundaryArea;
		let maxX, maxY;

		if (boundary === 'parent') {
			// For parent boundary, constrain relative to parent
			maxX = Math.max(0, currentBoundaryArea.width - width);
			maxY = Math.max(0, currentBoundaryArea.height - height);
		} else {
			// For viewport and manual boundaries
			maxX = Math.max(area.left, area.left + area.width - width);
			maxY = Math.max(area.top, area.top + area.height - height);
		}

		return {
			x:
				boundary === 'parent'
					? Math.max(0, Math.min(posX, maxX))
					: Math.max(area.left, Math.min(posX, maxX)),
			y:
				boundary === 'parent'
					? Math.max(0, Math.min(posY, maxY))
					: Math.max(area.top, Math.min(posY, maxY))
		};
	}

	// Dragging functions
	function handleMouseDown(e: MouseEvent) {
		if (!draggable) return;

		isDragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		windowStartX = x;
		windowStartY = y;

		e.preventDefault();
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;

		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		let newX = windowStartX + deltaX;
		let newY = windowStartY + deltaY;

		// Apply grid snapping
		newX = snapToGrid(newX);
		newY = snapToGrid(newY);

		// Constrain to boundary area
		const constrained = constrainPosition(newX, newY);
		x = constrained.x;
		y = constrained.y;

		onMove({ x, y });
	}

	function handleMouseUp() {
		isDragging = false;
	}

	// Resizing functions
	function handleResizeMouseDown(e: MouseEvent) {
		if (!resizable) return;

		isResizing = true;
		resizeStartWidth = width;
		resizeStartHeight = height;
		resizeStartX = e.clientX;
		resizeStartY = e.clientY;

		e.preventDefault();
		e.stopPropagation();
	}

	function handleResizeMouseMove(e: MouseEvent) {
		if (!isResizing) return;

		const deltaX = e.clientX - resizeStartX;
		const deltaY = e.clientY - resizeStartY;

		width = Math.max(minWidth, resizeStartWidth + deltaX);
		height = Math.max(minHeight, resizeStartHeight + deltaY);

		onResize({ width, height });
	}

	function handleResizeMouseUp() {
		isResizing = false;
	}

	// Set up global event listeners
	onMount(() => {
		if (browser) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.addEventListener('mousemove', handleResizeMouseMove);
			document.addEventListener('mouseup', handleResizeMouseUp);
		}
	});

	// Clean up event listeners
	onDestroy(() => {
		if (browser) {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('mousemove', handleResizeMouseMove);
			document.removeEventListener('mouseup', handleResizeMouseUp);
		}
	});
</script>

{#if open && !isMobile}
	<div
		bind:this={windowElement}
		class="{boundary === 'parent' ? 'absolute' : 'fixed'} card overflow-hidden {className}"
		style:left={`${x}px`}
		style:top={`${y}px`}
		style:width={`${width}px`}
		style:height={`${height}px`}
		style:z-index={zIndex}
		style:cursor={isDragging ? 'grabbing' : 'default'}
		style:background={isTransparent ? 'transparent' : ''}
	>
		<!-- Header -->
		<div
			bind:this={headerElement}
			role="button"
			tabindex="0"
			class="row ycenter xbetween border-bottom surface pad-x-12 pad-y-8 {headerClass}"
			class:cursor-grab={draggable}
			class:cursor-grabbing={isDragging}
			class:select-none={draggable}
			style:opacity={1}
			onmousedown={handleMouseDown}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					handleMouseDown(e as unknown as MouseEvent);
				}
			}}
		>
			<h3 class="truncate text-sm weight-500 text-primary">{title}</h3>
			<div class="row ycenter gap-16">
				<!-- Opacity Toggle -->
				<button
					type="button"
					class="button blank radius-md pad-4 text-muted"
					onclick={() => (isTransparent = !isTransparent)}
					aria-label={isTransparent ? 'Make window opaque' : 'Make window transparent'}
					title={isTransparent ? 'Make window opaque' : 'Make window transparent'}
				>
					<svg class="square-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
						/>
					</svg>
				</button>

				{#if closable}
					<button
						type="button"
						class="button blank radius-md pad-4 text-muted"
						onclick={() => {
							onClose();
							open = false;
						}}
						aria-label="Close window"
						title="Close window"
					>
						<svg class="square-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<!-- Content -->
		<div class="hfull scroll-y {bodyClass}">
			{#if children}
				{@render children()}
			{/if}
		</div>

		<!-- Resize Handle -->
		{#if resizable}
			<div
				bind:this={resizeHandle}
				role="button"
				tabindex="0"
				class="absolute right-0 bottom-0 square-16 cursor-nwse-resize"
				onmousedown={handleResizeMouseDown}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						handleResizeMouseDown(e as unknown as MouseEvent);
					}
				}}
			>
				<svg
					class="hfull wfull text-muted"
					fill="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						d="M22 22H20V20H22V22M22 18H20V16H22V18M18 22H16V20H18V22M18 18H16V16H18V18M14 22H12V20H14V22M22 14H20V12H22V14Z"
					/>
				</svg>
			</div>
		{/if}
	</div>
{/if}

<style lang="sass">
:global(.select-none)
	user-select: none
	-webkit-user-select: none
	-moz-user-select: none
	-ms-user-select: none

:global(.cursor-grab)
	cursor: grab

:global(.cursor-grabbing)
	cursor: grabbing
</style>
