<script lang="ts">
	import { GITHUB_URL } from '$site/lib/site';
</script>

<section class="section" id="install">
	<div class="close">
		<div>
			<p class="kicker">[ install ]</p>
			<h2 class="display">Put a graph<br />next to the prose.</h2>
			<div class="cta-row">
				<a class="primo" href="/docs/installation">Install in 30 seconds</a>
				<a class="ghost" href="/docs/editor">Open the editor</a>
				<a class="ghost" href={GITHUB_URL} rel="noreferrer">GitHub</a>
			</div>
		</div>
		<p class="close-meta">
			Svelte 5 is the only peer dependency. One optional CSS import, then theming is nine
			<code>--graph-*</code> variables. And a
			<a href="/docs/skill">skill file</a>, so coding agents know when to drop a graph beside the
			writing.
		</p>
	</div>
</section>

<style>
	.section {
		position: relative;
		z-index: 1;
		padding: 3.2rem var(--pad) 4rem;
		border-top: 1px dashed var(--border);
	}

	.close {
		max-width: var(--site-max);
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.3fr 0.7fr;
		gap: 2rem;
		align-items: end;
	}

	.kicker {
		margin: 0 0 0.55rem;
	}

	h2 {
		margin: 0.4rem 0 1rem;
		font-size: clamp(2rem, 5vw, 4.2rem);
	}

	.cta-row {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.close-meta {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	.close-meta a {
		color: var(--text-primary);
		text-decoration: none;
		border-bottom: 1px dotted var(--text-muted);
	}

	.close-meta code {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--graph-accent);
	}

	@media (max-width: 1024px) {
		.section {
			padding: 2.2rem var(--pad) 2.6rem;
		}

		.close {
			grid-template-columns: 1fr;
			gap: 1.2rem;
		}
	}
</style>
