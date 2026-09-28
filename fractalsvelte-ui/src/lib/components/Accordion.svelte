<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		open?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	};

	let {
		title,
		open = $bindable(false),
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(`accordion ${className}`.trim());
</script>

<details class={rootClass} bind:open {...rest}>
	<summary class="accordion-trigger">
		<span>{title}</span>
		<span class="accordion-chevron" aria-hidden="true">⌄</span>
	</summary>
	<div class="accordion-content">{@render children?.()}</div>
</details>

<style lang="sass">

.accordion
	width: 100%
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	background: var(--bg-surface)
	overflow: hidden
	transition: border-color var(--motionin1)

	&[open] > .accordion-trigger .accordion-chevron
		rotate: 180deg

	&-trigger
		display: flex
		flex-direction: row
		align-items: center
		justify-content: space-between
		width: 100%
		min-height: var(--control-h-md)
		padding: calc(var(--space-2xs) * var(--pad-scale, 1)) calc(var(--space-xs) * var(--pad-scale, 1))
		font-family: inherit
		font-weight: 500
		font-size: var(--text-sm)
		color: var(--text-primary)
		text-align: left
		background: transparent
		border: 0
		cursor: pointer
		user-select: none
		list-style: none

		&::-webkit-details-marker
			display: none

		&:hover
			background: var(--state-hover)

		&:focus-visible
			outline: 2px solid var(--ring)
			outline-offset: -2px

	&-chevron
		display: inline-flex
		align-items: center
		justify-content: center
		font-size: var(--text-md)
		color: var(--text-muted)
		transition: rotate var(--motionin1)

	&-content
		padding: calc(var(--space-xs) * var(--pad-scale, 1))
		padding-top: 0
		font-family: inherit
		font-size: var(--text-sm)
		color: var(--text-secondary)
		line-height: 1.6
</style>
