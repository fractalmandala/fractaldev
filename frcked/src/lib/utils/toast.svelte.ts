import { browser } from '$app/environment';
import { SvelteMap } from 'svelte/reactivity';

export interface Toast {
	id: string;
	message: string;
	type: 'error' | 'warning' | 'info' | 'success';
	dismissible: boolean;
	duration: number; // in milliseconds, 0 = no auto-dismiss
	class?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	onDismiss?: () => void;
}

export interface ToastOptions {
	type?: Toast['type'];
	dismissible?: boolean;
	duration?: number;
	class?: string;
	action?: Toast['action'];
	onDismiss?: () => void;
}

export interface ToastState {
	toasts: Toast[];
	maxToasts: number;
}

export const toastState = $state<ToastState>({
	toasts: [],
	maxToasts: 5
});

const timeouts = new SvelteMap<string, number>();

function generateId(): string {
	return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function setupAutoDismiss(toast: Toast): void {
	if (!browser) return;

	if (toast.duration > 0) {
		const timeout = setTimeout(() => {
			dismiss(toast.id);
		}, toast.duration);
		timeouts.set(toast.id, timeout);
	}
}

function clearTimeout(id: string): void {
	if (!browser) return;

	const timeout = timeouts.get(id);
	if (timeout) {
		globalThis.clearTimeout(timeout);
		timeouts.delete(id);
	}
}

export function add(message: string, options: ToastOptions = {}): string {
	if (!browser) {
		console.log(`Toast: ${message}`); // Fallback for SSR
		return '';
	}

	const id = generateId();

	const toast: Toast = {
		id,
		message,
		type: options.type ?? 'info',
		dismissible: options.dismissible ?? true,
		duration: options.duration ?? 2700,
		class: options.class,
		action: options.action,
		onDismiss: options.onDismiss
	};

	if (toastState.toasts.length >= toastState.maxToasts) {
		const oldestToast = toastState.toasts[0];
		dismiss(oldestToast.id);
	}

	toastState.toasts.push(toast);
	setupAutoDismiss(toast);

	return id;
}

export function dismiss(id: string): void {
	if (!browser) return;

	const toastIndex = toastState.toasts.findIndex((toast) => toast.id === id);
	if (toastIndex === -1) return;

	const toast = toastState.toasts[toastIndex];

	toast.onDismiss?.();

	clearTimeout(id);
	toastState.toasts.splice(toastIndex, 1);
}

export function dismissAll(): void {
	if (!browser) return;

	timeouts.forEach((timeout) => globalThis.clearTimeout(timeout));
	timeouts.clear();

	toastState.toasts.forEach((toast) => toast.onDismiss?.());

	toastState.toasts.length = 0;
}

export function update(id: string, updates: Partial<Omit<Toast, 'id'>>): void {
	if (!browser) return;

	const toast = toastState.toasts.find((t) => t.id === id);
	if (!toast) return;

	if (updates.duration !== undefined) {
		clearTimeout(id);
	}

	Object.assign(toast, updates);

	if (updates.duration !== undefined) {
		setupAutoDismiss(toast);
	}
}

export function success(message: string, options: Omit<ToastOptions, 'type'> = {}): string {
	return add(message, { ...options, type: 'success' });
}

export function error(message: string, options: Omit<ToastOptions, 'type'> = {}): string {
	return add(message, { ...options, type: 'error', duration: options.duration ?? 7000 });
}

export function warning(message: string, options: Omit<ToastOptions, 'type'> = {}): string {
	return add(message, { ...options, type: 'warning', duration: options.duration ?? 6000 });
}

export function info(message: string, options: Omit<ToastOptions, 'type'> = {}): string {
	return add(message, { ...options, type: 'info' });
}

// Promise-based toasts for async operations
export async function promise<T>(
	promise: Promise<T>,
	messages: {
		loading: string;
		success: string | ((data: T) => string);
		error: string | ((error: Error) => string);
	},
	options: ToastOptions = {}
): Promise<T> {
	if (!browser) {
		// Just return the promise without toast UI in SSR
		return promise;
	}

	const loadingId = add(messages.loading, {
		...options,
		type: 'info',
		dismissible: false,
		duration: 0
	});

	try {
		const result = await promise;
		dismiss(loadingId);

		const successMessage =
			typeof messages.success === 'function' ? messages.success(result) : messages.success;

		success(successMessage, options);
		return result;
	} catch (err) {
		dismiss(loadingId);

		const errorMessage =
			typeof messages.error === 'function' ? messages.error(err as Error) : messages.error;

		error(errorMessage, options);
		throw err;
	}
}

// Batch operations
export function addMultiple(toasts: Array<{ message: string; options?: ToastOptions }>): string[] {
	return toasts.map(({ message, options }) => add(message, options));
}

// Configuration
export function setMaxToasts(max: number): void {
	if (!browser) return;

	toastState.maxToasts = Math.max(1, max);

	// Remove excess toasts if current count exceeds new max
	while (toastState.toasts.length > toastState.maxToasts) {
		const oldestToast = toastState.toasts[0];
		dismiss(oldestToast.id);
	}
}

export function getMaxToasts(): number {
	return toastState.maxToasts;
}

export function getToast(id: string): Toast | undefined {
	if (!browser) return undefined;
	return toastState.toasts.find((toast) => toast.id === id);
}

export function hasToast(id: string): boolean {
	if (!browser) return false;
	return toastState.toasts.some((toast) => toast.id === id);
}

export function getToastsByType(type: Toast['type']): Toast[] {
	if (!browser) return [];
	return toastState.toasts.filter((toast) => toast.type === type);
}

export function dismissByType(type: Toast['type']): void {
	if (!browser) return;
	const toastsToDismiss = toastState.toasts.filter((toast) => toast.type === type);
	toastsToDismiss.forEach((toast) => dismiss(toast.id));
}

// Legacy object export for backwards compatibility
export const toast = {
	add,
	dismiss,
	dismissAll,
	update,
	success,
	error,
	warning,
	info,
	promise,
	addMultiple,
	setMaxToasts,
	getMaxToasts,
	getToast,
	hasToast,
	getToastsByType,
	dismissByType,
	get list() {
		return toastState.toasts;
	}
};

export const addToast = add;
export const dismissToast = dismiss;
export const dismissAllToasts = dismissAll;
export const updateToast = update;
export const successToast = success;
export const errorToast = error;
export const warningToast = warning;
export const infoToast = info;
export const promiseToast = promise;

export default toast;
