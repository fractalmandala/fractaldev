import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { animState } from '$lib/motion/stores';

let scrollAnimationsEnabled = $state(get(animState));
let reducedMotionEnabled = $state(false);

animState.subscribe((enabled) => {
	scrollAnimationsEnabled = enabled;
});

if (browser) {
	const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	reducedMotionEnabled = mediaQuery.matches;
	mediaQuery.addEventListener('change', (event) => {
		reducedMotionEnabled = event.matches;
	});
}

export function areScrollAnimationsDisabled(): boolean {
	return !scrollAnimationsEnabled;
}

export function prefersReducedMotion(): boolean {
	return reducedMotionEnabled;
}

export function areMotionAnimationsDisabled(): boolean {
	return areScrollAnimationsDisabled() || prefersReducedMotion();
}

export function revealMotionElement(node: HTMLElement | null | undefined): void {
	if (!node) return;
	node.style.visibility = 'visible';
	node.style.opacity = '';
	node.style.clipPath = '';
}

export async function waitForMotionLayout(frameCount = 2): Promise<void> {
	if (!browser) return;

	await document.fonts?.ready.catch(() => undefined);

	for (let i = 0; i < frameCount; i += 1) {
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	}
}
