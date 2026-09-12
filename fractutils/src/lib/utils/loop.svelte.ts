import { prefersReducedMotion } from './media.svelte.js';

/**
 * A play/pause animation loop.
 *
 * The pattern this replaces — `$effect` + `setInterval` + `clearInterval`,
 * re-derived per component — usually misses two things: it keeps ticking in a
 * background tab (burning battery on work nobody sees), and it treats reduced
 * motion as "never start" rather than "start paused, but obey an explicit
 * press". Both are handled here.
 */

export interface LoopOptions {
	/** Milliseconds between ticks. Omit for one tick per animation frame. */
	interval?: number;
	/** Start immediately. Default true — forced to false under reduced motion. */
	autostart?: boolean;
	/** Pause while the tab is hidden. Default true. */
	pauseWhenHidden?: boolean;
}

class Loop {
	#tick: (frame: number) => void;
	#interval: number | undefined;
	#pauseWhenHidden: boolean;
	#timer = 0;
	#frame = 0;
	#last = 0;

	/** Ticks elapsed since the loop was created. */
	count = $state(0);

	playing = $state(false);

	constructor(tick: (frame: number) => void, options: LoopOptions = {}) {
		const { interval, autostart = true, pauseWhenHidden = true } = options;

		this.#tick = tick;
		this.#interval = interval;
		this.#pauseWhenHidden = pauseWhenHidden;

		if (typeof window === 'undefined') return;

		if (pauseWhenHidden) {
			document.addEventListener('visibilitychange', this.#onVisibility);
		}

		// Reduced motion sets the *opening* state only. Pressing play is explicit
		// consent, so `start()` still runs.
		if (autostart && !prefersReducedMotion()) this.start();
	}

	#onVisibility = (): void => {
		if (!this.playing) return;

		if (document.hidden) this.#stopClock();
		else this.#startClock();
	};

	#startClock(): void {
		this.#stopClock();
		this.#last = performance.now();

		if (this.#interval === undefined) {
			const frame = (): void => {
				this.#run();
				this.#frame = requestAnimationFrame(frame);
			};

			this.#frame = requestAnimationFrame(frame);

			return;
		}

		this.#timer = window.setInterval(() => this.#run(), this.#interval);
	}

	#stopClock(): void {
		if (this.#timer) {
			clearInterval(this.#timer);
			this.#timer = 0;
		}

		if (this.#frame) {
			cancelAnimationFrame(this.#frame);
			this.#frame = 0;
		}
	}

	#run(): void {
		this.count += 1;
		this.#tick(this.count);
	}

	start(): void {
		if (this.playing) return;

		this.playing = true;

		if (!(this.#pauseWhenHidden && document.hidden)) this.#startClock();
	}

	stop(): void {
		this.playing = false;
		this.#stopClock();
	}

	toggle(): void {
		if (this.playing) this.stop();
		else this.start();
	}

	/** Advance one tick while paused — the "step" button. */
	step(): void {
		this.#run();
	}

	/** Change the pace without losing the running state. */
	setInterval(ms: number | undefined): void {
		this.#interval = ms;

		if (this.playing) this.#startClock();
	}

	destroy(): void {
		this.#stopClock();
		this.playing = false;

		if (typeof document !== 'undefined') {
			document.removeEventListener('visibilitychange', this.#onVisibility);
		}
	}
}

/**
 * ```svelte
 * <script>
 *   let grid = $state(seed());
 *   const sim = loop(() => (grid = step(grid)), { interval: 90 });
 *   $effect(() => () => sim.destroy());
 * </script>
 * <button onclick={() => sim.toggle()}>{sim.playing ? 'pause' : 'play'}</button>
 * ```
 */
export function loop(tick: (frame: number) => void, options?: LoopOptions): Loop {
	return new Loop(tick, options);
}
