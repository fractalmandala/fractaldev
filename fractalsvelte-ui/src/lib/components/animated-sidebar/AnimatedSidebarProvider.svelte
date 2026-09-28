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

<style lang="sass">
[data-slot='sidebar-wrapper']
	display: flex
	min-height: 240px
	width: 100%

:global([data-slot='sidebar'])
	flex: 0 0 auto
	overflow: hidden
	background: var(--bg-panel)
	border-right: 1px solid var(--border)
	border-radius: var(--radius-8)

:global([data-slot='sidebar-panel'])
	display: flex
	flex-direction: column
	gap: var(--space-sm)
	width: 224px
	padding: var(--space-sm)

:global([data-slot='sidebar-header'])
	display: flex
	align-items: center
	padding: var(--space-2xs) var(--space-3xs)
	color: var(--text-primary)

:global([data-slot='sidebar-content'])
	flex: 1 1 auto
	display: flex
	flex-direction: column
	gap: var(--space-sm)
	overflow-y: auto

:global([data-slot='sidebar-footer'])
	padding: var(--space-2xs) var(--space-3xs)
	border-top: 1px solid var(--border-subtle)

:global([data-slot='sidebar-group'])
	display: flex
	flex-direction: column
	gap: var(--space-3xs)

:global([data-slot='sidebar-group-label'])
	padding: var(--space-3xs) var(--space-2xs)
	font-size: var(--text-xs)
	font-weight: 600
	text-transform: uppercase
	letter-spacing: 0.04em
	color: var(--text-muted)

:global([data-slot='sidebar-group-content'])
	display: flex
	flex-direction: column
	gap: 2px

:global([data-slot='sidebar-menu'])
	display: flex
	flex-direction: column
	gap: 2px

:global([data-slot='sidebar-menu-item'])
	display: flex

:global([data-slot='sidebar-menu-button'])
	display: flex
	align-items: center
	gap: var(--space-2xs)
	width: 100%
	padding: var(--space-2xs)
	border: 0
	border-radius: var(--radius-4)
	background: transparent
	color: var(--text-secondary)
	font-size: var(--text-sm)
	text-align: left
	text-decoration: none
	cursor: pointer

	&:hover
		background: var(--state-hover)
		color: var(--text-primary)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: -2px

	&[data-active='true']
		background: var(--state-selected)
		color: var(--text-primary)
		font-weight: 500

:global([data-slot='sidebar-menu-button-icon'])
	display: inline-flex
	color: var(--text-muted)

:global([data-slot='sidebar-menu-button'][data-active='true'] [data-slot='sidebar-menu-button-icon'])
	color: var(--text-primary)

:global([data-slot='sidebar-rail'])
	position: absolute
	inset: 0
	width: 8px
	cursor: ew-resize

:global([data-slot='sidebar-trigger']),
:global([data-slot='sidebar-close'])
	display: inline-flex
	align-items: center
	justify-content: center
	width: var(--control-h-sm, 28px)
	height: var(--control-h-sm, 28px)
	border: 1px solid var(--border)
	border-radius: var(--radius-4)
	background: var(--bg-raised)
	color: var(--text-secondary)
	cursor: pointer

	&:hover
		background: var(--state-hover)
</style>
