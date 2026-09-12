<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luX } from 'fractalicons/lucide';
	import IconButton from './IconButton.svelte';

	type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';

	interface Props {
		variant?: Variant;
		title?: string;
		layout?: 'inline' | 'stacked';
		dismissible?: boolean;
		onDismiss?: () => void;
		class?: string;
		children?: import('svelte').Snippet;
		/** Leading icon snippet. */
		icon?: import('svelte').Snippet;
		/** Action buttons rendered at the end. */
		action?: import('svelte').Snippet;
	}

	let {
		variant = 'default',
		title,
		layout = 'inline',
		dismissible = false,
		onDismiss,
		class: className = '',
		children,
		icon,
		action
	}: Props = $props();

	let visible = $state(true);
</script>

{#if visible}
	<div
		class="k-banner {className}"
		data-variant={variant}
		data-layout={layout}
		role={variant === 'danger' ? 'alert' : 'status'}
	>
		{#if icon}<span class="k-banner-icon">{@render icon?.()}</span>{/if}
		<div class="box gap-3xs grow">
			{#if title}<strong class="text-md">{title}</strong>{/if}
			<div class="text-md">{@render children?.()}</div>
		</div>
		{#if action}<div class="row ycenter gap-2xs shrink-0">{@render action?.()}</div>{/if}
		{#if dismissible}
			<IconButton
				label="Dismiss banner"
				size="sm"
				onclick={() => {
					visible = false;
					onDismiss?.();
				}}
			>
				<Icon icon={luX} size={14} />
			</IconButton>
		{/if}
	</div>
{/if}
