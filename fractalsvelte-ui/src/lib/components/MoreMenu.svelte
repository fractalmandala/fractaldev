<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luEllipsisVertical } from 'fractalicons/lucide';
	import type { MenuItem } from './DropdownMenu.svelte';

	interface Props {
		items: MenuItem[];
		/** Accessible name for the trigger. */
		label?: string;
		align?: 'start' | 'end';
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		class?: string;
	}

	let {
		items,
		label = 'More actions',
		align = 'end',
		open = $bindable(false),
		onOpenChange,
		class: className = ''
	}: Props = $props();

	let wrap: HTMLSpanElement | undefined = $state();
	let triggerBtn: HTMLButtonElement | undefined = $state();
	let itemRefs: (HTMLButtonElement | undefined)[] = $state([]);
	let active = $state(-1);

	function setOpen(value: boolean, restoreFocus = false) {
		if (open === value) return;
		open = value;
		onOpenChange?.(value);
		if (value) {
			active = 0;
			queueMicrotask(() => itemRefs.find((el) => el && !el.disabled)?.focus());
		} else {
			active = -1;
			if (restoreFocus) {
				triggerBtn?.focus();
			}
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open) return;
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
		} else if (e.key === 'Escape') {
			e.preventDefault();
			setOpen(false, true);
		}
	}

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (open && !wrap?.contains(e.target as Node)) {
				setOpen(false, false);
			}
		}
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	});
</script>

<span class="k-popover-wrap {className}" bind:this={wrap}>
	<button
		bind:this={triggerBtn}
		class="k-icon-button"
		data-variant="outline"
		aria-label={label}
		title={label}
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => setOpen(!open)}
		onkeydown={(e) => e.key === 'Escape' && setOpen(false, true)}
	>
		<Icon icon={luEllipsisVertical} size={18} />
	</button>

	<div
		class="k-menu"
		role="menu"
		data-placement="bottom"
		data-align={align}
		data-open={open}
		hidden={!open}
		tabindex="-1"
		onkeydown={onKeydown}
	>
		{#each items as item, i (item.label + i)}
			<button
				bind:this={itemRefs[i]}
				class="k-menu-item"
				role="menuitem"
				data-variant={item.danger ? 'danger' : undefined}
				data-state={item.disabled ? 'disabled' : undefined}
				disabled={item.disabled}
				tabindex={active === i ? 0 : -1}
				onclick={() => {
					item.onSelect?.();
					setOpen(false, true);
				}}
				onmouseenter={() => (active = i)}
			>
				{#if item.leading}{@render item.leading?.()}{/if}
				<span class="grow">{item.label}</span>
			</button>
		{/each}
	</div>
</span>
