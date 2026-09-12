<script lang="ts">
	import PageHeader from '$site/components/docs/page-header.svelte';

	const posts = [
		{
			slug: 'ascii-uptime',
			title: 'Uptime pages are just text',
			date: '2026-08-30',
			teaser:
				'Sixty days of glyphs, one live timer, zero chart libraries — a status page you could paste into a terminal.'
		}
	];
</script>

<svelte:head>
	<title>Writing — Markgraphy</title>
	<meta
		name="description"
		content="Short pieces on ASCII-framed graphs, markdown workflows, and text-first interfaces."
	/>
</svelte:head>

<section class="page">
	<PageHeader title="Writing." kicker="blog" lead="Notes on glyphs, frames, and markdown surfaces." />

	<ul class="posts" role="list">
		{#each posts as post, i (post.slug)}
			<li class="post">
				<a class="card" href="/blog/{post.slug}">
					<p class="date">{post.date}</p>
					<h2 class="title">{post.title}</h2>
					<p class="teaser">{post.teaser}</p>
					<p class="more">read →</p>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.page {
		max-width: var(--site-max);
		margin: 0 auto;
		padding: 0 var(--pad) 5rem;
	}

	.posts {
		display: flex;
		flex-direction: column;
		margin: 1.5rem 0 0;
		padding: 0;
		list-style: none;
	}

	.post + .post {
		border-top: 1px dashed var(--border);
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 2rem 0;
	}

	@media (max-width: 1024px) {
		.card {
			padding: 1.4rem 0;
		}

		.title {
			font-size: 1.35rem;
		}
	}

	.card:hover .title {
		text-decoration: underline;
		text-decoration-color: var(--text-primary);
		text-underline-offset: 4px;
	}

	.date {
		margin: 0;
		color: var(--text-secondary);
	}

	.title {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 1.6rem;
		letter-spacing: -0.04em;
		font-weight: 600;
		letter-spacing: -0.025em;
		color: var(--text-primary);
	}

	.teaser {
		max-width: 60ch;
		margin: 0;
		line-height: 1.7;
		color: var(--text-secondary);
	}

	.more {
		margin: 0;
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}
</style>
