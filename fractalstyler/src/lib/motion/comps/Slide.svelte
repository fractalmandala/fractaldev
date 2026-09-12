<script lang="ts">
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';
	import {
		areMotionAnimationsDisabled,
		revealMotionElement
	} from '$lib/motion/motionPreference.svelte';
	import type { SlideDirection } from '$lib/motion/types';
	import { directionToOffset } from '$lib/motion/transitions/slide';

	interface Props {
		/** Direction the element slides from. Default: 'down' */
		direction?: SlideDirection;
		/** Distance in pixels to slide. Default: 160 */
		distance?: number;
		/** Animation duration in ms. Default: 600 */
		duration?: number;
		/** Delay before the animation starts, in ms. Default: 0 */
		delay?: number;
		/** Stagger between targets in ms. Default: 120 */
		stagger?: number;
		/** Easing curve or GSAP ease name. Default: 'power3.out' */
		ease?: string;
		/** Whether to fade opacity during the slide. Default: true */
		opacity?: boolean;
		/** Scroll trigger start position (e.g. 'top 90%'). Default: 'top 90%' */
		start?: string;
		/** Scroll trigger end position. Default: 'bottom 40%' */
		end?: string;
		/** Scroll scrub: true to link directly to scroll position, or false for in-view trigger. Default: false */
		scrub?: boolean | number;
		/** When true, re-arm and reverse when scrolling out. Default: true */
		replay?: boolean;
		/** Optional targets inside the wrapper. Defaults to direct children or .slide-item. */
		targetSelector?: string;
		/** Optional scroll container selector or element. Defaults to window. */
		scrollElement?: string | HTMLElement | null;
		/** Wrapper display mode. Default: 'block'. */
		display?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		direction = 'down',
		distance = 160,
		duration = 600,
		delay = 0,
		stagger = 120,
		ease = 'power3.out',
		opacity = true,
		start = 'top 90%',
		end = 'bottom 40%',
		scrub = false,
		replay = true,
		targetSelector = '.slide-item',
		scrollElement,
		display = 'block',
		children,
		...rest
	}: Props = $props();

	let wrapperRef = $state<HTMLElement | null>(null);

	const attachWrapperRef = (node: HTMLElement) => {
		wrapperRef = node;
		return () => {
			if (wrapperRef === node) wrapperRef = null;
		};
	};

	function resolveEase(name: string): string {
		switch (name) {
			case 'power1.out': return 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
			case 'power2.out': return 'cubic-bezier(0.25, 1, 0.5, 1)';
			case 'power3.out': return 'cubic-bezier(0.215, 0.61, 0.355, 1)';
			case 'power4.out': return 'cubic-bezier(0.16, 1, 0.3, 1)';
			case 'expo.out': return 'cubic-bezier(0.19, 1, 0.22, 1)';
			case 'circ.out': return 'cubic-bezier(0.075, 0.82, 0.165, 1)';
			case 'back.out': return 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
			case 'linear': return 'linear';
			default: return name;
		}
	}

	function parsePercent(str: string, fallback: number): number {
		const match = str.match(/(\d+)%/);
		return match ? Number(match[1]) : fallback;
	}

	function getTargets(node: HTMLElement): HTMLElement[] {
		const selected = targetSelector
			? Array.from(node.querySelectorAll<HTMLElement>(targetSelector))
			: Array.from(node.children).filter(
					(child): child is HTMLElement => child instanceof HTMLElement
				);

		if (selected.length > 0) return selected;
		const fallback = node.firstElementChild;
		return fallback instanceof HTMLElement ? [fallback] : [node];
	}

	function clearTargets(targets: HTMLElement[]) {
		targets.forEach((target) => {
			revealMotionElement(target);
			target.style.transition = '';
			target.style.transform = '';
			target.style.opacity = '';
			target.style.willChange = '';
		});
	}

	$effect(() => {
		if (!browser || !wrapperRef) return;
		const node = wrapperRef;
		const targets = getTargets(node);

		if (areMotionAnimationsDisabled()) {
			clearTargets(targets);
			return;
		}

		const { x, y } = directionToOffset(direction, distance);
		const cssEase = resolveEase(ease);
		const startPct = parsePercent(start, 90);
		const endPct = parsePercent(end, 40);
		const bottomMargin = -(100 - startPct);
		const rootMargin = `0px 0px ${bottomMargin}% 0px`;

		const scroller =
			typeof scrollElement === 'string'
				? (document.querySelector<HTMLElement>(scrollElement) ?? window)
				: scrollElement instanceof HTMLElement
					? scrollElement
					: window;

		const setHidden = () => {
			targets.forEach((target) => {
				target.style.transition = 'none';
				target.style.transform = `translate3d(${x}px, ${y}px, 0)`;
				if (opacity) target.style.opacity = '0';
				target.style.willChange = 'transform, opacity';
			});
		};

		const setVisible = () => {
			targets.forEach((target, i) => {
				const itemDelay = delay + i * stagger;
				target.style.transition = `transform ${duration}ms ${cssEase} ${itemDelay}ms, opacity ${duration}ms ${cssEase} ${itemDelay}ms`;
				target.style.transform = 'translate3d(0, 0, 0)';
				if (opacity) target.style.opacity = '1';
			});
		};

		let rafId = 0;
		const onScrollScrub = () => {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				const isWin = scroller === window;
				const vh = isWin ? window.innerHeight : (scroller as HTMLElement).clientHeight;
				const rect = node.getBoundingClientRect();
				const top = isWin
					? rect.top
					: rect.top - (scroller as HTMLElement).getBoundingClientRect().top;

				const startY = vh * (startPct / 100);
				const endY = vh * (endPct / 100);
				const totalRange = startY - endY || 1;
				const progress = Math.max(0, Math.min(1, (startY - top) / totalRange));

				targets.forEach((target, i) => {
					const staggerFrac = targets.length > 1 ? (i * (stagger / 1000)) / (duration / 1000 || 1) : 0;
					const targetProg = Math.max(0, Math.min(1, (progress - staggerFrac) / (1 - staggerFrac || 1)));
					const curX = x * (1 - targetProg);
					const curY = y * (1 - targetProg);
					target.style.transition = 'none';
					target.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
					if (opacity) target.style.opacity = String(targetProg);
				});
			});
		};

		setHidden();

		let isListeningScroll = false;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						if (scrub) {
							if (!isListeningScroll) {
								scroller.addEventListener('scroll', onScrollScrub, { passive: true });
								isListeningScroll = true;
							}
							onScrollScrub();
						} else {
							setVisible();
							if (!replay) observer.disconnect();
						}
					} else if (replay) {
						if (scrub && isListeningScroll) {
							scroller.removeEventListener('scroll', onScrollScrub);
							isListeningScroll = false;
						}
						setHidden();
					}
				}
			},
			{ rootMargin, threshold: 0 }
		);

		observer.observe(node);

		return () => {
			observer.disconnect();
			cancelAnimationFrame(rafId);
			if (isListeningScroll) {
				scroller.removeEventListener('scroll', onScrollScrub);
			}
			clearTargets(targets);
		};
	});
</script>

<div {...rest} style:display={display} {@attach attachWrapperRef}>
	{@render children()}
</div>
