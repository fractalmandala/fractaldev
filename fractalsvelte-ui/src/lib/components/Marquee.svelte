<script lang="ts">
	type Props = {
		items: string[];
		speed?: number;
		direction?: 'left' | 'right';
		label?: string;
	};

	let { items, speed = 22, direction = 'left', label = 'Scrolling content' }: Props = $props();
	let style = $derived(`--marquee-duration: ${Math.max(1, speed)}s`);
</script>

<div class="marquee" data-direction={direction} aria-label={label} {style}>
	<div class="marquee-track">
		{#each [...items, ...items] as item, index (`${item}-${index}`)}
			<span aria-hidden={index >= items.length ? 'true' : undefined}>{item}</span>
		{/each}
	</div>
</div>
