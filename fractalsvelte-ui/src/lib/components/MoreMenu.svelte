<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luEllipsisVertical } from 'fractalicons/lucide';
	import type { MenuItem } from './DropdownMenu.svelte';
	import type { MenuAlign } from '#lib/data/componentTypes.ts';

	interface Props {
		items: MenuItem[];
		/** Accessible name for the trigger. */
		label?: string;
		align?: MenuAlign;
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
	const rootClass = $derived(`k-popover-wrap ${className}`.trim());
</script>

<span class={rootClass} bind:this={wrap}>
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

<style lang="sass">
.k-popover-wrap
	position: relative
	display: inline-flex

.k-icon-button
	display: inline-flex
	align-items: center
	justify-content: center
	width: 36px
	height: 36px
	padding: 0
	border-radius: var(--radius-6)
	border: 1px solid var(--border)
	background: var(--bg)
	color: var(--text-secondary)
	cursor: pointer
	transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease

	&:hover
		background: var(--state-hover)
		color: var(--text-primary)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

.k-menu
	display: flex
	flex-direction: column
	min-width: 180px
	padding: 6px
	background: var(--bg-popover)
	border: 1px solid var(--border)
	border-radius: var(--radius-8)
	box-shadow: var(--shadow-popover)
	position: absolute
	z-index: var(--z-modal)
	top: calc(100% + 8px)
	left: 50%
	transform: translateX(-50%)

	&[data-placement='top']
		top: auto
		bottom: calc(100% + 8px)
		transform: translateX(-50%)

	&[data-placement='left']
		top: 50%
		left: auto
		right: calc(100% + 8px)
		transform: translateY(-50%)

	&[data-placement='right']
		top: 50%
		left: calc(100% + 8px)
		transform: translateY(-50%)

	&[data-open='false']
		display: none

	&[data-align='end']
		left: auto
		right: 0
		transform: none

.k-menu-item
	display: flex
	align-items: center
	gap: 10px
	width: 100%
	padding: 8px 12px
	font-size: var(--text-md)
	text-align: left
	border: none
	border-radius: var(--radius-4)
	background: transparent
	color: var(--text-primary)
	cursor: pointer

	&:hover, &[data-highlighted='true']
		background: var(--state-hover)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: -2px

	&[data-state='disabled']
		opacity: 0.5
		pointer-events: none

	&[data-variant='danger']
		color: var(--danger)

		&:hover, &[data-highlighted='true']
			background: color-mix(in srgb, var(--danger) 12%, transparent)

	.grow
		flex-grow: 1
</style>
