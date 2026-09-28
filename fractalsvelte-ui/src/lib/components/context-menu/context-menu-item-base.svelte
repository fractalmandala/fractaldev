<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { type Snippet } from 'svelte';
	import { SPRING_LAYOUT } from '../../ease.js';
	import { getContextMenuContext } from './context-menu-context.js';
	import type { ContextMenuItemProps } from './context-menu.types.js';
	import type { MenuItemRole } from '#lib/data/componentTypes.ts';

	let {
		children,
		onSelect,
		disabled = false,
		closeOnSelect = true,
		tone = 'default',
		inset = false,
		class: className,
		textValue,
		role = 'menuitem',
		ariaChecked
	}: ContextMenuItemProps & {
		role?: MenuItemRole;
		ariaChecked?: boolean;
	} = $props();

	const ctx = getContextMenuContext('ContextMenuItem');
	const id = `fs-context-menu-item-${Math.random().toString(36).slice(2, 8)}`;
	const active = $derived(ctx.activeId === id);

	function handlePointerMove(event: PointerEvent) {
		if (!disabled && event.pointerType !== 'touch') {
			const el = event.currentTarget as HTMLElement | null;
			el?.focus();
		}
	}

	function handleClick() {
		if (disabled) return;
		onSelect?.();
		if (closeOnSelect) ctx.setOpen(false);
	}
</script>

<button
	type="button"
	{id}
	{role}
	aria-checked={role === 'menuitem' ? undefined : ariaChecked}
	{disabled}
	data-context-menu-item="true"
	data-disabled={disabled ? 'true' : undefined}
	data-label={textValue}
	data-tone={tone}
	data-inset={inset ? 'true' : undefined}
	tabindex={-1}
	onfocus={() => ctx.setActiveId(id)}
	onpointermove={handlePointerMove}
	onclick={handleClick}
	data-slot="context-menu-item"
	class={className}
>
	{#if active}
		<motion.span
			layoutId={`${ctx.menuId}-active`}
			data-slot="context-menu-item-active"
			data-tone={tone}
			transition={ctx.reduce ? { duration: 0 } : SPRING_LAYOUT}
		/>
	{/if}
	{@render children()}
</button>

<style lang="sass">
[data-slot="context-menu-item"]
	position: relative
	isolation: isolate
	display: flex
	width: 100%
	align-items: center
	gap: var(--space-xs)
	padding: var(--space-2xs) var(--space-xs)
	border: 0
	border-radius: var(--radius-4)
	background: none
	text-align: left
	font: inherit
	font-size: var(--text-xs)
	color: var(--text-primary)
	cursor: pointer
	outline: none

	&[data-tone="destructive"]
		color: var(--danger, var(--warning))

	&[data-inset="true"]
		padding-left: 2rem

	&:disabled
		pointer-events: none
		opacity: 0.4

:global([data-slot="context-menu-item-active"])
	position: absolute
	inset: 0
	z-index: -1
	border-radius: var(--radius-4)
	background: color-mix(in srgb, var(--text-primary) 6.5%, transparent)

	&[data-tone="destructive"]
		background: color-mix(in srgb, var(--danger, var(--warning)) 10%, transparent)
</style>
