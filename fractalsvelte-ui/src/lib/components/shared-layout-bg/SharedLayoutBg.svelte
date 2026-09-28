<script lang="ts">
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { useId } from '../../use-id.js';
	import type { SharedLayoutBgContextValue, SharedLayoutBgProps } from './types.js';
	import { setSharedLayoutBgContext } from './context.js';

	let {
		as = 'div',
		class: className,
		style,
		pillClassName,
		pillContainerClassName,
		inset = 20,
		'data-slot': dataSlot = 'shared-layout-bg',
		onMouseLeave,
		children
	}: SharedLayoutBgProps = $props();

	const reduce = useReducedMotion();
	const uid = useId();
	let activeId = $state<string | null>(null);

	function setActive(id: string | null) {
		activeId = id;
	}

	function handleMouseLeave() {
		setActive(null);
		onMouseLeave?.();
	}

	const ctx = {
		get activeId() {
			return activeId;
		},
		get layoutId() {
			return `shared-bg-${uid}`;
		},
		get inset() {
			return inset;
		},
		get pillClassName() {
			return pillClassName;
		},
		get pillContainerClassName() {
			return pillContainerClassName;
		},
		get reduce() {
			return reduce.current;
		},
		setActive
	} satisfies SharedLayoutBgContextValue;

	setSharedLayoutBgContext(ctx);
</script>

{#if as === 'ul'}
	<motion.ul onmouseleave={handleMouseLeave} data-slot={dataSlot} style={style} class={className}>
		{@render children()}
	</motion.ul>
{:else}
	<motion.div onmouseleave={handleMouseLeave} data-slot={dataSlot} style={style} class={className}>
		{@render children()}
	</motion.div>
{/if}

<style lang="sass">
[data-slot='shared-layout-bg']
	position: relative
	list-style: none
	margin: 0
	padding: var(--space-3xs)

:global([data-slot='shared-layout-bg-pill-wrap'])
	position: absolute
	inset: 0
	pointer-events: none

:global([data-slot='shared-layout-bg-pill'])
	position: absolute
	background: var(--state-selected)
	border: 1px solid var(--border-strong)
	border-radius: var(--radius-6)

:global([data-slot='shared-layout-bg-item-content'])
	position: relative
	z-index: 1
	padding: var(--space-2xs) var(--space-sm)
	color: var(--text-secondary)
	font-size: var(--text-md)
	cursor: default
</style>
