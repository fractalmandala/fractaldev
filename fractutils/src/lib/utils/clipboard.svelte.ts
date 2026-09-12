/**
 * Copy-to-clipboard with the transient "copied" flag every copy button needs.
 *
 * The timer is owned here, so the reset cannot leak when a component unmounts
 * mid-flash — the bug every hand-rolled version has to remember to avoid.
 */

export interface ClipboardOptions {
	/** How long `copied` stays true, in ms. Default 1600. */
	duration?: number;
}

class Clipboard {
	#duration: number;
	#timer: ReturnType<typeof setTimeout> | undefined;

	copied = $state(false);

	/** Set when the write fails — no permission, or an insecure origin. */
	failed = $state(false);

	constructor(options: ClipboardOptions = {}) {
		this.#duration = options.duration ?? 1600;
	}

	async copy(text: string): Promise<boolean> {
		clearTimeout(this.#timer);
		this.failed = false;

		try {
			await navigator.clipboard.writeText(text);
		} catch {
			// Insecure origin, or the user denied permission.
			this.failed = true;
			this.#timer = setTimeout(() => (this.failed = false), this.#duration);

			return false;
		}

		this.copied = true;
		this.#timer = setTimeout(() => (this.copied = false), this.#duration);

		return true;
	}

	destroy(): void {
		clearTimeout(this.#timer);
	}
}

/**
 * ```svelte
 * <script>
 *   const clip = clipboard();
 *   $effect(() => () => clip.destroy());
 * </script>
 * <button onclick={() => clip.copy(text)}>{clip.copied ? 'copied' : 'copy'}</button>
 * ```
 */
export function clipboard(options?: ClipboardOptions): Clipboard {
	return new Clipboard(options);
}
