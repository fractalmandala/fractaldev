<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { EASE_OUT } from '../ease.js';
	import { Icon } from 'fractalicons';
	import { luCheck } from 'fractalicons/lucide';

	export interface MenuEntry {
		label: string;
		onSelect?: () => void;
		/** Right-aligned keyboard hint, e.g. '⌘N'. */
		shortcut?: string;
		disabled?: boolean;
		danger?: boolean;
		/** Renders a check indicator (menuitemcheckbox). */
		checked?: boolean;
		leading?: Snippet;
	}

	export interface MenuSection {
		label: string;
		items: (MenuEntry | 'separator')[];
	}

	interface Props {
		menus: MenuSection[];
		ariaLabel?: string;
		class?: string;
	}

	let { menus, ariaLabel = 'Menu bar', class: className }: Props = $props();

	const reduce = useReducedMotion();

	let openMenu = $state(-1);
	let activeTrigger = $state(0);
	let activeItem = $state(-1);
	let rootEl = $state<HTMLDivElement | null>(null);
	let triggerRefs: (HTMLButtonElement | undefined)[] = $state([]);
	let itemRefs: (HTMLButtonElement | undefined)[] = $state([]);

	// Roving tabindex on the bar: one tab stop, arrows travel between menus.
	function focusTrigger(delta: number) {
		const count = menus.length;
		if (!count) return;
		activeTrigger = (activeTrigger + delta + count) % count;
		triggerRefs[activeTrigger]?.focus();
		// Desktop menubar convention: arrows keep an open menu following along.
		if (openMenu >= 0) setOpenMenu(activeTrigger);
	}

	function setOpenMenu(index: number, restoreFocus = false) {
		openMenu = index;
		if (index >= 0) {
			activeTrigger = index;
			activeItem = 0;
			itemRefs = [];
			queueMicrotask(() => {
				const first = itemRefs.findIndex((el) => el && !el.disabled);
				if (first >= 0) {
					activeItem = first;
					itemRefs[first]?.focus();
				}
			});
		} else {
			activeItem = -1;
			if (restoreFocus) triggerRefs[activeTrigger]?.focus();
		}
	}

	function onTriggerKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			focusTrigger(1);
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			focusTrigger(-1);
		} else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			setOpenMenu(index);
		} else if (event.key === 'Escape' && openMenu === index) {
			event.preventDefault();
			setOpenMenu(-1, true);
		}
	}

	// Focus lives on the items (roving tabindex), so the list only routes keys.
	function onListKeydown(event: KeyboardEvent) {
		const index = openMenu;
		if (index < 0) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			setOpenMenu(-1, true);
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			setOpenMenu((index - 1 + menus.length) % menus.length);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			setOpenMenu((index + 1) % menus.length);
		} else {
			const enabledRefs = itemRefs.filter((el) => el && !el.disabled);
			if (!enabledRefs.length) return;
			let idx = enabledRefs.findIndex((el) => el === itemRefs[activeItem]);
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				idx = (idx + 1) % enabledRefs.length;
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				idx = (idx - 1 + enabledRefs.length) % enabledRefs.length;
			} else if (event.key === 'Home') {
				event.preventDefault();
				idx = 0;
			} else if (event.key === 'End') {
				event.preventDefault();
				idx = enabledRefs.length - 1;
			} else {
				return;
			}
			activeItem = itemRefs.indexOf(enabledRefs[idx]);
			enabledRefs[idx]?.focus();
		}
	}

	function choose(entry: MenuEntry) {
		if (entry.disabled) return;
		entry.onSelect?.();
		setOpenMenu(-1, true);
	}

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (openMenu >= 0 && rootEl && !rootEl.contains(e.target as Node)) setOpenMenu(-1);
		}
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	});
</script>

<div bind:this={rootEl} class={className} data-slot="menubar" role="menubar" aria-label={ariaLabel}>
	{#each menus as menu, i (menu.label)}
		<span data-slot="menubar-menu">
			<!-- Hover follows into sibling menus once a menu is open. -->
			<button
				bind:this={triggerRefs[i]}
				type="button"
				data-slot="menubar-trigger"
				role="menuitem"
				aria-haspopup="menu"
				aria-expanded={openMenu === i}
				tabindex={activeTrigger === i ? 0 : -1}
				data-open={openMenu === i || undefined}
				onclick={() => (openMenu === i ? setOpenMenu(-1, true) : setOpenMenu(i))}
				onmouseenter={() => openMenu >= 0 && openMenu !== i && setOpenMenu(i)}
				onkeydown={(e) => onTriggerKeydown(e, i)}
			>
				{menu.label}
			</button>
			<AnimatePresence>
				{#if openMenu === i}
					<motion.div
						data-slot="menubar-list"
						role="menu"
						aria-label={menu.label}
						tabindex="-1"
						initial={reduce.current ? false : { opacity: 0, y: -4, scale: 0.98 }}
						animate={reduce.current ? undefined : { opacity: 1, y: 0, scale: 1 }}
						exit={reduce.current ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
						transition={{ duration: 0.16, ease: EASE_OUT }}
						onkeydown={onListKeydown}
					>
						{#each menu.items as item, j (j)}
							{#if item === 'separator'}
								<div data-slot="menubar-separator" role="separator"></div>
							{:else}
								<button
									bind:this={itemRefs[j]}
									type="button"
									data-slot="menubar-item"
									role={item.checked !== undefined ? 'menuitemcheckbox' : 'menuitem'}
									aria-checked={item.checked !== undefined ? !!item.checked : undefined}
									data-variant={item.danger ? 'danger' : undefined}
									disabled={item.disabled}
									onclick={() => choose(item)}
									onmouseenter={() => (activeItem = j)}
								>
									<span data-slot="menubar-item-check">
										{#if item.checked === true}<Icon icon={luCheck} aria-hidden="true" />{/if}
									</span>
									{#if item.leading}{@render item.leading()}{/if}
									<span data-slot="menubar-item-label">{item.label}</span>
									{#if item.shortcut}<span data-slot="menubar-shortcut">{item.shortcut}</span>{/if}
								</button>
							{/if}
						{/each}
					</motion.div>
				{/if}
			</AnimatePresence>
		</span>
	{/each}
</div>
