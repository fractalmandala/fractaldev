<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { slide } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'

	export interface MenuItem {
		label: string;
		onSelect?: () => void;
		danger?: boolean;
		disabled?: boolean;
		shortcut?: string;
		leading?: import('svelte').Snippet;
	}

	interface Props {
		items?: MenuItem[];
		/** Trigger label. */
		label?: string;
		/** Custom trigger (overrides label). Receives wiring props — aria state, click, Escape — to spread on your element. */
		trigger?: import('svelte').Snippet<[Record<string, unknown>]>;
		align?: 'start' | 'end';
		/** Optional extra content rendered below the items. */
		children?: import('svelte').Snippet;
		class?: string;
	}

	let {
		items,
		label,
		trigger,
		align = 'start',
		children,
		class: className = ''
	}: Props = $props();

	let wrap: HTMLSpanElement | undefined = $state();
	let triggerBtn: HTMLButtonElement | undefined = $state();
	let dropdownMenu: HTMLDivElement | undefined = $state();
	let itemRefs: (HTMLButtonElement | undefined)[] = $state([]);
	let active = $state(-1);
	let dropdownOpen = $state(false);

	// Wiring handed to a custom trigger snippet so any element can open the menu.
	const triggerProps = $derived({
		'aria-haspopup': 'menu' as const,
		'aria-expanded': dropdownOpen,
		'data-menu-trigger': 'true',
		onclick: toggleDropdown,
		onkeydown: (e: KeyboardEvent) => e.key === 'Escape' && closeDropdown()
	});

	function focusTrigger() {
		if (triggerBtn) {
			triggerBtn.focus();
			return;
		}
		wrap?.querySelector<HTMLElement>('[data-menu-trigger]')?.focus();
	}

	let placement = $state<'top' | 'bottom'>('bottom');

	function positionMenu() {
		if (!wrap || !dropdownMenu) return;
		const tRect = wrap.getBoundingClientRect();
		const pRect = dropdownMenu.getBoundingClientRect();
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const gap = 8;

		// Default: below trigger
		let top = tRect.bottom + gap;
		let left = align === 'end' ? tRect.right - pRect.width : tRect.left;
		let currentPlacement: 'top' | 'bottom' = 'bottom';

		// Flip up if clipped at bottom
		if (top + pRect.height > vh) {
			top = tRect.top - pRect.height - gap;
			currentPlacement = 'top';
		}

		// Shift left if clipped at right edge
		if (left + pRect.width > vw - gap) {
			left = vw - pRect.width - gap;
		}

		// Clamp to left edge
		if (left < gap) left = gap;

		placement = currentPlacement;
		Object.assign(dropdownMenu.style, {
			position: 'fixed',
			top: `${top}px`,
			left: `${left}px`
		});
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
		if (dropdownOpen) {
			active = 0;
			tick().then(() => {
				positionMenu();
				itemRefs.find((el) => el && !el.disabled)?.focus();
			});
		} else {
			active = -1;
		}
	}

	function closeDropdown() {
		dropdownOpen = false;
		active = -1;
	}

	function clickOutsideDropdown() {
		if (dropdownOpen) closeDropdown();
	}

	function onKeydown(e: KeyboardEvent) {
		if (!dropdownOpen) return;
		const enabled = itemRefs.filter((el) => el && !el.disabled);
		if (enabled.length === 0) return;
		let idx = enabled.findIndex((el) => el === itemRefs[active]);
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			idx = (idx + 1) % enabled.length;
			active = itemRefs.indexOf(enabled[idx]);
			enabled[idx]?.focus();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			idx = (idx - 1 + enabled.length) % enabled.length;
			active = itemRefs.indexOf(enabled[idx]);
			enabled[idx]?.focus();
		} else if (e.key === 'Home') {
			e.preventDefault();
			active = itemRefs.indexOf(enabled[0]);
			enabled[0]?.focus();
		} else if (e.key === 'End') {
			e.preventDefault();
			active = itemRefs.indexOf(enabled[enabled.length - 1]);
			enabled[enabled.length - 1]?.focus();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			closeDropdown();
		}
	}

	let cleanupScroll: (() => void) | undefined;

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (dropdownOpen && !wrap?.contains(e.target as Node)) {
				clickOutsideDropdown();
			}
		}
		document.addEventListener('click', onDocClick);

		function onReposition() {
			if (dropdownOpen) positionMenu();
		}
		window.addEventListener('scroll', onReposition, true);
		window.addEventListener('resize', onReposition);
		cleanupScroll = () => {
			window.removeEventListener('scroll', onReposition, true);
			window.removeEventListener('resize', onReposition);
		};

		return () => {
			document.removeEventListener('click', onDocClick);
			cleanupScroll?.();
		};
	});
</script>

<span class="dropdown-wrapper {className}" bind:this={wrap}>
	{#if trigger}
		{@render trigger(triggerProps)}
	{:else}
		<button
			bind:this={triggerBtn}
			class="dropdown-trigger"
			data-variant="secondary"
			data-state={dropdownOpen ? 'open' : undefined}
			aria-haspopup="menu"
			aria-expanded={dropdownOpen}
			onclick={toggleDropdown}
			onkeydown={(e) => e.key === 'Escape' && closeDropdown()}
		>
			{#if label}{label}{:else}Menu{/if}
		</button>
	{/if}
	{#if dropdownOpen === true}
	<div
		class="dropdown-menu"
		role="menu"
		data-placement={placement}
		data-align={align}
		data-open={dropdownOpen}
		tabindex="-1"
		onkeydown={onKeydown}
		bind:this={dropdownMenu}
		onclick={closeDropdown}
		transition:slide={{ duration: 80, easing: cubicOut }}
	>
		{#each items as item, i (item.label + i)}
			<button
				bind:this={itemRefs[i]}
				class="menu-item"
				role="menuitem"
				data-variant={item.danger ? 'danger' : undefined}
				data-state={item.disabled ? 'disabled' : undefined}
				disabled={item.disabled}
				tabindex={active === i ? 0 : -1}
				onclick={() => {
					item.onSelect?.();
				}}
				onmouseenter={() => {
					active = i;
				}}
			>
				{#if item.leading}{@render item.leading?.()}{/if}
				<span class="grow">{item.label}</span>
				{#if item.shortcut}<span class="muted">{item.shortcut}</span>{/if}
			</button>
		{/each}
		{#if children}
			{@render children()}
		{/if}
	</div>
	{/if}
</span>

<style lang="sass">

button
	background: none
	border: none
	padding: 0

.dropdown-wrapper
	position: relative

.dropdown-menu
	position: absolute
	top: 2rem
	border: 1px solid var(--border-subtle)

</style>