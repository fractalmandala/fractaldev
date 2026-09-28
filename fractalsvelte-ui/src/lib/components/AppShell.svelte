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
	const rootClass = $derived(`k-shell ${className}`.trim());
</script>

<div class={rootClass}>
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

<style lang="sass">
.k-shell
	display: flex
	flex-direction: column
	min-height: 100vh
	background: var(--bg)
	color: var(--text-primary)

.k-shell-header
	display: flex
	align-items: center
	justify-content: space-between
	gap: 16px
	height: var(--header-height, 56px)
	padding-inline: var(--shell-pad, 20px)
	border-bottom: 1px solid var(--border)
	background: var(--bg-surface)

.k-shell-body
	display: flex
	flex: 1
	min-height: 0

.k-shell-side
	flex: 0 0 240px
	min-width: 0
	overflow-y: auto
	padding: 12px
	background: var(--bg-surface)
	border-right: 1px solid var(--border)

.k-shell-main
	flex: 1
	min-width: 0
	padding: var(--space-md)
	overflow: auto

.k-shell-footer
	display: flex
	align-items: center
	justify-content: space-between
	min-height: var(--footer-height, 48px)
	padding-inline: var(--shell-pad, 20px)
	border-top: 1px solid var(--border)
	background: var(--bg-surface)
	font-size: var(--text-sm)
	color: var(--text-muted)
</style>
