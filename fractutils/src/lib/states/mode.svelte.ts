import { transition, type TransitionSpec } from '../transitions/view-transition.js';

/**
 * Dark/light mode.
 *
 * Three states, not two: 'dark', 'light', and 'system' — following the OS until
 * the user makes a choice. The resolved value lands on <html data-mode> so CSS
 * can key off it, and the choice persists.
 *
 * The hard part is the flash of wrong theme on first paint: nothing in the app
 * bundle runs early enough. `modeScript()` emits a tiny snippet for <head> that
 * sets the attribute before the first paint.
 */

export type Mode = 'dark' | 'light' | 'system';
export type ResolvedMode = 'dark' | 'light';

export interface ModeOptions {
	/** Attribute set on <html>. Default 'data-mode'. */
	attribute?: string;
	/** localStorage key. Default 'mode'. */
	storageKey?: string;
	/** Used when nothing is stored. Default 'system'. */
	defaultMode?: Mode;
}

const DEFAULTS = {
	attribute: 'data-mode',
	storageKey: 'mode',
	defaultMode: 'system' as Mode
};

/**
 * Inline this in <svelte:head> *before* any stylesheet, so the attribute is set
 * before the first paint and the page never flashes the wrong theme.
 *
 * ```svelte
 * <svelte:head>
 *   {@html `<script>${modeScript()}<\/script>`}
 * </svelte:head>
 * ```
 */
export function modeScript(options: ModeOptions = {}): string {
	const { attribute, storageKey, defaultMode } = { ...DEFAULTS, ...options };

	return `(function(){try{var m=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(defaultMode)};if(m==='system'){m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute(${JSON.stringify(attribute)},m)}catch(e){}})()`;
}

class ModeStore {
	#attribute: string;
	#storageKey: string;
	#system: MediaQueryList | undefined;

	/** What the user picked — may be 'system'. */
	preference = $state<Mode>('system');

	/** What is actually applied — never 'system'. */
	resolved = $state<ResolvedMode>('light');

	get isDark(): boolean {
		return this.resolved === 'dark';
	}

	constructor(options: ModeOptions = {}) {
		const { attribute, storageKey, defaultMode } = { ...DEFAULTS, ...options };

		this.#attribute = attribute;
		this.#storageKey = storageKey;
		this.preference = defaultMode;

		if (typeof window === 'undefined') return;

		try {
			const stored = localStorage.getItem(storageKey) as Mode | null;

			if (stored === 'dark' || stored === 'light' || stored === 'system') {
				this.preference = stored;
			}
		} catch {
			/* private mode — the choice just will not persist */
		}

		this.#system = window.matchMedia('(prefers-color-scheme: dark)');

		// Only meaningful while the preference is 'system'.
		this.#system.addEventListener('change', () => {
			if (this.preference === 'system') this.#apply();
		});

		// Another tab changed the mode; follow it.
		window.addEventListener('storage', (event) => {
			if (event.key !== this.#storageKey || !event.newValue) return;

			this.preference = event.newValue as Mode;
			this.#apply();
		});

		this.#apply();
	}

	#resolve(): ResolvedMode {
		if (this.preference !== 'system') return this.preference;

		return this.#system?.matches ? 'dark' : 'light';
	}

	#apply(): void {
		this.resolved = this.#resolve();
		document.documentElement.setAttribute(this.#attribute, this.resolved);
	}

	/**
	 * Set the mode, optionally animated.
	 *
	 * ```ts
	 * mode.set('dark', { kind: 'circle', origin: { x: event.clientX, y: event.clientY } });
	 * ```
	 */
	async set(next: Mode, spec?: TransitionSpec): Promise<void> {
		const commit = () => {
			this.preference = next;

			try {
				localStorage.setItem(this.#storageKey, next);
			} catch {
				/* private mode */
			}

			this.#apply();
		};

		if (!spec) {
			commit();

			return;
		}

		await transition(commit, spec);
	}

	/**
	 * Flip dark ↔ light. Defaults to the swipe: the incoming theme grows down
	 * from the top when going dark, up from the bottom when going light — so the
	 * gesture reads as the sun setting and rising.
	 */
	async toggle(spec?: TransitionSpec): Promise<void> {
		const next: ResolvedMode = this.resolved === 'dark' ? 'light' : 'dark';
		const swipe: TransitionSpec = {
			kind: 'wipe',
			direction: next === 'dark' ? 'down' : 'up',
			duration: 520,
			...spec
		};

		await this.set(next, swipe);
	}
}

let store: ModeStore | undefined;

/**
 * The app-wide mode store. Configure it on the first call (in your root
 * layout); every later call returns the same instance.
 */
export function mode(options?: ModeOptions): ModeStore {
	store ??= new ModeStore(options);

	return store;
}
