<script lang="ts" generics="T extends Record<string, any>">
	import type { Snippet } from 'svelte';
	import type { SwipeDirection } from '#lib/data/componentTypes.ts';

	type Props = {
		items?: T[];
		children?: Snippet<[item: T, index: number]>;
		onswipe?: (item: T, direction: SwipeDirection) => void;
		maxVisible?: number;
		class?: string;
	};

	let {
		items = [
			{ id: '1', title: 'Design System', description: 'Composable Sass-first design contracts' } as unknown as T,
			{ id: '2', title: 'Theming Engine', description: 'Real-time custom accent and GPU auras' } as unknown as T,
			{ id: '3', title: 'Svelte 5 Primitives', description: 'Fully accessible UI building blocks' } as unknown as T
		],
		children,
		onswipe,
		maxVisible = 3,
		class: className = ''
	}: Props = $props();

	const rootClass = $derived(['card-stack', className].filter(Boolean).join(' '));

	let stack = $state<T[]>([]);
	let dragX = $state(0);
	let isDragging = $state(false);
	let startX = $state(0);

	$effect(() => {
		stack = [...items];
	});

	function handlePointerDown(e: PointerEvent) {
		if (stack.length === 0) return;
		isDragging = true;
		startX = e.clientX;
		dragX = 0;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		dragX = e.clientX - startX;
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;

		const threshold = 90;
		if (dragX > threshold) {
			swipe('right');
		} else if (dragX < -threshold) {
			swipe('left');
		} else {
			dragX = 0;
		}
	}

	function swipe(direction: SwipeDirection) {
		if (stack.length === 0) return;
		const [removed, ...rest] = stack;
		dragX = direction === 'right' ? 350 : -350;

		setTimeout(() => {
			stack = [...rest, removed];
			dragX = 0;
			onswipe?.(removed, direction);
		}, 180);
	}
</script>

<div class={rootClass} role="region" aria-label="Card stack">
	<div class="card-stack-stage">
		{#each stack.slice(0, maxVisible).reverse() as item, revIndex (item.id ?? revIndex)}
			{@const index = stack.slice(0, maxVisible).length - 1 - revIndex}
			{@const isTop = index === 0}
			{@const rotation = isTop ? dragX * 0.08 : (index % 2 === 0 ? -2 : 2) * index}
			{@const yOffset = index * 12}
			{@const scale = 1 - index * 0.045}
			{@const opacity = 1 - index * 0.15}

			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="card-stack-card"
				data-top={isTop || undefined}
				data-dragging={isTop && isDragging || undefined}
				style="
					transform: translate3d({isTop ? dragX : 0}px, {yOffset}px, 0) scale({scale}) rotate({rotation}deg);
					opacity: {opacity};
					z-index: {maxVisible - index};
					transition: {isTop && isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease'};
				"
				onpointerdown={isTop ? handlePointerDown : undefined}
				onpointermove={isTop ? handlePointerMove : undefined}
				onpointerup={isTop ? handlePointerUp : undefined}
			>
				{#if children}
					{@render children(item, index)}
				{:else}
					<div class="card-stack-content">
						<strong class="card-stack-title">{item.title ?? `Card ${item.id ?? index}`}</strong>
						{#if item.description}
							<p class="card-stack-desc">{item.description}</p>
						{/if}
						<span class="card-stack-hint">{isTop ? 'Swipe left or right ⇄' : ''}</span>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="card-stack-controls">
		<button type="button" class="card-stack-btn" onclick={() => swipe('left')} title="Dismiss Left" aria-label="Swipe left">
			← Swipe Left
		</button>
		<button type="button" class="card-stack-btn" onclick={() => swipe('right')} title="Dismiss Right" aria-label="Swipe right">
			Swipe Right →
		</button>
	</div>
</div>

<style lang="sass">
.card-stack
	position: relative
	display: grid
	grid-template-rows: 1fr auto
	place-items: center
	inline-size: min(100%, 340px)
	block-size: 500px
	perspective: 1200px

	&-stage
		position: relative
		inline-size: 100%
		block-size: 100%

	&-card
		position: absolute
		inset: 0
		display: grid
		place-items: center
		overflow: hidden
		border-radius: var(--radius-lg)
		border: 1px solid var(--border)
		background: var(--bg-raised)
		box-shadow: var(--shadow-card, 0 8px 24px rgb(0 0 0 / 12%))
		cursor: grab
		touch-action: none
		user-select: none
		transition: transform var(--motion-base) var(--ease-spring, var(--ease-out)), opacity var(--motion-base) var(--ease-out)

		&:active
			cursor: grabbing

		&:not([data-top]) .card-stack-content
			opacity: 0

	&-content
		display: flex
		flex-direction: column
		align-items: center
		justify-content: center
		gap: calc(var(--space-3xs) * var(--gap-scale, 1))
		text-align: center
		padding: calc(var(--space-lg) * var(--pad-scale, 1))
		max-inline-size: 34ch

	&-title
		font-size: var(--text-lg)
		font-weight: 600

	&-desc
		font-size: var(--text-sm)
		color: var(--text-secondary)

	&-hint
		display: block
		min-height: 1.2em
		font-size: var(--text-2xs)
		color: var(--text-muted)

	&-controls
		display: flex
		justify-content: center
		gap: calc(var(--space-2xs) * var(--gap-scale, 1))
		margin-top: calc(var(--space-md) * var(--pad-scale, 1))

	&-btn
		padding: calc(var(--space-2xs) * var(--pad-scale, 1)) calc(var(--space-md) * var(--pad-scale, 1))
		border: 1px solid var(--border)
		border-radius: 999px
		background: var(--bg-raised)
		color: var(--text-primary)
		font: inherit
		font-size: var(--text-sm)
		cursor: pointer
		transition: background var(--motion-fast) var(--ease-out), border-color var(--motion-fast) var(--ease-out)
		&:hover:not(:disabled)
			border-color: var(--theme-color)
			background: var(--bg-popover)
		&:focus-visible
			outline: 2px solid var(--theme-color)
			outline-offset: 2px
		&:disabled
			opacity: 0.55
			cursor: not-allowed
</style>


