import { getContext, setContext } from 'svelte';

export type MorphSide = 'top' | 'bottom';
export type MorphAlign = 'start' | 'end';

export interface MorphPopoverContext {
	open: boolean;
	setOpen: (open: boolean) => void;
	toggle: () => void;
	triggerId: string;
	contentId: string;
	triggerRef: { current: HTMLElement | null };
	contentRef: { current: HTMLDivElement | null };
}

const KEY = Symbol('popover-morph');

export function setMorphPopoverContext(ctx: MorphPopoverContext) {
	setContext(KEY, ctx);
}

export function getMorphPopoverContext(component: string) {
	const ctx = getContext<MorphPopoverContext>(KEY);
	if (!ctx) throw new Error(`${component} must be used within <MorphPopover>`);
	return ctx;
}
