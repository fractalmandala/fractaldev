<script lang="ts">
	import PageHeader from '$site/components/docs/page-header.svelte';
	import Example from './example.svx';
</script>

<svelte:head>
	<title>Markdown graphs — Markgraphy</title>
	<meta
		name="description"
		content="Write markgraphy components inline in .svx markdown files — one tag between paragraphs, rendered server-side."
	/>
</svelte:head>

<section class="page">
	<PageHeader title="Markdown graphs." kicker="mdsvex">
		<p class="lede">
			This page is written in markdown. Everything under the rule is
			<code>example.svx</code> — a real .svx file imported like a component
			and rendered inside this one. Prose styling comes from one global
			<code>.fg-prose</code> class; the graphs style themselves.
		</p>
	</PageHeader>

	<div class="fg-prose">
		<Example />
	</div>
</section>

<style>
	.page {
		max-width: 56rem;
		margin: 0 auto;
		padding: 0 var(--pad) 5rem;
	}

	.fg-prose {
		margin-top: 2rem;
	}

	.lede {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.88rem;
	}

	.lede code {
		padding: 0.125rem 0.375rem;
		background: var(--text-muted);
		font-size: 0.875rem;
		color: var(--text-primary);
	}

	.fg-prose {
		margin-top: 3rem;
	}
</style>
