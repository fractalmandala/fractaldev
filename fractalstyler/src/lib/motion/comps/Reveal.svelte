<script lang="ts">
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';
	import type { RevealDirection } from '$lib/motion/transitions/reveal.js';
	import { areMotionAnimationsDisabled, revealMotionElement } from '../motionPreference.svelte';

	interface Props {
		visible?: boolean;
		direction?: RevealDirection;
		/** Easing curve. Default: 'linear' */
		ease?: string;
		/** Scroll start position (e.g. 'top 90%'). Default: 'top 90%' */
		start?: string;
		/** Scroll end position (e.g. 'top 40%'). Default: 'top 40%' */
		end?: string;
		/** Scrub damping in seconds, or true for direct sync. Default: 3 */
		scrub?: boolean | number;
		/** Stagger between targets/lines. Default: 0.15 */
		stagger?: number;
		/** Optional scroll container selector or element */
		scrollElement?: string | HTMLElement | null;
		children: Snippet;
		propClass: string;
		[key: string]: unknown;
	}

	let {
		visible = true,
		direction = 'down',
		ease = 'linear',
		start = 'top 80%',
		end = 'top 10%',
		scrub = 3,
		stagger = 0.15,
		scrollElement,
		children,
		propClass = '',
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
			case 'power1.out':
				return 1 - Math.pow(1 - p, 2);
			case 'power2.out':
				return 1 - Math.pow(1 - p, 3);
			case 'power3.out':
				return 1 - Math.pow(1 - p, 4);
			case 'power4.out':
				return 1 - Math.pow(1 - p, 5);
			case 'expo.out':
				return p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
			case 'linear':
				return p;
			default:
				return 1 - Math.pow(1 - p, 4);
		}
	}

	function getClipPath(dir: RevealDirection, t: number, slant = 20): string {
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
				const p = t * (100 + slant);
				const topX = Math.max(0, p);
				const botX = Math.max(0, p - slant);
				return `polygon(0% 0%, ${topX}% 0%, ${botX}% 100%, 0% 100%)`;
			}
		}
	}

	function getTargets(node: HTMLElement): HTMLElement[] {
		const children = Array.from(node.children).filter(
			(child): child is HTMLElement => child instanceof Element
		);
		if (children.length > 1) return children;
		const single = children[0] ?? (node.firstElementChild as HTMLElement | null) ?? node;
		const lines = single.querySelectorAll<HTMLElement>('.reveal-line, .reveal-item');
		return lines.length > 0 ? Array.from(lines) : [single];
	}

	function clearTargets(targets: HTMLElement[]) {
		targets.forEach((target) => {
			revealMotionElement(target);
			target.style.transition = '';
			target.style.clipPath = '';
			target.style.willChange = '';
		});
	}

	$effect(() => {
		if (!browser || !wrapperRef || !visible) return;
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

		const startAnchor = parseAnchor(start, 'top', 90);
		const endAnchor = parseAnchor(end, 'top', 40);
		const refEl = targets[0] ?? node;

		let currentP = calcProgress(refEl, scroller, startAnchor, endAnchor);
		let targetP = currentP;
		let rafId = 0;

		function applyProgress(p: number) {
			const eased = applyEase(p, ease);
			targets.forEach((target, i) => {
				const staggerFrac = targets.length > 1 ? i * (stagger || 0.15) : 0;
				const itemP =
					targets.length > 1
						? Math.max(
								0,
								Math.min(
									1,
									(eased - staggerFrac) / (1 - (targets.length - 1) * (stagger || 0.15) || 1)
								)
							)
						: eased;

				if (itemP >= 0.999) {
					target.style.clipPath = '';
					target.style.willChange = '';
				} else {
					target.style.clipPath = getClipPath(direction, itemP);
					target.style.willChange = 'clip-path';
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

		// Initial sync with current scroll position
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

{#if visible}
	<div bind:this={wrapperRef} {...rest} style:display="contents" class={propClass}>
		{@render children()}
	</div>
{/if}
