<script lang="ts">
	interface Props {
		/** CSS aspect-ratio value, e.g. '16/9', '1/1', '4/3'. */
		ratio?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { ratio = '16/9', class: className = '', children }: Props = $props();
</script>

<div class="k-aspect {className}" style={`--k-aspect-ratio:${ratio}`}>
	<div class="k-aspect-inner">{@render children?.()}</div>
</div>
