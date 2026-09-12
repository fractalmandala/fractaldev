import type { ActionReturn } from 'svelte/action';
import { animations } from './animations.svelte';

// Shared intersection observer instance to reduce overhead
let sharedObserver: IntersectionObserver | null = null;
const observedElements = new Set<HTMLElement>();

// Animation data interface
interface AnimationData {
	animate?: () => void;
	animateChildren?: () => void;
	reset?: () => void;
	resetChildren?: () => void;
	hasAnimated: boolean;
	resetOnScroll: boolean;
}

// GPU acceleration utilities
const addGPUAcceleration = (element: HTMLElement) => {
	element.style.willChange = 'transform, opacity';
	element.style.transform = 'translateZ(0)';
	element.style.backfaceVisibility = 'hidden';
};

const removeGPUAcceleration = (element: HTMLElement) => {
	element.style.willChange = 'auto';
};

// Shared observer management
const getSharedObserver = () => {
	if (!sharedObserver) {
		sharedObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const target = entry.target as HTMLElement;
					const animationData = (target as unknown as { _animationData?: AnimationData })
						._animationData;
					if (animationData) {
						// Check if animations are enabled before running
						const shouldAnimate = animations.enabled;

						if (entry.isIntersecting && !animationData.hasAnimated) {
							if (shouldAnimate) {
								requestAnimationFrame(() => {
									if (animationData.animateChildren) {
										animationData.animateChildren();
									} else if (animationData.animate) {
										animationData.animate();
									}
									animationData.hasAnimated = true;
								});
							} else {
								// Skip animation but mark as animated
								animationData.hasAnimated = true;
							}
							if (!animationData.resetOnScroll) {
								sharedObserver?.unobserve(target);
							}
						} else if (
							animationData.resetOnScroll &&
							!entry.isIntersecting &&
							animationData.hasAnimated
						) {
							if (shouldAnimate) {
								requestAnimationFrame(() => {
									if (animationData.resetChildren) {
										animationData.resetChildren();
									} else if (animationData.reset) {
										animationData.reset();
									}
									animationData.hasAnimated = false;
								});
							} else {
								// Just reset the state without animation
								animationData.hasAnimated = false;
							}
						}
					}
				});
			},
			{
				threshold: 0.1,
				rootMargin: '50px 0px -50px 0px'
			}
		);
	}
	return sharedObserver;
};

export interface StaggeredAnimationOptions {
	/**
	 * Animation duration in milliseconds
	 * @default 600
	 */
	duration?: number;

	/**
	 * Delay between each child element in milliseconds
	 * @default 100
	 */
	staggerDelay?: number;

	/**
	 * Starting opacity (0-1)
	 * @default 0
	 */
	fromOpacity?: number;

	/**
	 * Ending opacity (0-1)
	 * @default 1
	 */
	toOpacity?: number;

	/**
	 * Starting Y offset in pixels (negative = up, positive = down)
	 * @default 30
	 */
	fromY?: number;

	/**
	 * Ending Y offset in pixels
	 * @default 0
	 */
	toY?: number;

	/**
	 * Starting X offset in pixels (negative = left, positive = right)
	 * @default 0
	 */
	fromX?: number;

	/**
	 * Ending X offset in pixels
	 * @default 0
	 */
	toX?: number;

	/**
	 * Starting scale (1 = normal size)
	 * @default 0.8
	 */
	fromScale?: number;

	/**
	 * Ending scale (1 = normal size)
	 * @default 1
	 */
	toScale?: number;

	/**
	 * Easing function for the animation
	 * @default 'cubic-bezier(0.4, 0, 0.2, 1)'
	 */
	easing?: string;

	/**
	 * CSS selector to find child elements to animate
	 * @default ':scope > *' (direct children)
	 */
	selector?: string;

	/**
	 * Whether to reset animation when element re-enters viewport
	 * @default false
	 */
	resetOnScroll?: boolean;

	/**
	 * Threshold for intersection observer (0-1)
	 * @default 0.1
	 */
	threshold?: number;
}

