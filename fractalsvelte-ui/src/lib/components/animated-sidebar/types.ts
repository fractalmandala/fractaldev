import type { Snippet } from 'svelte';

export type SidebarState = 'expanded' | 'collapsed';
export type SidebarSide = 'left' | 'right';
export type SidebarVariant = 'sidebar' | 'floating' | 'inset';
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';

export interface AnimatedSidebarContextValue {
	isMobile: boolean;
	layoutId: string;
	open: boolean;
	openMobile: boolean;
	reduce: boolean;
	setOpen: (open: boolean) => void;
	setOpenMobile: (open: boolean) => void;
	state: SidebarState;
	toggleSidebar: () => void;
	triggerElement: HTMLButtonElement | null;
	registerTrigger: (el: HTMLButtonElement | null) => void;
}

export interface AnimatedSidebarPanelContextValue {
	collapsed: boolean;
	collapsible: SidebarCollapsible;
	side: SidebarSide;
}

export interface AnimatedSidebarProviderProps {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	openMobile?: boolean;
	defaultOpenMobile?: boolean;
	onOpenMobileChange?: (open: boolean) => void;
	class?: string;
	style?: string;
	children: Snippet;
}

export interface AnimatedSidebarProps {
	side?: SidebarSide;
	variant?: SidebarVariant;
	collapsible?: SidebarCollapsible;
	ariaLabel?: string;
	class?: string;
	panelClassName?: string;
	style?: string;
	children: Snippet;
}

export interface AnimatedSidebarTriggerProps {
	'aria-label'?: string;
	type?: 'submit' | 'reset' | 'button';
	onclick?: (event: MouseEvent) => void;
	class?: string;
	children: Snippet;
}

export interface AnimatedSidebarCloseProps {
	'aria-label'?: string;
	type?: 'submit' | 'reset' | 'button';
	onclick?: (event: MouseEvent) => void;
	class?: string;
	children: Snippet;
}

export interface AnimatedSidebarRailProps {
	'aria-label'?: string;
	type?: 'submit' | 'reset' | 'button';
	onclick?: (event: MouseEvent) => void;
	class?: string;
	children?: Snippet;
}

export interface AnimatedSidebarInsetProps {
	class?: string;
	children?: Snippet;
}

export interface AnimatedSidebarHeaderProps {
	class?: string;
	children?: Snippet;
}

export interface AnimatedSidebarContentProps {
	class?: string;
	children?: Snippet;
}

export interface AnimatedSidebarFooterProps {
	class?: string;
	children?: Snippet;
}

export interface AnimatedSidebarGroupProps {
	class?: string;
	children?: Snippet;
}

export interface AnimatedSidebarGroupLabelProps {
	class?: string;
	children?: Snippet;
}

export interface AnimatedSidebarGroupContentProps {
	class?: string;
	children?: Snippet;
}

export interface AnimatedSidebarMenuProps {
	class?: string;
	children: Snippet;
}

export interface AnimatedSidebarMenuItemProps {
	class?: string;
	children?: Snippet;
}

export interface AnimatedSidebarMenuSubProps {
	open: boolean;
	class?: string;
	children?: Snippet;
}

export interface AnimatedSidebarMenuSubItemProps {
	class?: string;
	children?: Snippet;
}

// React derives the text label from string children (for collapsed-tooltip
// aria/title); Svelte children are always a snippet, so an explicit label is
// accepted instead.
export interface AnimatedSidebarMenuButtonProps {
	children: Snippet;
	icon?: Snippet;
	badge?: Snippet;
	href?: string;
	isActive?: boolean;
	ariaExpanded?: boolean;
	disabled?: boolean;
	closeOnSelect?: boolean;
	target?: '_blank' | '_self' | '_parent' | '_top';
	rel?: string;
	label?: string;
	onSelect?: () => void;
	class?: string;
}

export interface AnimatedSidebarMenuSubButtonProps {
	children: Snippet;
	icon?: Snippet;
	href?: string;
	isActive?: boolean;
	disabled?: boolean;
	closeOnSelect?: boolean;
	target?: '_blank' | '_self' | '_parent' | '_top';
	rel?: string;
	onSelect?: () => void;
	class?: string;
}
