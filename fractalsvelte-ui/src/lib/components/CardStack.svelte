<script lang="ts" generics="T extends Record<string, any>">
	import type { Snippet } from 'svelte';

	type Props = {
		items?: T[];
		children?: Snippet<[item: T, index: number]>;
		onswipe?: (item: T, direction: 'left' | 'right') => void;
		maxVisible?: number;
	};

	let {
		items = [
			{ id: '1', title: 'Design System', description: 'Composable Sass-first design contracts' } as unknown as T,
			{ id: '2', title: 'Theming Engine', description: 'Real-time custom accent and GPU auras' } as unknown as T,
			{ id: '3', title: 'Svelte 5 Primitives', description: 'Fully accessible UI building blocks' } as unknown as T
		],
		children,
		onswipe,
		maxVisible = 3
	}: Props = $props();

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

	function swipe(direction: 'left' | 'right') {
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

<div class="card-stack" role="region" aria-label="Card stack">
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
				class:is-top={isTop}
				class:is-dragging={isTop && isDragging}
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

