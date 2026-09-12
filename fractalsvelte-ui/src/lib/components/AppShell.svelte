<script lang="ts">
	interface Props {
		class?: string;
		header?: import('svelte').Snippet;
		/** Optional left rail rendered beside main content. */
		sidebar?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { class: className = '', header, sidebar, footer, children }: Props = $props();
</script>

<div class="k-shell {className}">
	{#if header}
		<header class="k-shell-header">{@render header?.()}</header>
	{/if}
	<div class="k-shell-body">
		{#if sidebar}<aside class="k-shell-side">{@render sidebar?.()}</aside>{/if}
		<main class="k-shell-main">{@render children?.()}</main>
	</div>
	{#if footer}
		<footer class="k-shell-footer">{@render footer?.()}</footer>
	{/if}
</div>
