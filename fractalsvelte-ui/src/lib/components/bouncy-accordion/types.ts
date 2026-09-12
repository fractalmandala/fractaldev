import type { Snippet } from 'svelte';

export type BouncyAccordionItem = {
	id: string;
	title: Snippet | string;
	description?: Snippet | string;
	icon?: Snippet;
	disabled?: boolean;
};

export type BouncyAccordionClassNames = {
	root?: string;
	item?: string;
	trigger?: string;
	icon?: string;
	title?: string;
	chevron?: string;
	content?: string;
	description?: string;
};

export interface BouncyAccordionProps {
	items: BouncyAccordionItem[];
	value?: string | null;
	defaultValue?: string | null;
	onValueChange?: (value: string | null) => void;
	collapsible?: boolean;
	class?: string;
	classNames?: BouncyAccordionClassNames;
}

export interface BouncyAccordionRowProps {
	item: BouncyAccordionItem;
	open: boolean;
	startsGroup: boolean;
	endsGroup: boolean;
	separatedFromPrevious: boolean;
	contentId: string;
	triggerId: string;
	reduce: boolean;
	classNames?: BouncyAccordionClassNames;
	onToggle: () => void;
}
