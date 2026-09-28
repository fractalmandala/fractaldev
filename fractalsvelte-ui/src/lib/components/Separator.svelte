<script lang="ts">
	import type { Orientation } from '#lib/data/componentTypes.ts';

	type Props = {
		orientation?: Orientation;
		class?: string;
		[key: string]: unknown;
	};

	let { orientation = 'horizontal', class: className = '', ...rest }: Props = $props();

	const rootClass = $derived(`separator ${className}`.trim());
</script>

<hr class={rootClass} data-orientation={orientation} aria-orientation={orientation} {...rest} />

<style lang="sass">

.separator
	border: 0
	margin: 0
	background: var(--border)
	flex-shrink: 0

	&[data-orientation='horizontal']
		width: 100%
		height: 1px

	&[data-orientation='vertical']
		width: 1px
		height: auto
		min-height: 24px
		align-self: stretch
</style>
