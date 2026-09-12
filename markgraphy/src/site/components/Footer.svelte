<script lang="ts">
	import { NPM_URL, GITHUB_URL } from '$site/lib/site';
</script>

<footer>
	<span>amritanshu pandey | fractalmandala </span>
	<nav aria-label="Footer">
		<a href="/docs/skill">skill</a>
		<a href="/llms.txt">llms.txt</a>
		<a href={NPM_URL} rel="noreferrer">npm</a>
		<a href={GITHUB_URL} rel="noreferrer">source</a>
		<span>open source / mit</span>
	</nav>
</footer>

<style>
	footer {
		position: relative;
		z-index: 1;
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		padding: 1rem var(--pad) 1.4rem;
		border-top: 1px dashed var(--border);
		color: var(--text-secondary);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	nav {
		display: flex;
		gap: 1.25rem;
		flex-wrap: wrap;
	}

	a {
		color: var(--text-secondary);
		text-decoration: none;
	}

	a:hover {
		color: var(--text-primary);
	}
</style>
