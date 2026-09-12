<script lang="ts">
	import { untrack } from 'svelte';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import { useId } from '../../use-id.js';
	import { MOBILE_QUERY, SIDEBAR_KEYBOARD_SHORTCUT } from './utils.js';
	import type {
		AnimatedSidebarContextValue,
		AnimatedSidebarProviderProps,
		SidebarState
	} from './types.js';
	import { setAnimatedSidebarContext } from './context.js';

	let {
		open,
		defaultOpen = true,
		onOpenChange,
		openMobile,
		defaultOpenMobile = false,
		onOpenMobileChange,
		class: className,
		style,
		children
	}: AnimatedSidebarProviderProps = $props();

	const reduce = useReducedMotion();
	const generatedId = useId();

	let internalOpen = $state<boolean>(untrack(() => defaultOpen));
	let internalOpenMobile = $state<boolean>(untrack(() => defaultOpenMobile));
	let isMobile = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);

	$effect(() => {
		const query = window.matchMedia(MOBILE_QUERY);
		isMobile = query.matches;
		const onChange = () => {
			isMobile = query.matches;
		};
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	});

	const desktopOpen = $derived(open ?? internalOpen);
	const mobileOpen = $derived(openMobile ?? internalOpenMobile);
	// NOTE: not named `state` — svelte2tsx treats `$state(...)` as a store
	// access named `state`, and a variable with that name would receive an
	// injected `let $state = __sveltets_2_store_get(state)` declaration.
	const sidebarState = $derived<SidebarState>(desktopOpen ? 'expanded' : 'collapsed');

	function setOpen(next: boolean) {
		if (open === undefined) internalOpen = next;
		onOpenChange?.(next);
	}

	function setOpenMobile(next: boolean) {
		if (openMobile === undefined) internalOpenMobile = next;
		onOpenMobileChange?.(next);
	}

	function toggleSidebar() {
		if (isMobile) setOpenMobile(!mobileOpen);
		else setOpen(!desktopOpen);
	}

	// ⌘B / Ctrl+B toggles the sidebar.
	$effect(() => {
		const handleShortcut = (event: KeyboardEvent) => {
			if (
				event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault();
				toggleSidebar();
			}
		};
		window.addEventListener('keydown', handleShortcut);
		return () => window.removeEventListener('keydown', handleShortcut);
	});

	const ctx = {
		get isMobile() {
			return isMobile;
		},
		get layoutId() {
			return `${generatedId}-active`;
		},
		get open() {
			return desktopOpen;
		},
		get openMobile() {
			return mobileOpen;
		},
		get reduce() {
			return reduce.current;
		},
		get state() {
			return sidebarState;
		},
		get triggerElement() {
			return triggerElement;
		},
		setOpen,
		setOpenMobile,
		toggleSidebar,
		registerTrigger(el: HTMLButtonElement | null) {
			triggerElement = el;
		}
	} satisfies AnimatedSidebarContextValue;

	setAnimatedSidebarContext(ctx);
</script>

<div
	data-slot="sidebar-wrapper"
	data-state={sidebarState}
	style={`--sidebar-width:16rem;--sidebar-width-icon:4.25rem;--sidebar-width-mobile:18rem;${style ?? ''}`}
	class={className}
>
	{@render children()}
</div>
