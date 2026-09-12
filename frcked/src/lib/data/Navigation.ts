import { themeStore } from '$lib/utils';

export interface NavigationItem {
	href: string;
	label: string;
	badge?: string | number;
	external?: boolean;
	disabled?: boolean;
	description?: string;
}

export interface NavigationState {
	mobileMenuOpen: boolean;
	currentPath: string;
}

export class NavigationLogic {
	private state: NavigationState;
	private stateUpdateCallback?: (state: NavigationState) => void;

	public readonly navItems: NavigationItem[] = [
		{ href: '/wiki', label: 'Wiki'},
		{ href: '/demos', label: 'Demos'},
		{ href: '/components', label: 'Components'},
		{ href: '/editor', label: 'Editor'},
		{ href: '/utils', label: 'Utils'}
	];

	constructor(initialPath: string = '/') {
		this.state = {
			mobileMenuOpen: false,
			currentPath: this.normalizePath(initialPath)
		};
	}

	public getState(): NavigationState {
		return this.state;
	}

	public onStateUpdate(callback: (state: NavigationState) => void): void {
		this.stateUpdateCallback = callback;
	}

	public updateState(updates: Partial<NavigationState>): void {
		this.state = { ...this.state, ...updates };
		this.stateUpdateCallback?.(this.state);
	}

	public toggleMobileMenu(): void {
		this.updateState({ mobileMenuOpen: !this.state.mobileMenuOpen });
	}

	public closeMobileMenu(): void {
		this.updateState({ mobileMenuOpen: false });
	}

	public updateCurrentPath(path: string): void {
		this.updateState({ currentPath: this.normalizePath(path) });
	}

	public isActive(path: string): boolean {
		const normalizedCurrentPath = this.normalizePath(this.state.currentPath);
		const normalizedNavPath = this.normalizePath(path);
		return normalizedCurrentPath === normalizedNavPath;
	}

	private normalizePath(path: string): string {
		// Remove trailing slash except for root path
		if (path === '/') return path;
		return path.endsWith('/') ? path.slice(0, -1) : path;
	}

	public toggleTheme(): void {
		themeStore.toggle();
	}

	public handleNavItemClick(href: string): void {
		this.updateCurrentPath(href);
		this.closeMobileMenu();
	}

	public createNavItem(item: NavigationItem): NavigationItem {
		return { ...item };
	}

	public addNavItem(item: NavigationItem): void {
		this.navItems.push(item);
	}

	public removeNavItem(href: string): void {
		const index = this.navItems.findIndex((item) => item.href === href);
		if (index > -1) {
			this.navItems.splice(index, 1);
		}
	}

	public updateNavItem(href: string, updates: Partial<NavigationItem>): void {
		const item = this.navItems.find((item) => item.href === href);
		if (item) {
			Object.assign(item, updates);
		}
	}

	public isNavItemDisabled(item: NavigationItem): boolean {
		return Boolean(item.disabled);
	}

	public hasNavItemBadge(item: NavigationItem): boolean {
		return item.badge !== undefined && item.badge !== null && item.badge !== '';
	}

	public getNavItemBadge(item: NavigationItem): string | number | undefined {
		return item.badge;
	}

	public isExternalNavItem(item: NavigationItem): boolean {
		return (
			Boolean(item.external) ||
			item.href.startsWith('http') ||
			item.href.startsWith('mailto:') ||
			item.href.startsWith('tel:')
		);
	}
}
