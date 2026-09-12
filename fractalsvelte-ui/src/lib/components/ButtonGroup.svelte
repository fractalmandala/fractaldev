<script lang="ts">
	interface Props {
		/** 'segmented' joins children into a pill with gaps; default attaches them tightly. */
		variant?: 'default' | 'segmented';
		orientation?: 'horizontal' | 'vertical';
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'default',
		orientation = 'horizontal',
		class: className = '',
		children
	}: Props = $props();
</script>

<div
	class="k-button-group {className}"
	data-variant={variant}
	data-orientation={orientation}
	role="group"
>
	{@render children?.()}
</div>
