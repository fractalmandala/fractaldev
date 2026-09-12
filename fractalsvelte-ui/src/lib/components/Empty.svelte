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
	}

	let { title, description, icon, action, class: className }: Props = $props();
</script>

<div class={className} data-slot="empty-root">
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
