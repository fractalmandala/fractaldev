import type { Snippet } from 'svelte';

export type ToastStatus = 'neutral' | 'info' | 'loading' | 'success' | 'error';

export type ToastPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export type AnimatedToastAction = {
	label: Snippet | string;
	onClick: (toast: AnimatedToast) => void;
};

// React's `ReactNode` becomes a Snippet; plain strings stay strings so the
// showcase previews can pass text without wrapping every value in a snippet.
export type AnimatedToast = {
	id: string;
	title: Snippet | string;
	description?: Snippet | string;
	status?: ToastStatus;
	icon?: Snippet;
	action?: AnimatedToastAction;
	duration?: number;
	dismissible?: boolean;
	createdAt?: number;
};

export type ToastInput = Omit<AnimatedToast, 'id' | 'createdAt'> & {
	id?: string;
};

export type ToastClassNames = {
	root?: string;
	item?: string;
	surface?: string;
	iconWrap?: string;
	content?: string;
	title?: string;
	description?: string;
	action?: string;
	close?: string;
	progress?: string;
};

export interface AnimatedToastStackProps {
	toasts: AnimatedToast[];
	onDismiss?: (id: string) => void;
	position?: ToastPosition;
	placement?: 'static' | 'fixed' | 'absolute';
	fixed?: boolean;
	portal?: boolean;
	portalRoot?: Element | null;
	maxVisible?: number;
	class?: string;
	classNames?: ToastClassNames;
	icons?: Partial<Record<ToastStatus, Snippet>>;
	renderToast?: Snippet<[AnimatedToast]>;
}

export interface UseAnimatedToastStackOptions {
	initialToasts?: ToastInput[];
	defaultDuration?: number;
	limit?: number;
}

export interface AnimatedToastStackItemProps {
	toast: AnimatedToast;
	index: number;
	onDismiss?: (id: string) => void;
	classNames?: ToastClassNames;
	icons?: Partial<Record<ToastStatus, Snippet>>;
	renderToast?: Snippet<[AnimatedToast]>;
}
