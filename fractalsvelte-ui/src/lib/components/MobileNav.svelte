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
</script>

<div class="k-mobile-nav-wrap {className}">
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
			{#if children}{@render children?.()}{/if}
		</div>
	</nav>
</div>
