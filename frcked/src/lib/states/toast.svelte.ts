/**
 * ============================================================================
 *                    SVELTE 5 TOAST NOTIFICATION ENGINE
 * ============================================================================
 *
 * A zero-dependency, reactive toast notification manager for Svelte 5.
 *
 * ----------------------------------------------------------------------------
 * 📖 FEATURES:
 * ----------------------------------------------------------------------------
 * - Simple imperative triggers: `toast.success()`, `toast.error()`, `toast.info()`.
 * - Optional custom actions (e.g. "Undo", "Retry", "View").
 * - Auto-dismiss timers with automatic cleanup on manual dismissal.
 * - Stacking control: automatically drops oldest toast when limit is reached.
 * - Reactive state array (`toast.toasts`) ready to render anywhere.
 *
 * ----------------------------------------------------------------------------
 * 💡 USAGE EXAMPLES:
 * ----------------------------------------------------------------------------
 *
 * [Example 1: Triggering Toasts Anywhere in Your Code]
 * ```ts
 * import { toast } from '$lib/states';
 *
 * toast.success('Changes saved successfully!');
 * toast.error('Failed to sync with server.', {
 *   action: { label: 'Retry', onClick: () => retrySync() }
 * });
 * ```
 *
 * [Example 2: Rendering in +layout.svelte or App Shell]
 * ```svelte
 * <script>
 *   import { toast } from '$lib/states';
 * </script>
 *
 * <div class="toast-viewport">
 *   {#each toast.toasts as t (t.id)}
 *     <div class="toast-item toast-{t.type}">
 *       <span>{t.message}</span>
 *       {#if t.action}
 *         <button onclick={t.action.onClick}>{t.action.label}</button>
 *       {/if}
 *       <button onclick={() => toast.dismiss(t.id)}>✕</button>
 *     </div>
 *   {/each}
 * </div>
 * ```
 * ============================================================================
 */

import { SvelteMap } from 'svelte/reactivity';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
	label: string;
	onClick: () => void;
}

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration: number; // in milliseconds (0 = persistent until dismissed)
	dismissible: boolean;
	action?: ToastAction;
	onDismiss?: () => void;
	createdAt: number;
}

export interface ToastOptions {
	type?: ToastType;
	duration?: number;
	dismissible?: boolean;
	action?: ToastAction;
	onDismiss?: () => void;
}

export class ToastManager {
	/** Active queue of toasts (Svelte 5 Rune) */
	toasts = $state<Toast[]>([]);

	/** Maximum toasts visible simultaneously (default: 5) */
	maxToasts = $state(5);

	#timeouts = new SvelteMap<string, ReturnType<typeof setTimeout>>();

	constructor(maxToasts = 5) {
		this.maxToasts = maxToasts;
		this.success = this.success.bind(this);
		this.error = this.error.bind(this);
		this.warning = this.warning.bind(this);
		this.info = this.info.bind(this);
		this.add = this.add.bind(this);
		this.dismiss = this.dismiss.bind(this);
		this.clear = this.clear.bind(this);
	}

	#generateId(): string {
		return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
	}

	/**
	 * Adds a toast to the queue and schedules auto-dismiss.
	 */
	add(message: string, options: ToastOptions = {}): string {
		const id = this.#generateId();
		const duration = options.duration ?? (options.type === 'error' ? 5000 : 3500);

		const newToast: Toast = {
			id,
			message,
			type: options.type ?? 'info',
			duration,
			dismissible: options.dismissible ?? true,
			action: options.action,
			onDismiss: options.onDismiss,
			createdAt: Date.now()
		};

		// Enforce maximum stack limit
		if (this.toasts.length >= this.maxToasts) {
			const oldest = this.toasts[0];
			if (oldest) this.dismiss(oldest.id);
		}

		this.toasts.push(newToast);

		// Schedule auto-dismiss
		if (duration > 0 && typeof window !== 'undefined') {
			const timer = setTimeout(() => {
				this.dismiss(id);
			}, duration);
			this.#timeouts.set(id, timer);
		}

		return id;
	}

	/** Show success toast */
	success(message: string, options?: Omit<ToastOptions, 'type'>): string {
		return this.add(message, { ...options, type: 'success' });
	}

	/** Show error toast (defaults to 5000ms duration) */
	error(message: string, options?: Omit<ToastOptions, 'type'>): string {
		return this.add(message, { ...options, type: 'error' });
	}

	/** Show warning toast */
	warning(message: string, options?: Omit<ToastOptions, 'type'>): string {
		return this.add(message, { ...options, type: 'warning' });
	}

	/** Show info toast */
	info(message: string, options?: Omit<ToastOptions, 'type'>): string {
		return this.add(message, { ...options, type: 'info' });
	}

	/**
	 * Dismisses a specific toast by its ID.
	 */
	dismiss(id: string): void {
		const index = this.toasts.findIndex((t) => t.id === id);
		if (index === -1) return;

		const [removed] = this.toasts.splice(index, 1);
		removed?.onDismiss?.();

		const timer = this.#timeouts.get(id);
		if (timer) {
			clearTimeout(timer);
			this.#timeouts.delete(id);
		}
	}

	/**
	 * Dismisses all active toasts immediately.
	 */
	clear(): void {
		for (const [, timer] of this.#timeouts) {
			clearTimeout(timer);
		}
		this.#timeouts.clear();
		this.toasts = [];
	}
}

/**
 * Global singleton Toast instance ready to use across the entire application.
 */
export const toast = new ToastManager(5);

/**
 * Creates an isolated ToastManager instance if you need a separate queue.
 */
export function createToastManager(maxToasts = 5): ToastManager {
	return new ToastManager(maxToasts);
}