/**
 * Creates a staggered animation action that animates child elements
 * with a cascading effect when the container comes into view
 */
export function staggeredAnimation(
	node: HTMLElement,
	options: StaggeredAnimationOptions = {}
): ActionReturn<StaggeredAnimationOptions> {
	const {
		duration = 600,
		staggerDelay = 100,
		fromOpacity = 0,
		toOpacity = 1,
		fromY = 30,
		toY = 0,
		fromX = 0,
		toX = 0,
		fromScale = 0.8,
		toScale = 1,
		easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
		selector = ':scope > *',
		resetOnScroll = false
	} = options;

	let children: HTMLElement[] = [];
	let observer: IntersectionObserver | null = null;
	let hasAnimated = false;
	let animationId: number | null = null;

	// Optimized transform string creation
	const createTransform = (x: number, y: number, scale: number) =>
		`translate3d(${x}px, ${y}px, 0) scale(${scale})`;

	// Cache DOM queries
	const cacheChildren = () => {
		try {
			// Handle different selector types
			const actualSelector = selector === '> *' ? ':scope > *' : selector;
			children = Array.from(node.querySelectorAll(actualSelector)) as HTMLElement[];
		} catch (error) {
			console.warn('Invalid selector in staggeredAnimation:', selector, error);
			// Fallback to direct children
			children = Array.from(node.children) as HTMLElement[];
		}
	};

	// Function to set initial state
	const setInitialState = () => {
		cacheChildren();
		if (children.length === 0) return;

		// Check if animations are enabled
		const shouldAnimate = animations.enabled;

		if (!shouldAnimate) {
			// Skip initial state setup if animations are disabled
			children.forEach((child) => {
				child.style.opacity = toOpacity.toString();
				child.style.transform = createTransform(toX, toY, toScale);
				child.style.transition = 'none';
			});
			return;
		}

		// Batch DOM updates with GPU acceleration
		children.forEach((child) => {
			addGPUAcceleration(child);
			child.style.opacity = fromOpacity.toString();
			child.style.transform = createTransform(fromX, fromY, fromScale);
			child.style.transition = 'none';
		});
		// Force reflow to ensure initial styles are applied
		void node.offsetHeight;
	};

	// Replace multiple setTimeout with single animation loop
	const animateChildren = () => {
		if (children.length === 0) return;

		// Check if animations are enabled
		const shouldAnimate = animations.enabled;

		if (!shouldAnimate) {
			// Skip animation, just set final state
			children.forEach((child) => {
				if (child.parentNode) {
					child.style.transition = 'none';
					child.style.opacity = toOpacity.toString();
					child.style.transform = createTransform(toX, toY, toScale);
				}
			});
			return;
		}

		const startTime = performance.now();

		const animate = (currentTime: number) => {
			children.forEach((child, index) => {
				const elapsedTime = currentTime - startTime;
				const delay = index * staggerDelay;

				if (elapsedTime >= delay && child.parentNode) {
					child.style.transition = `all ${duration}ms ${easing}`;
					child.style.opacity = toOpacity.toString();
					child.style.transform = createTransform(toX, toY, toScale);
				}
			});

			// Continue until all children are animated
			if (currentTime - startTime < (children.length - 1) * staggerDelay + 50) {
				animationId = requestAnimationFrame(animate);
			}
		};

		animationId = requestAnimationFrame(animate);
	};

	// Reset children to initial state
	const resetChildren = () => {
		if (animationId) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}

		// Check if animations are enabled
		const shouldAnimate = animations.enabled;

		children.forEach((child) => {
			// Ensure element is still in DOM
			if (child.parentNode) {
				child.style.transition = 'none';
				if (shouldAnimate) {
					child.style.opacity = fromOpacity.toString();
					child.style.transform = createTransform(fromX, fromY, fromScale);
				} else {
					// If animations disabled, keep current final state
					child.style.opacity = toOpacity.toString();
					child.style.transform = createTransform(toX, toY, toScale);
				}
			}
		});
		// Force reflow
		void node.offsetHeight;
	};

	// Set initial state immediately
	setInitialState();

	if (children.length === 0) return {};

	// Use shared observer for better performance
	observer = getSharedObserver();

	// Store animation data on the node
	(node as unknown as { _animationData: AnimationData })._animationData = {
		animateChildren,
		resetChildren,
		hasAnimated,
		resetOnScroll
	};

	// Start observing with a small delay to ensure DOM is ready
	requestAnimationFrame(() => {
		if (!observedElements.has(node)) {
			observedElements.add(node);
			observer?.observe(node);
		}
	});

	return {
		update(newOptions: StaggeredAnimationOptions = {}) {
			// Cancel any running animation
			if (animationId) {
				cancelAnimationFrame(animationId);
				animationId = null;
			}

			// Update options efficiently instead of recreating
			Object.assign(options, newOptions);
			hasAnimated = false;

			// Restart with new options, respecting animation preferences
			setInitialState();
			if (children.length > 0) {
				// Update animation data
				(node as unknown as { _animationData: AnimationData })._animationData = {
					animateChildren,
					resetChildren,
					hasAnimated,
					resetOnScroll: options.resetOnScroll || false
				};

				// Use shared observer only if animations are enabled
				const shouldAnimate = animations.enabled;
				if (shouldAnimate) {
					observer = getSharedObserver();
					requestAnimationFrame(() => {
						if (!observedElements.has(node)) {
							observedElements.add(node);
							observer?.observe(node);
						}
					});
				}
			}
		},
		destroy() {
			if (animationId) {
				cancelAnimationFrame(animationId);
				animationId = null;
			}

			// Remove from shared observer
			if (observedElements.has(node)) {
				observedElements.delete(node);
				sharedObserver?.unobserve(node);
			}

			// Clean up GPU acceleration
			children.forEach((child) => removeGPUAcceleration(child));

			// Clean up animation data
			delete (node as unknown as { _animationData?: AnimationData })._animationData;
		}
	};
}

