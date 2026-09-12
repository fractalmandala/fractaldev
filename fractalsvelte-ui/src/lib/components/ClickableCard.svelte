<script lang="ts">
	interface Props {
		href?: string;
		title?: string;
		description?: string;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: import('svelte').Snippet;
	}

	let { href, title, description, class: className = '', onclick, children }: Props = $props();
</script>

{#if href}
	<a {href} class="k-clickable-card {className}" {onclick}>
		{#if title}<span class="k-card-title">{title}</span>{/if}
		{#if description}<span class="k-card-desc">{description}</span>{/if}
		{@render children?.()}
	</a>
{:else}
	<button type="button" class="k-clickable-card {className}" {onclick}>
		{#if title}<span class="k-card-title">{title}</span>{/if}
		{#if description}<span class="k-card-desc">{description}</span>{/if}
		{@render children?.()}
	</button>
{/if}
