<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let { class: className = '', children, ...rest }: Props = $props();

	const rootClass = $derived(`k-code ${className}`.trim());
</script>

<code class={rootClass} {...rest}>{@render children?.()}</code>

<style lang="sass">

.k-code
	font-family: var(--font-mono, monospace)
	font-size: 0.9em
	padding: 2px 6px
	border-radius: var(--radius-xs, 4px)
	background: var(--bg-raised)
	border: 1px solid var(--border-subtle)
	color: var(--syntax-code, var(--text-primary))
</style>
