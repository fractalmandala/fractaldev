<script lang="ts">
	import Post from './post.svx';
</script>

<svelte:head>
	<title>Uptime pages are just text — Markgraphy</title>
	<meta
		name="description"
		content="A status page you can read in a terminal: sixty days of uptime glyphs, one live timer, and no chart library."
	/>
</svelte:head>

<article class="page">
	<p class="back">
		<a href="/blog">← all writing</a>
	</p>

	<div class="fg-prose">
		<Post />
	</div>
</article>

<style>
	.page {
		max-width: 46rem;
		margin: 0 auto;
		padding: 2rem var(--pad) 5rem;
	}

	.back {
		margin: 0;
	}

	.back a {
		color: var(--text-secondary);
		text-decoration: underline;
		text-decoration-color: var(--border);
		text-underline-offset: 3px;
	}

	.back a:hover {
		color: var(--text-primary);
		text-decoration-color: var(--text-primary);
	}

	.fg-prose {
		margin-top: 2.5rem;
	}
</style>