/**
 * Predefined animation presets for common use cases
 */
export const staggerPresets = {
	/**
	 * Fade in from bottom
	 */
	fadeInUp: () => ({
		duration: 600,
		fromOpacity: 0,
		fromY: 30,
		staggerDelay: 100
	}),

	/**
	 * Fade in from top
	 */
	fadeInDown: () => ({
		duration: 600,
		fromOpacity: 0,
		fromY: -30,
		staggerDelay: 100
	}),

	/**
	 * Fade in from left
	 */
	fadeInLeft: () => ({
		duration: 600,
		fromOpacity: 0,
		fromX: -30,
		staggerDelay: 100
	}),

	/**
	 * Fade in from right
	 */
	fadeInRight: () => ({
		duration: 600,
		fromOpacity: 0,
		fromX: 30,
		staggerDelay: 100
	}),

	/**
	 * Scale in from center
	 */
	scaleIn: () => ({
		duration: 500,
		fromOpacity: 0,
		fromScale: 0.8,
		staggerDelay: 80
	}),

	/**
	 * Slide in from bottom with scale
	 */
	slideUpScale: () => ({
		duration: 700,
		fromOpacity: 0,
		fromY: 40,
		fromScale: 0.9,
		staggerDelay: 120
	}),

	/**
	 * Quick fade in for cards
	 */
	quickFade: () => ({
		duration: 400,
		fromOpacity: 0,
		fromY: 20,
		staggerDelay: 50
	}),

	/**
	 * Slow dramatic entrance
	 */
	dramatic: () => ({
		duration: 1000,
		fromOpacity: 0,
		fromY: 60,
		fromScale: 0.7,
		staggerDelay: 150,
		easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
	})
};

/**
 * Action for animating a single element (not children)
 */
