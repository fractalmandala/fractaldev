<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luChevronDown } from 'fractalicons/lucide';
	import type { MenuItem } from './DropdownMenu.svelte';

	interface Props {
		label: string;
		items: MenuItem[];
		active?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		class?: string;
	}

	let {
		label,
		items,
		active = false,
		open = $bindable(false),
		onOpenChange,
		class: className = ''
	}: Props = $props();

	let wrap: HTMLSpanElement | undefined = $state();
	let triggerBtn: HTMLButtonElement | undefined = $state();
	let itemRefs: (HTMLButtonElement | undefined)[] = $state([]);
	let activeIdx = $state(-1);

	function setOpen(v: boolean, restoreFocus = false) {
		if (open === v) return;
		open = v;
		onOpenChange?.(v);
		if (v) {
			activeIdx = 0;
			queueMicrotask(() => itemRefs.find((el) => el && !el.disabled)?.focus());
		} else {
			activeIdx = -1;
			if (restoreFocus) {
				triggerBtn?.focus();
			}
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open) return;
		const enabled = itemRefs.filter((el) => el && !el.disabled);
		let idx = enabled.findIndex((el) => el === itemRefs[activeIdx]);
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			idx = (idx + 1) % enabled.length;
			activeIdx = itemRefs.indexOf(enabled[idx]);
			enabled[idx]?.focus();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			idx = (idx - 1 + enabled.length) % enabled.length;
			activeIdx = itemRefs.indexOf(enabled[idx]);
			enabled[idx]?.focus();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			setOpen(false, true);
		}
	}

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (open && !wrap?.contains(e.target as Node)) setOpen(false, false);
		}
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	});

	const rootClass = $derived(`k-popover-wrap ${className}`.trim());
</script>

<span class={rootClass} bind:this={wrap}>
	<button
		bind:this={triggerBtn}
		class="k-topnav-item"
		data-state={active ? 'active' : open ? 'open' : undefined}
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => setOpen(!open)}
		onkeydown={(e) => e.key === 'Escape' && setOpen(false, true)}
	>
		{label}
		<Icon icon={luChevronDown} size={14} />
	</button>
	<div
		class="k-menu"
		role="menu"
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
				tabindex={activeIdx === i ? 0 : -1}
				onclick={() => {
					item.onSelect?.();
					setOpen(false, true);
				}}
				onmouseenter={() => (activeIdx = i)}
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

.k-topnav-item
	display: inline-flex
	align-items: center
	gap: 6px
	padding: 7px 12px
	font-size: var(--text-md)
	font-weight: 500
	border: none
	border-radius: var(--radius-6)
	background: transparent
	color: var(--text-secondary)
	cursor: pointer
	text-decoration: none

	&:hover
		background: var(--state-hover)
		color: var(--text-primary)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

	&[data-state='active']
		color: var(--theme-color-alt)

	&[data-state='open']
		background: var(--state-hover)
		color: var(--text-primary)

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

	&[data-open='false']
		display: none

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
