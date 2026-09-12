import { getContext, setContext } from 'svelte';
import type { SharedLayoutBgContextValue } from './types.js';

const SHARED_LAYOUT_BG_CONTEXT = Symbol('shared-layout-bg');

export function setSharedLayoutBgContext(ctx: SharedLayoutBgContextValue) {
	setContext(SHARED_LAYOUT_BG_CONTEXT, ctx);
}

// Optional: items may render outside a SharedLayoutBg container.
export function useSharedLayoutBg(): SharedLayoutBgContextValue | undefined {
	return getContext<SharedLayoutBgContextValue | undefined>(SHARED_LAYOUT_BG_CONTEXT);
}
