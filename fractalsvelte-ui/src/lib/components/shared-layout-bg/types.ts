import type { Snippet } from 'svelte';

export interface SharedLayoutBgContextValue {
	activeId: string | null;
	layoutId: string;
	inset: number;
	pillClassName: string | undefined;
	pillContainerClassName: string | undefined;
	reduce: boolean;
	setActive: (id: string | null) => void;
}

export interface SharedLayoutBgProps {
	/** Semantic container used for the children. */
	as?: 'div' | 'ul';
	/** Class applied to the moving pill. Defaults to a subtle foreground tint. */
	pillClassName?: string;
	/** Horizontal inset of the pill relative to each row (px). Default 20. */
	inset?: number;
	/** Optional positioning override for the pill wrapper inside each item. */
	pillContainerClassName?: string;
	class?: string;
	style?: string;
	'data-slot'?: string;
	onMouseLeave?: () => void;
	children: Snippet;
}
