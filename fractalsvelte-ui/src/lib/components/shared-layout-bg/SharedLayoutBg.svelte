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
