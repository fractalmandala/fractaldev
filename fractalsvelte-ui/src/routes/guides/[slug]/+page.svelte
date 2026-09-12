<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.guide.title} — Fractalsvelte UI</title>
	<meta name="description" content={`Fractalsvelte UI guide: ${data.guide.title}`} />
</svelte:head>

<article class="guide-doc stack gap-m">
	<a class="guide-doc__back button ghost sm w-fit" href="/guides">← All guides</a>
	<div class="guide-doc__content prose">
		{@html data.guide.html}
	</div>
</article>
