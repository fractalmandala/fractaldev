<script lang="ts">
	import CodePanel from '$lib/demo/CodePanel.svelte';
	import Studio from '$lib/demo/Studio.svelte';
	import Snip from '$lib/demo/Snip.svelte';

	const COMPAT = [
		'Lucide',
		'Tabler',
		'Heroicons outline',
		'Iconoir',
		'Akar',
		'Untitled UI',
		'Hugeicons',
		'shadcn registry'
	];
</script>

<svelte:head>
	<title>morphicons-svelte — any icon morphs into any other</title>
	<meta
		name="description"
		content="A SvelteKit showcase for morphicons-svelte: spring-driven morphs across stroke icon families."
	/>
</svelte:head>

<div class="site-shell">
	<header class="site-header">
		<a class="brand" href="/" aria-label="morphicons-svelte home">
			<span class="brand-mark" aria-hidden="true">✣</span>
			<span>morphicons-svelte</span>
		</a>
		<nav aria-label="Primary navigation">
			<a href="#usage">Usage</a>
			<a href="#compatibility">Compatibility</a>
			<a target="_blank" rel="noreferrer" href="https://www.npmjs.com/package/morphicons-svelte"
				>NPM</a
			>
		</nav>
	</header>

	<main>
		<section class="hero" aria-labelledby="hero-heading">
			<p class="hero-copy">
				A port of <a
					target="_blank"
					style="color: #56D65F"
					rel="noreferrer"
					href="https://www.morphicons.com/">Morphicons</a
				> project into Sveltekit. <a href="#why" style="color: #56D65F">Why?</a>
			</p>

			<h1 id="hero-heading" style="margin-top: 16px">Any icon morphs into any other.</h1>
			<p class="hero-copy">
				Spring-driven path morphing for the icon data you already use. Pick a pair, change the
				stroke, switch the spring, and watch the geometry find its way there.
			</p>
		</section>

		<section id="studio" class="section-wrap" aria-labelledby="studio-heading">
			<div class="section-intro">
				<p class="eyebrow">interactive playground</p>
				<p>
					The studio uses Svelte state for the controls and morphicons&rsquo; shared path driver for
					each transition. Every icon below is data on a 24×24 stroke grid, not a framework-specific
					component.
				</p>
			</div>
			<Studio />
		</section>

		<section id="usage" class="section-wrap usage-wrap" aria-labelledby="usage-heading">
			<div class="section-intro compact">
				<h2 id="usage-heading">The component stays small.</h2>
				<p>
					Keep state in your Svelte component, pass the current icon data, and let the adapter own
					the path after mount. Svelte transitions can handle surrounding UI; the morphicons spring
					handles the shape itself.
				</p>
				<Snip />
			</div>
			<CodePanel />
		</section>

		<section id="compatibility" class="compatibility" aria-labelledby="compatibility-heading">
			<div class="compatibility-inner">
				<div class="section-intro compact">
					<p class="eyebrow">stroke data in, morphs out</p>
					<h2 id="compatibility-heading">Use the icon set you already have.</h2>
					<p>
						Any stroke-based icon family can participate when its paths are normalized to a shared
						grid. The demo shows three families; the adapter does not require a library-specific
						wrapper.
					</p>
				</div>
				<ul class="compatibility-list">
					{#each COMPAT as name}
						<li>{name}</li>
					{/each}
				</ul>
				<p class="compatibility-note">
					Works with any stroke icon set — on any grid, via <code>fitIcon</code>. Fill-only artwork
					is outside this guarantee.
				</p>
			</div>
		</section>
	</main>

	<footer class="site-footer">
		<span>
			<a href="https://www.fractaldesign.in" target="_blank" rel="noreferrer">fractaldesign</a> ·
			<a href="https://www.npmjs.com/package/svelte-animated-icon" target="_blank" rel="noreferrer"
				>svelte-animated-icon</a
			>
			·
			<a href="https://www.npmjs.com/package/fractalsvelte" target="_blank" rel="noreferrer"
				>fractalsvelte</a
			>
		</span>
		<a href="https://github.com/guillermolg00/morphicons" target="_blank" rel="noreferrer">
			morphicons source ↗
		</a>
	</footer>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		min-width: 320px;
		margin: 0;
		color: #ededed;
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	:global(button),
	:global(input) {
		font: inherit;
	}

	.site-header,
	.hero,
	.section-wrap,
	.site-footer {
		width: min(1200px, calc(100% - 48px));
		margin-inline: auto;
	}

	.site-header {
		display: flex;
		min-height: 72px;
		align-items: center;
		justify-content: space-between;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		color: #ededed;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		text-decoration: none;
	}

	.brand-mark {
		display: grid;
		width: 22px;
		height: 22px;
		place-items: center;
		color: #fff;
		font-size: 1.25rem;
		line-height: 1;
	}

	nav {
		display: flex;
		gap: 24px;
	}

	nav a,
	.site-footer a {
		color: #8d8d8d;
		font-size: 0.82rem;
		text-decoration: none;
		transition: color 150ms ease;
	}

	nav a:hover,
	nav a:focus-visible,
	.site-footer a:hover,
	.site-footer a:focus-visible {
		color: #ededed;
	}

	.hero {
		padding: 112px 0 92px;
		text-align: center;
	}

	.eyebrow {
		margin: 0 0 16px;
		color: #11c632;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	h1,
	h2,
	p {
		margin-top: 0;
	}

	h1 {
		max-width: 760px;
		margin-bottom: 22px;
		margin-inline: auto;
		color: #f3f3f3;
		font-size: clamp(3rem, 7vw, 5.9rem);
		font-weight: 600;
		letter-spacing: -0.065em;
		line-height: 0.98;
	}

	h2 {
		margin-bottom: 14px;
		color: #ededed;
		font-size: clamp(1.7rem, 3vw, 2.4rem);
		font-weight: 550;
		letter-spacing: -0.045em;
		line-height: 1.05;
	}

	.hero-copy {
		max-width: 590px;
		margin: 0 auto;
		color: #d6d7d4;
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.section-intro {
		max-width: 900px;
		margin: 0 auto 30px;
		text-align: center;
	}

	.section-intro.compact {
		max-width: 660px;
		margin-bottom: 28px;
	}

	.section-intro p:not(.eyebrow) {
		margin-bottom: 0;
		color: #ededed;
		font-size: 0.98rem;
		line-height: 1.65;
	}

	.usage-wrap {
		padding-top: 108px;
	}

	.compatibility {
		margin-top: 108px;
		border-top: 1px solid #252525;
		background: #080808;
	}

	.compatibility-inner {
		width: min(1200px, calc(100% - 48px));
		margin-inline: auto;
		padding: 86px 0 92px;
	}

	.compatibility-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
		margin: 34px 0 22px;
		padding: 0;
		list-style: none;
	}

	.compatibility-list li {
		display: inline-flex;
		min-height: 38px;
		align-items: center;
		border: 1px solid #2c2c2c;
		border-radius: 999px;
		padding: 0 17px;
		color: #a6a6a6;
		font-size: 0.87rem;
	}

	.compatibility-note {
		margin: 0;
		color: #e2e2e2;
		font-size: 0.86rem;
		text-align: center;
	}

	code {
		color: #d6d6d6;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.92em;
	}

	.site-footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 16px;
		border-top: 1px solid #252525;
		padding: 28px 0 44px;
		color: #6e6e6e;
		font-size: 0.75rem;
	}

	.site-footer span a {
		color: inherit;
		font-size: inherit;
	}

	.site-footer span a:hover {
		color: #ededed;
	}

	:global(:focus-visible) {
		outline: 2px solid #e8e8e8;
		outline-offset: 3px;
	}

	@media (max-width: 700px) {
		.site-header,
		.hero,
		.section-wrap,
		.site-footer,
		.compatibility-inner {
			width: min(100% - 32px, 1200px);
		}

		.site-header {
			min-height: 62px;
		}

		nav {
			gap: 14px;
		}

		nav a:last-child {
			display: none;
		}

		.hero {
			padding: 82px 0 72px;
		}

		.usage-wrap,
		.compatibility {
			margin-top: 78px;
			padding-top: 0;
		}

		.compatibility-inner {
			padding: 64px 0 70px;
		}
	}

	#usage-heading {
		font-size: 21px;
	}
</style>
