import type { Snippet } from 'svelte';
import type { ContextMenuItemTone } from '#lib/data/componentTypes.ts';

export type { ContextMenuItemTone };

export interface ContextMenuItemProps {
	children: Snippet;
	onSelect?: () => void;
	disabled?: boolean;
	closeOnSelect?: boolean;
	tone?: ContextMenuItemTone;
	inset?: boolean;
	class?: string;
	textValue?: string;
}

export interface ContextMenuCheckboxItemProps extends Omit<ContextMenuItemProps, 'onSelect'> {
	checked: boolean;
	onCheckedChange?: (checked: boolean) => void;
}

export interface ContextMenuRadioItemProps extends Omit<ContextMenuItemProps, 'onSelect'> {
	value: string;
}
