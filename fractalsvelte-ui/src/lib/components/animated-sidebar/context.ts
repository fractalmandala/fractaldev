import { getContext, setContext } from 'svelte';
import type {
	AnimatedSidebarContextValue,
	AnimatedSidebarPanelContextValue
} from './types.js';

const ANIMATED_SIDEBAR_CONTEXT = Symbol('animated-sidebar');
const ANIMATED_SIDEBAR_PANEL_CONTEXT = Symbol('animated-sidebar-panel');

export function setAnimatedSidebarContext(ctx: AnimatedSidebarContextValue) {
	setContext(ANIMATED_SIDEBAR_CONTEXT, ctx);
}

export function useAnimatedSidebar(): AnimatedSidebarContextValue {
	const ctx = getContext<AnimatedSidebarContextValue>(ANIMATED_SIDEBAR_CONTEXT);
	if (!ctx) {
		throw new Error('useAnimatedSidebar must be used inside AnimatedSidebarProvider.');
	}
	return ctx;
}

export function setAnimatedSidebarPanelContext(ctx: AnimatedSidebarPanelContextValue) {
	setContext(ANIMATED_SIDEBAR_PANEL_CONTEXT, ctx);
}

export function useAnimatedSidebarPanel(): AnimatedSidebarPanelContextValue {
	const ctx = getContext<AnimatedSidebarPanelContextValue>(ANIMATED_SIDEBAR_PANEL_CONTEXT);
	if (!ctx) {
		throw new Error('Animated Sidebar parts must be used inside AnimatedSidebar.');
	}
	return ctx;
}
