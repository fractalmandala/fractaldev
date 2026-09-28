<script lang="ts">
	import type { Snippet } from 'svelte';

	export type DockItem = {
		id: string;
		label: string;
		icon?: string;
		snippet?: Snippet;
		onclick?: () => void;
	};

	type Props = {
		items?: DockItem[];
		magnification?: number;
		distance?: number;
		class?: string;
	};

	let {
		items = [
			{ id: 'finder', label: 'Finder', icon: '📁' },
			{ id: 'browser', label: 'Browser', icon: '🌐' },
			{ id: 'terminal', label: 'Terminal', icon: '💻' },
			{ id: 'editor', label: 'Editor', icon: '⚡' },
			{ id: 'settings', label: 'Settings', icon: '⚙️' }
		],
		magnification = 1.6,
		distance = 110,
		class: className = ''
	}: Props = $props();

	const rootClass = $derived(['macos-dock', className].filter(Boolean).join(' '));

	let dockEl = $state<HTMLDivElement | null>(null);
	let mouseX = $state<number | null>(null);
	let focusedIndex = $state<number | null>(null);

	function handlePointerMove(e: PointerEvent) {
		if (!dockEl) return;
		mouseX = e.clientX;
	}

	function handlePointerLeave() {
		mouseX = null;
	}

	function getItemScale(index: number, total: number): number {
		if (focusedIndex === index) return magnification;
		if (mouseX === null || !dockEl) return 1;

		const children = dockEl.children;
		if (!children[index]) return 1;

		const rect = (children[index] as HTMLElement).getBoundingClientRect();
		const itemCenter = rect.left + rect.width / 2;
		const d = Math.abs(mouseX - itemCenter);

		if (d > distance) return 1;

		const sigma = distance / 2.4;
		const factor = Math.exp(-(d * d) / (2 * sigma * sigma));
		return 1 + (magnification - 1) * factor;
	}
</script>

<div
	bind:this={dockEl}
	class={rootClass}
	role="toolbar"
	tabindex={0}
	aria-label="Application dock"
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
>
	{#each items as item, index (item.id)}
		{@const scale = getItemScale(index, items.length)}
		{@const yOffset = (scale - 1) * -18}
		<button
			type="button"
			class="macos-dock-item"
			style="
				transform: scale({scale}) translateY({yOffset}px);
				transition: {mouseX === null && focusedIndex === null ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.05s ease-out'};
			"
			aria-label={item.label}
			title={item.label}
			onclick={item.onclick}
			onfocus={() => (focusedIndex = index)}
			onblur={() => (focusedIndex = null)}
		>
			<span class="macos-dock-icon">
				{#if item.snippet}
					{@render item.snippet()}
				{:else if item.icon}
					{item.icon}
				{:else}
					{item.label.slice(0, 1)}
				{/if}
			</span>
			<span class="macos-dock-tooltip" aria-hidden="true">{item.label}</span>
		</button>
	{/each}
</div>

<style lang="sass">
.macos-dock
	display: flex
	align-items: flex-end
	gap: calc(var(--space-2xs) * var(--gap-scale, 1))
	padding: calc(var(--space-2xs) * var(--pad-scale, 1)) calc(var(--space-xs) * var(--pad-scale, 1))
	border-radius: var(--radius-lg)
	border: 1px solid var(--border)
	background: color-mix(in srgb, var(--bg-raised) 72%, transparent)
	backdrop-filter: blur(14px)

	&-item
		position: relative
		display: grid
		place-items: center
		inline-size: var(--dock-icon-size, 44px)
		block-size: var(--dock-icon-size, 44px)
		border-radius: var(--radius-md)
		transform-origin: bottom center
		transition: transform var(--motion-fast) var(--ease-out)
		background: transparent
		border: none
		cursor: pointer

		&:hover
			.macos-dock-tooltip
				opacity: 1

	&-icon
		inline-size: 70%
		block-size: 70%
		display: block
		font-size: var(--text-xl)

	&-tooltip
		position: absolute
		bottom: calc(100% + var(--space-3xs))
		left: 50%
		translate: -50% 0
		padding: 2px 8px
		border-radius: var(--radius-sm)
		border: 1px solid var(--border)
		background: var(--bg-surface)
		color: var(--text-primary)
		font-size: var(--text-2xs)
		white-space: nowrap
		opacity: 0
		pointer-events: none
		transition: opacity var(--motion-fast) var(--ease-out)
</style>


