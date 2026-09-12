import type {
	AnimatedToast,
	ToastInput,
	UseAnimatedToastStackOptions
} from './types.js';

let idSeed = 0;

function createToast(input: ToastInput, defaultDuration: number): AnimatedToast {
	return {
		duration: defaultDuration,
		dismissible: true,
		...input,
		id: input.id ?? `toast-${Date.now()}-${idSeed++}`,
		createdAt: Date.now()
	};
}

/**
 * Svelte port of the React `useAnimatedToastStack` hook. Runes in a
 * `.svelte.ts` module give each caller instance its own reactive stack; the
 * auto-dismiss effect mirrors the React `useEffect` timer reconciliation.
 */
export function useAnimatedToastStack(options: UseAnimatedToastStackOptions = {}) {
	const { initialToasts = [], defaultDuration = 4200, limit } = options;

	let toasts = $state<AnimatedToast[]>(
		initialToasts.map((toast) => createToast(toast, defaultDuration))
	);
	const toastTimers = new Map<string, { timer: number; signature: string }>();

	function dismissToast(id: string) {
		toasts = toasts.filter((toast) => toast.id !== id);
	}

	function clearToasts() {
		toasts = [];
	}

	function showToast(input: ToastInput) {
		const toast = createToast(input, defaultDuration);
		const next = [...toasts, toast];
		toasts = typeof limit === 'number' ? next.slice(-limit) : next;
		return toast.id;
	}

	function updateToast(id: string, patch: Partial<ToastInput>) {
		toasts = toasts.map((toast) =>
			toast.id === id
				? {
						...toast,
						...patch,
						id,
						createdAt: patch.duration === undefined ? toast.createdAt : Date.now()
					}
				: toast
		);
	}

	function setToasts(next: AnimatedToast[] | ((current: AnimatedToast[]) => AnimatedToast[])) {
		toasts = typeof next === 'function' ? next(toasts) : next;
	}

	// Reconcile auto-dismiss timers whenever the stack changes: clear timers
	// for removed toasts, (re)arm per-toast timers for the remaining duration,
	// and skip toasts whose `duration`/`createdAt` signature is unchanged.
	$effect(() => {
		const activeIds = new Set(toasts.map((toast) => toast.id));

		toastTimers.forEach((entry, id) => {
			if (!activeIds.has(id)) {
				window.clearTimeout(entry.timer);
				toastTimers.delete(id);
			}
		});

		toasts.forEach((toast) => {
			const duration = toast.duration ?? defaultDuration;
			const existing = toastTimers.get(toast.id);

			if (duration <= 0) {
				if (existing) {
					window.clearTimeout(existing.timer);
					toastTimers.delete(toast.id);
				}
				return;
			}

			const createdAt = toast.createdAt ?? Date.now();
			const signature = `${createdAt}:${duration}`;
			if (existing?.signature === signature) return;
			if (existing) window.clearTimeout(existing.timer);

			const elapsed = Date.now() - createdAt;
			const remaining = Math.max(duration - elapsed, 0);
			const timer = window.setTimeout(() => {
				toastTimers.delete(toast.id);
				dismissToast(toast.id);
			}, remaining);

			toastTimers.set(toast.id, { timer, signature });
		});
	});

	return {
		toasts,
		showToast,
		updateToast,
		dismissToast,
		clearToasts,
		setToasts
	};
}
