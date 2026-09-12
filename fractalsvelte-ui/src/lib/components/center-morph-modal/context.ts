import { getContext, setContext } from 'svelte';

const KEY = Symbol('center-morph-modal');

export interface CenterMorphModalContext {
	get open(): boolean;
	setOpen(open: boolean): void;
	triggerId: string;
	contentId: string;
}

export function setCenterMorphModalContext(ctx: CenterMorphModalContext) {
	setContext(KEY, ctx);
}

export function useCenterMorphModalContext(component: string) {
	const ctx = getContext<CenterMorphModalContext>(KEY);
	if (!ctx) {
		throw new Error(`${component} must be used within <CenterMorphModal>`);
	}
	return ctx;
}
