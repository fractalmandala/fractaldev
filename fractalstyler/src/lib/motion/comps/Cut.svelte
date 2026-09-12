<script lang="ts">
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';
	import {
		areMotionAnimationsDisabled,
		revealMotionElement
	} from '$lib/motion/motionPreference.svelte';
	import type { RevealDirection } from '$lib/motion/transitions/reveal.js';

	interface Props {
		/** Direction the cut reveal sweeps from. Default: 'up' */
		direction?: RevealDirection;
		/**
		 * For direction="diagonal" only.
		 * Controls how steep the leading edge is, as % of element width.
		 * Higher = shallower angle. Default: 18
		 */
		slant?: number;
		/** Fade opacity during the reveal. Default: false */
		opacity?: boolean;
		/** Duration in ms for timing calculations. Default: 350 */
		duration?: number;
		/** Delay before animation starts in ms. Default: 0 */
		delay?: number;
		/** Stagger between targets in ms. Default: 140 */
		stagger?: number;
		/** Easing curve name. Default: 'power4.out' */
		ease?: string;
		/** Scroll start position (e.g. 'top 88%'). Default: 'top 88%' */
		start?: string;
		/** Scroll end position (e.g. 'bottom 35%'). Default: 'bottom 35%' */
		end?: string;
		/** Scroll scrub: true to link directly to scroll position, or number for damping. Default: true */
		scrub?: boolean | number;
		/** Optional targets inside the wrapper. Defaults to direct children. */
		targetSelector?: string;
		/** Optional scroll container selector or element. Defaults to window. */
		scrollElement?: string | HTMLElement | null;
		/** Wrapper display mode. Default: 'block' */
		display?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		direction = 'up',
		slant = 0,
		opacity = false,
		duration = 350,
		delay = 0,
		stagger = 140,
		ease = 'power4.out',
		start = 'top 88%',
		end = 'bottom 35%',
		scrub = true,
		targetSelector = '.cut-item',
		scrollElement,
		display = 'block',
		children,
		...rest
	}: Props = $props();

	let wrapperRef = $state<HTMLElement | null>(null);

	function parseAnchor(anchorStr: string, defaultElem: 'top' | 'bottom', defaultPct: number) {
		const parts = anchorStr.trim().split(/\s+/);
		let elem: 'top' | 'bottom' = defaultElem;
		let pct = defaultPct;
		if (parts[0] === 'top' || parts[0] === 'bottom') {
			elem = parts[0];
		}
		if (parts.length > 1) {
			const second = parts[1];
			if (second === 'top') pct = 0;
			else if (second === 'center') pct = 50;
			else if (second === 'bottom') pct = 100;
			else {
				const m = second.match(/(\d+)%/);
				if (m) pct = Number(m[1]);
			}
		}
		return { elem, pct };
	}

	function calcProgress(
		refEl: HTMLElement,
		scroller: Window | HTMLElement,
		startAnchor: { elem: 'top' | 'bottom'; pct: number },
		endAnchor: { elem: 'top' | 'bottom'; pct: number }
	): number {
		const isWin = scroller === window;
		const vh = isWin ? window.innerHeight : (scroller as HTMLElement).clientHeight;
		const rect = refEl.getBoundingClientRect();
		const scrollerTop = isWin ? 0 : (scroller as HTMLElement).getBoundingClientRect().top;
		const top = rect.top - scrollerTop;
		const height = rect.height || 1;

		const startY = vh * (startAnchor.pct / 100) - (startAnchor.elem === 'bottom' ? height : 0);
		const endY = vh * (endAnchor.pct / 100) - (endAnchor.elem === 'bottom' ? height : 0);

		const raw = (startY - top) / (startY - endY || 1);
		return Math.max(0, Math.min(1, raw));
	}

	function applyEase(p: number, easeName: string): number {
		switch (easeName) {
			case 'power1.out': return 1 - Math.pow(1 - p, 2);
			case 'power2.out': return 1 - Math.pow(1 - p, 3);
			case 'power3.out': return 1 - Math.pow(1 - p, 4);
			case 'power4.out': return 1 - Math.pow(1 - p, 5);
			case 'expo.out': return p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
			case 'linear': return p;
			default: return 1 - Math.pow(1 - p, 4);
		}
	}

	function getClipPath(dir: RevealDirection, s: number, t: number): string {
		const u = 1 - t;
		switch (dir) {
			case 'left':
				return `inset(0% ${u * 100}% 0% 0%)`;
			case 'right':
				return `inset(0% 0% 0% ${u * 100}%)`;
			case 'up':
				return `inset(0% 0% ${u * 100}% 0%)`;
			case 'down':
				return `inset(${u * 100}% 0% 0% 0%)`;
			case 'diagonal': {
				const p = t * (100 + s);
				const topX = Math.max(0, p);
				const botX = Math.max(0, p - s);
				return `polygon(0% 0%, ${topX}% 0%, ${botX}% 100%, 0% 100%)`;
			}
		}
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
			target.style.clipPath = '';
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

		const scroller =
			typeof scrollElement === 'string'
				? (document.querySelector<HTMLElement>(scrollElement) ?? window)
				: scrollElement instanceof HTMLElement
					? scrollElement
					: window;

		const startAnchor = parseAnchor(start, 'top', 88);
		const endAnchor = parseAnchor(end, 'bottom', 35);
		const refEl = targets[0] ?? node;

		let currentP = calcProgress(refEl, scroller, startAnchor, endAnchor);
		let targetP = currentP;
		let rafId = 0;

		function applyProgress(p: number) {
			const eased = applyEase(p, ease);
			targets.forEach((target, i) => {
				const staggerFrac = targets.length > 1 ? (i * (stagger / 1000)) / (duration / 1000 || 1) : 0;
				const targetProg = Math.max(0, Math.min(1, (eased - staggerFrac) / (1 - staggerFrac || 1)));

				if (targetProg >= 0.999) {
					target.style.clipPath = '';
					if (opacity) target.style.opacity = '';
					target.style.willChange = '';
				} else {
					target.style.clipPath = getClipPath(direction, slant, targetProg);
					if (opacity) target.style.opacity = String(targetProg);
					target.style.willChange = 'clip-path, opacity';
				}
			});
		}

		function tick() {
			if (scrub === true) {
				currentP = targetP;
			} else if (typeof scrub === 'number' && scrub > 0) {
				const factor = Math.min(1, 1 / (scrub * 4 + 1));
				currentP += (targetP - currentP) * factor;
				if (Math.abs(targetP - currentP) < 0.001) {
					currentP = targetP;
				}
			} else {
				currentP = targetP;
			}

			applyProgress(currentP);

			if (currentP !== targetP) {
				rafId = requestAnimationFrame(tick);
			} else {
				rafId = 0;
			}
		}

		function onScroll() {
			targetP = calcProgress(refEl, scroller, startAnchor, endAnchor);
			if (scrub === true) {
				currentP = targetP;
				applyProgress(currentP);
			} else if (!rafId) {
				rafId = requestAnimationFrame(tick);
			}
		}

		applyProgress(currentP);

		scroller.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });

		return () => {
			cancelAnimationFrame(rafId);
			scroller.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			clearTargets(targets);
		};
	});
</script>

<div bind:this={wrapperRef} {...rest} style:display={display}>
	{@render children()}
</div>
