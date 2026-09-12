/**
 * ============================================================================
 *                    SVELTE 5 CLIPBOARD ATTACHMENT & STATE
 * ============================================================================
 *
 * Zero-dependency clipboard utility providing both:
 * 1. A reactive state controller: `createClipboard({ duration: 1600 })`
 * 2. A Svelte 5 attachment: `{@attach copy(textToCopy, options)}`
 *
 * ----------------------------------------------------------------------------
 * 📖 FEATURES:
 * ----------------------------------------------------------------------------
 * - Transient `copied` flag that automatically resets after `duration` ms.
 * - Leaks prevention: active timers are cancelled on unmount so fast component
 *   switching never leaves ghost timers or triggers updates on dead components.
 * - Safe fallback: catches insecure origin (HTTP) or user permission denials,
 *   setting `.failed = true`.
 * - Attachment mode: put `{@attach copy(codeSnippet)}` directly on any `<button>`,
 *   adding `.copied` class and copying on click.
 *
 * ----------------------------------------------------------------------------
 * 💡 USAGE EXAMPLES:
 * ----------------------------------------------------------------------------
 *
 * [Example 1: Reactive Controller (Most Common)]
 * ```svelte
 * <script>
 *   import { createClipboard } from '$lib';
 *   const clip = createClipboard({ duration: 1500 });
 *   const code = 'pnpm add frcked';
 * </script>
 *
 * <button onclick={() => clip.copy(code)} class:copied={clip.copied}>
 *   {clip.copied ? 'Copied!' : 'Copy Code'}
 * </button>
 * ```
 *
 * [Example 2: Svelte 5 Attachment Factory]
 * ```svelte
 * <script>
 *   import { copy } from '$lib/actions';
 *   let text = 'https://fractaldev.io/share';
 * </script>
 *
 * <button {@attach copy(text)}>
 *   Copy Link
 * </button>
 * ```
 * ============================================================================
 */

export interface ClipboardOptions {
	/** How long `copied` remains true before resetting, in milliseconds. Default 1600. */
	duration?: number;
	/** Fired when text is successfully copied. */
	onSuccess?: (text: string) => void;
	/** Fired when copying fails (e.g. insecure origin or denied permission). */
	onError?: (error: unknown) => void;
}

/**
 * Reactive Svelte 5 Clipboard Controller.
 */
export class Clipboard {
	#duration: number;
	#timer: ReturnType<typeof setTimeout> | undefined;
	#onSuccess?: (text: string) => void;
	#onError?: (error: unknown) => void;

	/** True for `duration` ms after a successful writeText operation */
	copied = $state(false);

	/** True if writeText failed (insecure origin or denied permissions) */
	failed = $state(false);

	constructor(options: ClipboardOptions = {}) {
		this.#duration = options.duration ?? 1600;
		this.#onSuccess = options.onSuccess;
		this.#onError = options.onError;

		this.copy = this.copy.bind(this);
		this.destroy = this.destroy.bind(this);
	}

	/**
	 * Writes text to system clipboard and sets transient `.copied` state.
	 */
	async copy(text: string): Promise<boolean> {
		if (typeof window === 'undefined' || !navigator?.clipboard) {
			this.#handleFail(new Error('Clipboard API unavailable'));
			return false;
		}

		clearTimeout(this.#timer);
		this.failed = false;

		try {
			await navigator.clipboard.writeText(text);
			this.copied = true;
			this.#onSuccess?.(text);

			this.#timer = setTimeout(() => {
				this.copied = false;
			}, this.#duration);

			return true;
		} catch (err) {
			this.#handleFail(err);
			return false;
		}
	}

	#handleFail(err: unknown): void {
		this.failed = true;
		this.#onError?.(err);

		this.#timer = setTimeout(() => {
			this.failed = false;
		}, this.#duration);
	}

	/**
	 * Cleans up any active pending reset timeouts.
	 */
	destroy(): void {
		clearTimeout(this.#timer);
	}
}

/**
 * Creates a reactive Svelte 5 Clipboard controller instance.
 */
export function createClipboard(options?: ClipboardOptions): Clipboard {
	const clip = new Clipboard(options);
	return clip;
}

/**
 * Modern Svelte 5 Attachment Factory for Copy Buttons.
 *
 * When attached to a `<button>` or element, clicking it copies `text` to the
 * clipboard, adds `.copied` class for `duration` ms, and fires custom events.
 *
 * @example
 * ```svelte
 * <button {@attach copy('git clone https://...')}>
 *   Clone Repo
 * </button>
 * ```
 */
export function copy(
	textOrGetter: string | (() => string),
	options: ClipboardOptions = {}
): (element: HTMLElement) => void | (() => void) {
	return (element: HTMLElement) => {
		if (typeof window === 'undefined') return;

		const clip = new Clipboard(options);

		async function handleClick() {
			const content = typeof textOrGetter === 'function' ? textOrGetter() : textOrGetter;
			const success = await clip.copy(content);

			if (success) {
				element.classList.add('copied');
				element.dispatchEvent(new CustomEvent('copied', { detail: { text: content } }));
				setTimeout(() => {
					element.classList.remove('copied');
				}, options.duration ?? 1600);
			} else {
				element.classList.add('copy-failed');
				element.dispatchEvent(new CustomEvent('copyerror'));
				setTimeout(() => {
					element.classList.remove('copy-failed');
				}, options.duration ?? 1600);
			}
		}

		element.addEventListener('click', handleClick);

		return () => {
			element.removeEventListener('click', handleClick);
			clip.destroy();
		};
	};
}
