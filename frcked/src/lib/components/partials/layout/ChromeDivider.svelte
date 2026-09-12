<script lang="ts">
	export let variant: 'chrome' | 'gradient' = 'chrome';
	export let height: 'sm' | 'md' | 'lg' = 'md';
	export let animated = true;
	export let className = '';

	const heightClasses = {
		sm: 'h-px',
		md: 'h-0.5',
		lg: 'h-1'
	};
</script>

<div class="divider-container wfull pad-y-32 {className}">
	{#if variant === 'chrome'}
		<div
			class="chrome-divider {heightClasses[height]} {animated ? 'animate-shimmer' : ''}"
			role="separator"
		></div>
	{:else if variant === 'gradient'}
		<div
			class="gradient-divider {heightClasses[height]} {animated ? 'animate-flow' : ''}"
			role="separator"
		></div>
	{/if}
</div>

<style lang="sass">
.divider-container
	contain: layout style

.chrome-divider
	position: relative
	width: 100%
	max-width: 48rem
	margin: 0 auto
	background: linear-gradient(to right, #e2e8f0 0%, #cbd5e1 25%, #94a3b8 50%, #cbd5e1 75%, #e2e8f0 100%)
	border-radius: 1px
	mask: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)
	-webkit-mask: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)
	box-shadow: 0 0 4px rgba(148, 163, 184, 0.3), inset 0 1px 0 rgba(248, 250, 252, 0.6), inset 0 -1px 0 rgba(100, 116, 139, 0.4)
	transform: translateZ(0)
	will-change: auto

:global([data-theme='dark']) .chrome-divider
	background: linear-gradient(to right, #475569 0%, #64748b 25%, #94a3b8 50%, #64748b 75%, #475569 100%)
	box-shadow: 0 0 4px rgba(203, 213, 225, 0.2), inset 0 1px 0 rgba(203, 213, 225, 0.4), inset 0 -1px 0 rgba(30, 41, 59, 0.6)

.gradient-divider
	position: relative
	width: 100%
	max-width: 48rem
	margin: 0 auto
	background: linear-gradient(to right, transparent 0%, #3b82f6 25%, #8b5cf6 50%, #3b82f6 75%, transparent 100%)
	border-radius: 2px
	transform: translateZ(0)
	will-change: auto

:global([data-theme='dark']) .gradient-divider
	background: linear-gradient(to right, transparent 0%, #60a5fa 25%, #a78bfa 50%, #60a5fa 75%, transparent 100%)

@keyframes shimmer
	0%
		transform: translateX(-100%)
		opacity: 0
	50%
		opacity: 1
	100%
		transform: translateX(100%)
		opacity: 0

@keyframes flow
	0%, 100%
		opacity: 0.7
	50%
		opacity: 1

.animate-shimmer::before
	content: ''
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	background: linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)
	animation: shimmer 3s ease-in-out infinite
	pointer-events: none

:global([data-theme='dark']) .animate-shimmer::before
	background: linear-gradient(to right, transparent 0%, rgba(203, 213, 225, 0.3) 50%, transparent 100%)

.animate-flow
	animation: flow 2s ease-in-out infinite alternate

@media (prefers-reduced-motion: reduce)
	.animate-shimmer::before,
	.animate-flow
		animation: none

@media (max-width: 768px)
	.divider-container
		padding: 1.5rem 0
</style>
