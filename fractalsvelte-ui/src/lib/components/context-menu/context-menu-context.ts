import { getContext, setContext } from 'svelte';

export type OpenModality = 'pointer' | 'keyboard' | 'touch';
export type MenuPoint = { x: number; y: number };

export interface ContextMenuContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	openAt: (point: MenuPoint, modality: OpenModality) => void;
	point: MenuPoint;
	modality: OpenModality;
	invocation: number;
	menuId: string;
	triggerRef: { current: HTMLElement | null };
	contentRef: { current: HTMLDivElement | null };
	activeId: string | null;
	setActiveId: (id: string | null) => void;
	reduce: boolean;
}

const KEY = Symbol('fs-context-menu');

export function setContextMenuContext(ctx: ContextMenuContextValue) {
	setContext(KEY, ctx);
}

export function getContextMenuContext(component: string) {
	const ctx = getContext<ContextMenuContextValue>(KEY);
	if (!ctx) throw new Error(`${component} must be used within <ContextMenu>`);
	return ctx;
}

export interface ContextMenuRadioGroupContext {
	value: string;
	onValueChange?: (value: string) => void;
}

const RADIO_KEY = Symbol('fs-context-menu-radio-group');

export function setContextMenuRadioGroupContext(ctx: ContextMenuRadioGroupContext) {
	setContext(RADIO_KEY, ctx);
}

export function getContextMenuRadioGroupContext(component: string) {
	const ctx = getContext<ContextMenuRadioGroupContext>(RADIO_KEY);
	if (!ctx) {
		throw new Error(`${component} must be used within <ContextMenuRadioGroup>`);
	}
	return ctx;
}
