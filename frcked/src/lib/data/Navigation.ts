export interface NavigationItem {
	href: string;
	label: string;
	badge?: string | number;
	external?: boolean;
	disabled?: boolean;
	description?: string;
}

export { NavigationLogic, type NavigationState } from '$lib/states/navigationState.svelte';
