<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luInbox } from 'fractalicons/lucide';

	interface Props {
		/** Primary line. */
		title?: string;
		/** Muted supporting copy. */
		description?: string;
		/** Custom icon content; falls back to a built-in glyph. */
		icon?: Snippet;
		/** Call-to-action row rendered below the copy. */
		action?: Snippet;
		class?: string;
		[key: string]: unknown;
	}

	let { title, description, icon, action, class: className = '', ...rest }: Props = $props();

	const rootClass = $derived(`empty-root ${className}`.trim());
</script>

<div class={rootClass} data-slot="empty-root" {...rest}>
	<span data-slot="empty-icon" aria-hidden="true">
		{#if icon}
			{@render icon()}
		{:else}
			<Icon icon={luInbox} size={22} aria-hidden="true" />
		{/if}
	</span>
	{#if title}
		<p data-slot="empty-title">{title}</p>
	{/if}
	{#if description}
		<p data-slot="empty-description">{description}</p>
	{/if}
	{#if action}
		<div data-slot="empty-actions">{@render action()}</div>
	{/if}
</div>

<style lang="sass">

.empty-root
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	text-align: center
	padding: var(--space-lg) var(--space-md)
	width: 100%
	max-width: 400px
	margin: 0 auto
	font-family: inherit

	[data-slot='empty-icon']
		display: inline-flex
		align-items: center
		justify-content: center
		width: 48px
		height: 48px
		border-radius: var(--radius-full)
		background: var(--bg-raised)
		border: 1px solid var(--border)
		color: var(--text-secondary)
		margin-bottom: var(--space-xs)

	[data-slot='empty-title']
		margin: 0
		font-size: var(--text-md)
		font-weight: 600
		color: var(--text-primary)
		line-height: 1.3

	[data-slot='empty-description']
		margin: 4px 0 0 0
		font-size: var(--text-sm)
		color: var(--text-secondary)
		line-height: 1.45
		max-width: 320px

	[data-slot='empty-actions']
		display: flex
		align-items: center
		gap: var(--space-xs)
		margin-top: var(--space-sm)
</style>
