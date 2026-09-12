/**
 * ============================================================================
 *                 SVELTE 5 BATTERY-SAVING ANIMATION LOOP (TICKER)
 * ============================================================================
 *
 * A smart animation/timer loop replacing fragile `setInterval` or raw `rAF`.
 *
 * ----------------------------------------------------------------------------
 * 📖 WHY THIS IMPLEMENTATION IS SUPERIOR:
 * ----------------------------------------------------------------------------
 * 1. AUTOMATIC TAB-BACKGROUND SLEEP:
 *    - Standard loops continue ticking in hidden tabs, burning CPU and battery.
 *    - Listens to `document.visibilitychange` and automatically pauses while
 *      the tab is hidden, resuming instantly when focused.
 *
 * 2. REDUCED MOTION SENSITIVITY:
 *    - Defaults to paused if the user has `prefers-reduced-motion: reduce` enabled,
 *      while still honoring explicit user `.start()` actions.
 *
 * 3. DUAL MODES:
 *    - Frame mode (runs every `requestAnimationFrame` for buttery 60/120fps visuals).
 *    - Interval mode (pass `interval: 1000` for 1-second tickers, countdowns, clocks).
 *
 * ----------------------------------------------------------------------------
 * 💡 USAGE EXAMPLES:
 * ----------------------------------------------------------------------------
 * ```svelte
 * <script>
 *   import { createLoop } from '$lib/states';
 *
 *   let angle = $state(0);
 *
 *   // Runs on every animation frame:
 *   const loop = createLoop(() => {
 *     angle = (angle + 1) % 360;
 *   });
 * </script>
 *
 * <div style="transform: rotate({angle}deg)">Spinning Element</div>
 * <button onclick={loop.toggle}>{loop.playing ? 'Pause' : 'Play'}</button>
 * ```
 * ============================================================================
 */

export interface LoopOptions {
	/** Milliseconds between ticks. Omit for standard `requestAnimationFrame`. */
	interval?: number;
	/** Start immediately on creation. Default true (forced false under reduced motion). */
	autostart?: boolean;
	/** Pause while browser tab is hidden in background. Default true. */
	pauseWhenHidden?: boolean;
}

function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export class Loop {
	readonly #tick: (elapsedFrames: number) => void;
	readonly #interval?: number;
	readonly #pauseWhenHidden: boolean;

	#timer = 0;
	#rafId = 0;
	#lastTimestamp = 0;

	/** Number of completed ticks since started (Svelte 5 Rune) */
	count = $state(0);

	/** True while the ticker is actively running */
	playing = $state(false);

	constructor(tick: (elapsedFrames: number) => void, options: LoopOptions = {}) {
		const { interval, autostart = true, pauseWhenHidden = true } = options;

		this.#tick = tick;
		this.#interval = interval;
		this.#pauseWhenHidden = pauseWhenHidden;

		this.start = this.start.bind(this);
		this.stop = this.stop.bind(this);
		this.toggle = this.toggle.bind(this);
		this.destroy = this.destroy.bind(this);

		if (typeof window === 'undefined') return;

		if (pauseWhenHidden) {
			document.addEventListener('visibilitychange', this.#onVisibility);
		}

		if (autostart && !prefersReducedMotion()) {
			this.start();
		}
	}

	#onVisibility = (): void => {
		if (!this.playing) return;

		if (document.hidden) {
			this.#stopClock();
		} else {
			this.#startClock();
		}
	};

	#startClock(): void {
		if (typeof window === 'undefined') return;

		if (this.#interval !== undefined) {
			this.#timer = window.setInterval(() => {
				this.count++;
				this.#tick(this.count);
			}, this.#interval);
		} else {
			const step = (timestamp: number) => {
				if (!this.playing) return;
				this.count++;
				this.#tick(this.count);
				this.#lastTimestamp = timestamp;
				this.#rafId = requestAnimationFrame(step);
			};
			this.#rafId = requestAnimationFrame(step);
		}
	}

	#stopClock(): void {
		if (this.#timer) {
			clearInterval(this.#timer);
			this.#timer = 0;
		}
		if (this.#rafId) {
			cancelAnimationFrame(this.#rafId);
			this.#rafId = 0;
		}
	}

	/**
	 * Starts the loop.
	 */
	start(): void {
		if (this.playing) return;
		this.playing = true;
		this.#startClock();
	}

	/**
	 * Pauses the loop.
	 */
	stop(): void {
		if (!this.playing) return;
		this.playing = false;
		this.#stopClock();
	}

	/**
	 * Toggles play / pause state.
	 */
	toggle(): void {
		if (this.playing) this.stop();
		else this.start();
	}

	/**
	 * Cleans up all timers and visibility listeners.
	 */
	destroy(): void {
		this.stop();
		if (typeof window !== 'undefined' && this.#pauseWhenHidden) {
			document.removeEventListener('visibilitychange', this.#onVisibility);
		}
	}
}

/**
 * Creates a tab-aware, battery-saving animation loop.
 *
 * @example
 * ```ts
 * const loop = createLoop((count) => drawCanvas(count));
 * ```
 */
export function createLoop(
	tick: (count: number) => void,
	options?: LoopOptions
): Loop {
	return new Loop(tick, options);
}