export function singleElementAnimation(
	node: HTMLElement,
	options: Omit<StaggeredAnimationOptions, 'selector' | 'staggerDelay'> = {}
): ActionReturn<Omit<StaggeredAnimationOptions, 'selector' | 'staggerDelay'>> {
	const {
		duration = 600,
		fromOpacity = 0,
		toOpacity = 1,
		fromY = 30,
		toY = 0,
		fromX = 0,
		toX = 0,
		fromScale = 0.8,
		toScale = 1,
		easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
		resetOnScroll = false
	} = options;

	// Optimized transform string creation
	const createTransform = (x: number, y: number, scale: number) =>
		`translate3d(${x}px, ${y}px, 0) scale(${scale})`;

	// Check if animations are enabled
	const shouldAnimate = animations.enabled;

	if (!shouldAnimate) {
		// Skip initial state setup if animations are disabled
		node.style.opacity = toOpacity.toString();
		node.style.transform = createTransform(toX, toY, toScale);
		node.style.transition = 'none';
	} else {
		// Set initial state with GPU acceleration
		addGPUAcceleration(node);
		node.style.opacity = fromOpacity.toString();
		node.style.transform = createTransform(fromX, fromY, fromScale);
		node.style.transition = 'none';

		// Force reflow
		void node.offsetHeight;
	}

	let hasAnimated = false;
	let observer: IntersectionObserver | null = null;

	const animate = () => {
		// Check if animations are enabled
		const shouldAnimate = animations.enabled;

		// Ensure element is still in DOM
		if (node.parentNode) {
			if (shouldAnimate) {
				node.style.transition = `all ${duration}ms ${easing}`;
				node.style.opacity = toOpacity.toString();
				node.style.transform = createTransform(toX, toY, toScale);
			} else {
				// Skip animation, just set final state
				node.style.transition = 'none';
				node.style.opacity = toOpacity.toString();
				node.style.transform = createTransform(toX, toY, toScale);
			}
		}
	};

	const reset = () => {
		// Check if animations are enabled
		const shouldAnimate = animations.enabled;

		// Ensure element is still in DOM
		if (node.parentNode) {
			node.style.transition = 'none';
			if (shouldAnimate) {
				node.style.opacity = fromOpacity.toString();
				node.style.transform = createTransform(fromX, fromY, fromScale);
			} else {
				// If animations disabled, keep current final state
				node.style.opacity = toOpacity.toString();
				node.style.transform = createTransform(toX, toY, toScale);
			}
			// Force reflow
			void node.offsetHeight;
		}
	};

	// Use shared observer for better performance
	observer = getSharedObserver();

	// Store animation data on the node
	(node as unknown as { _animationData: AnimationData })._animationData = {
		animate,
		reset,
		hasAnimated,
		resetOnScroll
	};

	// Start observing
	requestAnimationFrame(() => {
		if (!observedElements.has(node)) {
			observedElements.add(node);
			observer?.observe(node);
		}
	});

	return {
		update(newOptions: Omit<StaggeredAnimationOptions, 'selector' | 'staggerDelay'> = {}) {
			// Update options efficiently
			Object.assign(options, newOptions);
			hasAnimated = false;

			// Check if animations are enabled
			const shouldAnimate = animations.enabled;

			// Reset to initial state with new options
			if (shouldAnimate) {
				node.style.opacity = fromOpacity.toString();
				node.style.transform = createTransform(fromX, fromY, fromScale);
			} else {
				node.style.opacity = toOpacity.toString();
				node.style.transform = createTransform(toX, toY, toScale);
			}
			node.style.transition = 'none';
			void node.offsetHeight;

			// Update animation data
			(node as unknown as { _animationData: AnimationData })._animationData = {
				animate,
				reset,
				hasAnimated,
				resetOnScroll: options.resetOnScroll || false
			};

			// Use shared observer only if animations are enabled
			if (shouldAnimate) {
				observer = getSharedObserver();
				requestAnimationFrame(() => {
					if (!observedElements.has(node)) {
						observedElements.add(node);
						observer?.observe(node);
					}
				});
			}
		},
		destroy() {
			// Remove from shared observer
			if (observedElements.has(node)) {
				observedElements.delete(node);
				sharedObserver?.unobserve(node);
			}

			// Clean up GPU acceleration
			removeGPUAcceleration(node);

			// Clean up animation data
			delete (node as unknown as { _animationData?: AnimationData })._animationData;
		}
	};
}
