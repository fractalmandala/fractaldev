<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		maxTilt?: number;
		glare?: boolean;
		perspective?: number;
		scale?: number;
		title?: string;
		description?: string;
		children?: Snippet;
		class?: string;
	};

	let {
		maxTilt = 15,
		glare = true,
		perspective = 1000,
		scale = 1.02,
		title,
		description,
		children,
		class: className = ''
	}: Props = $props();

	const rootClass = $derived(['card-3d', className].filter(Boolean).join(' '));

	let cardEl = $state<HTMLDivElement | null>(null);
	let rotateX = $state(0);
	let rotateY = $state(0);
	let currentScale = $state(1);
	let glareX = $state(50);
	let glareY = $state(50);
	let glareOpacity = $state(0);
	let isHovered = $state(false);

	function handlePointerMove(e: PointerEvent) {
		if (!cardEl) return;
		const rect = cardEl.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const xNorm = (mouseX / width - 0.5) * 2;
		const yNorm = (mouseY / height - 0.5) * 2;

		rotateY = xNorm * maxTilt;
		rotateX = -yNorm * maxTilt;
		currentScale = scale;
		glareX = (mouseX / width) * 100;
		glareY = (mouseY / height) * 100;
		glareOpacity = 0.35;
		isHovered = true;
	}

	function handlePointerLeave() {
		rotateX = 0;
		rotateY = 0;
		currentScale = 1;
		glareOpacity = 0;
		isHovered = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={cardEl}
	class={rootClass}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
	style="
		perspective: {perspective}px;
		transform: perspective({perspective}px) rotateX({rotateX}deg) rotateY({rotateY}deg) scale3d({currentScale}, {currentScale}, {currentScale});
		transition: {isHovered ? 'transform 0.08s ease-out' : 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'};
	"
>
	<div class="card-3d-inner">
		{#if children}
			{@render children()}
		{:else}
			<div class="card-3d-content">
				{#if title}
					<strong class="card-3d-title">{title}</strong>
				{/if}
				{#if description}
					<p class="card-3d-description">{description}</p>
				{/if}
			</div>
		{/if}
	</div>

	{#if glare}
		<div
			class="card-3d-glare"
			style="
				background: radial-gradient(circle at {glareX}% {glareY}%, rgba(255, 255, 255, 0.45) 0%, transparent 65%);
				opacity: {glareOpacity};
				transition: {isHovered ? 'opacity 0.15s ease' : 'opacity 0.45s ease'};
			"
			aria-hidden="true"
		></div>
	{/if}
</div>

<style lang="sass">
.card-3d
	position: relative
	display: grid
	place-items: center
	perspective: var(--card-3d-perspective, 900px)
	inline-size: min(100%, 420px)
	touch-action: none

	&-inner
		position: relative
		inline-size: 100%
		border-radius: var(--radius-lg)
		border: 1px solid var(--border)
		background: var(--bg-raised)
		padding: calc(var(--space-lg) * var(--pad-scale, 1))
		transform-style: preserve-3d
		transition: box-shadow var(--motion-base) var(--ease-out)

	&-content
		display: flex
		flex-direction: column
		gap: calc(var(--space-2xs) * var(--gap-scale, 1))
		transform: translateZ(24px)

	&-title
		font-size: var(--text-lg)
		font-weight: 600

	&-description
		font-size: var(--text-sm)
		color: var(--text-secondary)

	&-glare
		position: absolute
		inset: 0
		pointer-events: none
		padding: 0
		border-radius: inherit
		mix-blend-mode: soft-light
		opacity: 0
		transition: opacity var(--motion-base) var(--ease-out)

	&:hover .card-3d-glare
		opacity: 1
</style>


