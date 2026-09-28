import { getContext, setContext } from 'svelte';
import type { MorphSide, MorphAlign } from '#lib/data/componentTypes.ts';

export type { MorphSide, MorphAlign };

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
