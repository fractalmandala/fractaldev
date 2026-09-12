import type { Component, Snippet } from 'svelte';
import type { MotionValue } from '@humanspeak/svelte-motion';

export type MorphingTabsItem = {
	id: string;
	label: string;
	/** Optional icon component (e.g. a fractalicons-wrapped icon). */
	icon?: Component;
	content: Snippet;
	disabled?: boolean;
};

export type MorphingTabsClassNames = {
	root?: string;
	rail?: string;
	tab?: string;
	/** Extra classes for the liquid surface that slides under the active tab. */
	activeTab?: string;
	icon?: string;
	label?: string;
	close?: string;
	content?: string;
};

export interface MorphingTabsProps {
	items: MorphingTabsItem[];
	value?: string | null;
	defaultValue?: string | null;
	onValueChange?: (id: string | null) => void;
	/** Called once after a pointer drag or keyboard reorder completes. */
	onOrderChange?: (ids: string[]) => void;
	/** Enables the close affordance on every tab when provided. */
	onClose?: (id: string) => void;
	ariaLabel?: string;
	class?: string;
	classNames?: MorphingTabsClassNames;
}

/** A tab's spring position, registered with the root so it can settle-check
 * and snap positions after a reorder commits. */
export type MorphingTabPosition = MotionValue<number>;

/** Internal props passed from MorphingTabs to its per-tab child. The tab
 * chrome lives in the child so its springs can be created at init. */
export type MorphingTabProps = {
	item: MorphingTabsItem;
	tabId: string;
	panelId: string;
	isActive: boolean;
	isDragging: boolean;
	anyDragging: boolean;
	targetLeft: number;
	reduce: boolean;
	classNames?: MorphingTabsClassNames;
	zIndex: number;
	surfaceHost: HTMLElement | null;
	surfaceWidth: number;
	surfaceClassName?: string;
	dragLeft: MotionValue<number>;
	surfaceLeft: MotionValue<number>;
	registerPosition: (id: string, position: MorphingTabPosition | null) => void;
	registerTabButton: (id: string, node: HTMLButtonElement | null) => void;
	onPointerDown: (event: PointerEvent) => void;
	onPointerMove: (event: PointerEvent) => void;
	onPointerUp: (event: PointerEvent) => void;
	onPointerCancel: (event: PointerEvent) => void;
	onLostPointerCapture: (event: PointerEvent) => void;
	onSelect: (id: string) => void;
	onTabKeyDown: (id: string, event: KeyboardEvent) => void;
	onClose?: (id: string) => void;
};
