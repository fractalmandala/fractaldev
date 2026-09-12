import type { Snippet } from 'svelte';

export interface CenterMorphModalProps {
	children: Snippet;
	/** Controlled open state. */
	open?: boolean;
	/** Initial state when used uncontrolled. */
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export interface CenterMorphModalTriggerProps {
	children: Snippet;
}

export interface CenterMorphModalCloseProps {
	children: Snippet;
}

export interface CenterMorphModalContentProps {
	children: Snippet;
	/** Accessible name announced by screen readers. */
	ariaLabel: string;
	/** Optional id of descriptive content inside the modal. */
	ariaDescribedBy?: string;
	/** Close on Escape or backdrop press. Default true. */
	dismissible?: boolean;
	/** Render the close control inside the panel's top-right corner. Default true. */
	showCloseButton?: boolean;
	closeButtonLabel?: string;
	class?: string;
	backdropClass?: string;
}
