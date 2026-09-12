// Pure position math for portalled overlays: measures a trigger and its
// portalled panel in viewport coordinates, re-measuring on scroll/resize.
// Svelte 5 port of the vendored popover-position.ts hook — refs and the
// active flag are getters so reads stay live, and the returned $state proxy
// is reactive in the consuming component.
import { untrack } from 'svelte';

export type PortalLayout = {
	trigger: {
		left: number;
		top: number;
		width: number;
		height: number;
	};
	content: {
		width: number;
		height: number;
	};
};

function sameLayout(a: PortalLayout | null, b: PortalLayout) {
	return (
		a?.trigger.left === b.trigger.left &&
		a.trigger.top === b.trigger.top &&
		a.trigger.width === b.trigger.width &&
		a.trigger.height === b.trigger.height &&
		a.content.width === b.content.width &&
		a.content.height === b.content.height
	);
}

/** Measures a trigger and portalled panel in viewport coordinates. */
export function usePopoverPortalPosition<
	TriggerElement extends HTMLElement,
	ContentElement extends HTMLElement,
>(
	triggerRef: () => TriggerElement | null,
	contentRef: () => ContentElement | null,
	active: () => boolean
) {
	let layout = $state<PortalLayout | null>(null);

	function update() {
		const trigger = triggerRef();
		const content = contentRef();
		if (!trigger || !content) return;

		const rect = trigger.getBoundingClientRect();
		const next: PortalLayout = {
			trigger: {
				left: rect.left,
				top: rect.top,
				width: rect.width,
				height: rect.height
			},
			content: {
				width: content.offsetWidth,
				height: content.offsetHeight
			}
		};
		if (!sameLayout(layout, next)) layout = next;
	}

	$effect(() => {
		// Measure once on activation, then keep in sync while active.
		untrack(update);
		if (!active()) return;

		const trigger = triggerRef();
		const content = contentRef();
		const observer = new ResizeObserver(update);
		if (trigger) observer.observe(trigger);
		if (content) observer.observe(content);

		window.addEventListener('scroll', update, true);
		window.addEventListener('resize', update);
		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', update, true);
			window.removeEventListener('resize', update);
		};
	});

	return layout;
}
