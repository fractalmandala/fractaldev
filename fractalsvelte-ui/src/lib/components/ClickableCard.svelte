<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href?: string;
		title?: string;
		description?: string;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		href,
		title,
		description,
		class: className = '',
		onclick,
		children,
		...rest
	}: Props = $props();

	const rootClass = $derived(`k-clickable-card ${className}`.trim());
</script>

{#if href}
	<a {href} class={rootClass} {onclick} {...rest}>
		{#if title}<span class="k-card-title">{title}</span>{/if}
		{#if description}<span class="k-card-desc">{description}</span>{/if}
		{@render children?.()}
	</a>
{:else}
	<button type="button" class={rootClass} {onclick} {...rest}>
		{#if title}<span class="k-card-title">{title}</span>{/if}
		{#if description}<span class="k-card-desc">{description}</span>{/if}
		{@render children?.()}
	</button>
{/if}

<style lang="sass">

.k-clickable-card
	display: flex
	flex-direction: column
	gap: 8px
	padding: var(--space-sm)
	background: var(--bg-surface)
	border: 1px solid var(--border)
	border-radius: var(--radius-md)
	color: var(--text-primary)
	font-family: inherit
	text-align: left
	text-decoration: none
	cursor: pointer
	transition: border-color var(--motionin1), background-color var(--motionin1), box-shadow var(--motionin1), transform var(--motionin1)

	&:hover
		border-color: var(--border-strong)
		background: var(--bg)
		box-shadow: var(--shadow-md)

	&:active
		transform: translateY(1px)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

.k-card-title
	font-size: var(--text-lg)
	font-weight: 600

.k-card-desc
	font-size: var(--text-sm)
	color: var(--text-muted)
</style>
