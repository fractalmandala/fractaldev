import { easingValue, type Easing } from '../transitions/easing.js';
import { prefersReducedMotion } from './media.svelte.js';

/**
 * Collapsibles that animate to their natural size.
 *
 * The `grid-template-rows: 0fr → 1fr` trick is the tidiest CSS-only answer, but
 * it needs a specific wrapper/panel DOM shape. This animates height directly so
 * it works on any element, and handles the four things hand-rolled versions
 * usually miss:
 *
 *  - `height: auto` is not animatable, so the natural size is measured first
 *  - a toggle mid-animation resumes from the current size, never from 0
 *  - once open it returns to `auto`, so content that grows later is not clipped
 *  - closed content leaves the tab order and the accessibility tree
 */

export interface CollapseOptions {
	/** Drives the element. Change it and the action animates. */
	open: boolean;
	/** Which dimension collapses. Default 'height'. */
	axis?: 'height' | 'width';
	/** Milliseconds. Default 260. */
	duration?: number;
	/** Default 'out-cubic'. */
	easing?: Easing;
	/** Fade the content alongside the size change. Default true. */
	fade?: boolean;
}

export interface CollapseAction {
	update(options: CollapseOptions): void;
	destroy(): void;
}

/**
 * ```svelte
 * <button onclick={() => (open = !open)}>toggle</button>
 * <div use:collapse={{ open }}>…</div>
 * ```
 */
export function collapse(node: HTMLElement, options: CollapseOptions): CollapseAction {
	let current = options;
	let animation: Animation | undefined;
	let open = options.open;

	const axis = (): 'height' | 'width' => current.axis ?? 'height';

	/** Land in a stable resting state: `auto` when open, out of the tree when shut. */
	function settle(isOpen: boolean): void {
		animation = undefined;
		node.style.removeProperty('overflow');
		node.style.removeProperty(axis());
		node.style.removeProperty('opacity');

		if (isOpen) {
			node.hidden = false;
			node.style.removeProperty('display');

			return;
		}

		node.hidden = true;
		// Belt and braces: an inline `display` beats any stylesheet rule that
		// would otherwise out-specify the UA's `[hidden] { display: none }`.
		node.style.display = 'none';
	}

	function run(next: boolean, animate: boolean): void {
		const prop = axis();
		const from = animation ? node.getBoundingClientRect()[prop] : next ? 0 : undefined;
		const fromOpacity = animation ? getComputedStyle(node).opacity : undefined;

		animation?.cancel();

		if (!animate) {
			settle(next);

			return;
		}

		// Lay it out so the natural size can be read.
		node.hidden = false;
		node.style.removeProperty('display');
		node.style.setProperty('overflow', 'hidden');
		node.style.setProperty(prop, 'auto');

		const full = node.getBoundingClientRect()[prop];
		const start = from ?? (next ? 0 : full);
		const end = next ? full : 0;

		if (start === end) {
			settle(next);

			return;
		}

		node.style.setProperty(prop, `${start}px`);

		const frames: Keyframe[] = [
			{ [prop]: `${start}px` },
			{ [prop]: `${end}px` }
		];

		if (current.fade !== false) {
			frames[0].opacity = fromOpacity ?? (next ? '0' : '1');
			frames[1].opacity = next ? '1' : '0';
		}

		animation = node.animate(frames, {
			duration: current.duration ?? 260,
			easing: easingValue(current.easing ?? 'out-cubic'),
			fill: 'both'
		});

		const running = animation;

		running.finished
			.then(() => {
				// A newer toggle may have replaced this one mid-flight.
				if (animation === running) settle(next);
			})
			.catch(() => {
				/* cancelled by the next toggle — it owns the resting state */
			});
	}

	// No animation on mount: render the starting state as-is.
	settle(open);

	return {
		update(next: CollapseOptions) {
			const changed = next.open !== open;

			current = next;
			open = next.open;

			if (changed) run(next.open, !prefersReducedMotion());
		},
		destroy() {
			animation?.cancel();
		}
	};
}

let sequence = 0;

class Collapsible {
	#id: string;

	open = $state(false);

	constructor(initial: boolean) {
		this.open = initial;
		this.#id = `collapse-${++sequence}`;
	}

	toggle = (): void => {
		this.open = !this.open;
	};

	expand = (): void => {
		this.open = true;
	};

	close = (): void => {
		this.open = false;
	};

	/** Spread onto the button. Wires `aria-expanded` and `aria-controls`. */
	get trigger() {
		return {
			'aria-expanded': this.open,
			'aria-controls': this.#id,
			onclick: this.toggle
		};
	}

	/** Spread onto the panel, alongside `use:collapse={{ open }}`. */
	get panel() {
		return { id: this.#id };
	}
}

/**
 * State plus the ARIA wiring, so a collapsible is correct by default.
 *
 * ```svelte
 * <script>
 *   const faq = collapsible();
 * </script>
 * <button {...faq.trigger}>Details</button>
 * <div {...faq.panel} use:collapse={{ open: faq.open }}>…</div>
 * ```
 */
export function collapsible(initial = false): Collapsible {
	return new Collapsible(initial);
}
