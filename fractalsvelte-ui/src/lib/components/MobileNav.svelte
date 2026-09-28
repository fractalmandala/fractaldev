<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luX } from 'fractalicons/lucide';
	import IconButton from './IconButton.svelte';

	export interface MobileNavItem {
		label: string;
		href?: string;
		active?: boolean;
		leading?: import('svelte').Snippet;
		onclick?: () => void;
	}

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		items?: MobileNavItem[];
		label?: string;
		class?: string;
		/** Extra content rendered under the items. */
		children?: import('svelte').Snippet;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		items = [],
		label = 'Menu',
		class: className = '',
		children
	}: Props = $props();

	let nav: HTMLElement | undefined = $state();

	function close() {
		open = false;
		onOpenChange?.(false);
	}

	onMount(() => {
		function onDocKey(e: KeyboardEvent) {
			if (e.key === 'Escape') close();
		}
		document.addEventListener('keydown', onDocKey);
		return () => document.removeEventListener('keydown', onDocKey);
	});

	const rootClass = $derived(`k-mobile-nav-wrap ${className}`.trim());
</script>

<div class={rootClass}>
	{#if open}
		<button type="button" class="k-scrim" data-state="open" aria-label="Close menu" onclick={close}
		></button>
	{/if}
	<nav
		class="k-mobile-nav"
		id="k-mobile-nav"
		bind:this={nav}
		data-state={open ? 'open' : undefined}
		aria-label={label}
		aria-hidden={!open}
		inert={!open}
	>
		<div class="k-mobile-nav-header">
			<span class="text-lg weight-600">{label}</span>
			<IconButton label="Close menu" onclick={close}>
				<Icon icon={luX} size={18} />
			</IconButton>
		</div>
		<div class="k-mobile-nav-body">
			{#each items as item (item.label)}
				{#if item.href}
					<a
						class="k-mobile-nav-item"
						href={item.href}
						data-state={item.active ? 'active' : undefined}
						onclick={close}
					>
						{#if item.leading}{@render item.leading?.()}{/if}
						{item.label}
					</a>
				{:else}
					<button
						type="button"
						class="k-mobile-nav-item"
						data-state={item.active ? 'active' : undefined}
						onclick={() => {
							item.onclick?.();
						}}
					>
						{#if item.leading}{@render item.leading?.()}{/if}
						{item.label}
					</button>
				{/if}
			{/each}
			{#if children}{@render children?.()} {/if}
		</div>
	</nav>
</div>

<style lang="sass">
.k-mobile-nav-wrap
	display: contents

.k-scrim
	position: fixed
	inset: 0
	z-index: var(--z-raised)
	background: rgba(0, 0, 0, 0.4)
	opacity: 0
	pointer-events: none
	border: none
	padding: 0
	cursor: pointer
	transition: opacity 0.25s ease

	&[data-state='open']
		opacity: 1
		pointer-events: auto

.k-mobile-nav
	position: fixed
	inset-block: 0
	inset-inline-start: 0
	width: min(320px, 85vw)
	z-index: var(--z-modal)
	display: flex
	flex-direction: column
	background: var(--bg-popover)
	border-right: 1px solid var(--border)
	box-shadow: var(--shadow-lg)
	transform: translateX(-100%)
	transition: transform 0.25s ease

	&[data-state='open']
		transform: translateX(0)

.k-mobile-nav-header
	display: flex
	align-items: center
	justify-content: space-between
	gap: 12px
	padding: 16px
	border-bottom: 1px solid var(--border)

	.text-lg
		font-size: var(--text-lg)

	.weight-600
		font-weight: 600

.k-mobile-nav-body
	flex: 1
	overflow-y: auto
	padding: 12px

.k-mobile-nav-item
	display: flex
	align-items: center
	gap: 10px
	padding: 10px 12px
	font-size: var(--text-md)
	border: none
	border-radius: var(--radius-6)
	background: transparent
	color: var(--text-primary)
	cursor: pointer
	text-decoration: none

	&:hover
		background: var(--state-hover)

	&[data-state='active']
		color: var(--theme-color-alt)
		font-weight: 500
</style>
