<script lang="ts">
	type Props = {
		src: string;
		poster?: string;
		caption?: string;
		wide?: boolean;
	};

	let { src, poster, caption, wide = false }: Props = $props();

	const type = $derived(
		src.endsWith('.webm') ? 'video/webm' : src.endsWith('.mp4') ? 'video/mp4' : undefined
	);
</script>

<figure class="acrolls-figure" data-wide={wide ? 'true' : 'false'}>
	<video class="acrolls-video" controls playsinline {poster} preload="metadata">
		<source {src} {type} />
	</video>
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>
