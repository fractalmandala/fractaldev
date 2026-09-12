import type { Snippet } from 'svelte';

export interface MorphSelectProps {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	class?: string;
	children: Snippet;
}

export interface MorphSelectValueProps {
	placeholder?: string;
	class?: string;
}

export interface MorphSelectTriggerProps {
	class?: string;
	children: Snippet;
}

export interface MorphSelectContentProps {
	class?: string;
	children: Snippet;
}

export interface MorphSelectItemProps {
	value: string;
	/** Display label shown in the trigger/header. The React source read the
	 * children text; a Svelte snippet cannot be introspected, so the label
	 * must be explicit (falls back to `value`). */
	label?: string;
	disabled?: boolean;
	class?: string;
	children: Snippet;
}
