<script lang="ts">
	// Static 1200x630 Open Graph card. Screenshot this route at exactly
	// 1200x630 into public/og.png (see +layout.svelte meta).
	export const prerender = true;
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="card">
	<div class="frame">
		<span class="corner tl" aria-hidden="true">+</span>
		<span class="corner tr" aria-hidden="true">+</span>
		<span class="corner bl" aria-hidden="true">+</span>
		<span class="corner br" aria-hidden="true">+</span>
		<span class="title" aria-hidden="true">[ FRACTALGRAPHY ]</span>
		<div class="body">
			<h1>Graphs as text.</h1>
			<p class="lede">
				ASCII-framed Svelte graphs for markdown — dashed frames, block
				glyphs, one accent. No SVG. No dependencies.
			</p>
			<div class="row" aria-hidden="true">
				<span class="bar">██████████████████▓▓▓▓▒▒░░</span>
				<span class="muted">uptime 99.98%</span>
			</div>
			<div class="row" aria-hidden="true">
				<span class="bar short">████████▓▓▓▓▒▒▒░░░░</span>
				<span class="muted">reads 12,400</span>
			</div>
			<p class="install">pnpm add markgraphy</p>
		</div>
	</div>
</div>

<style>
	.card {
		width: 1200px;
		height: 630px;
		display: grid;
		place-items: center;
		background: oklch(0.11 0 0);
		color: oklch(0.86 0 0);
	}

	.frame {
		position: relative;
		display: flex;
		align-items: center;
		width: 1024px;
		height: 470px;
		padding: 3rem;
		box-sizing: border-box;
		background-image:
			repeating-linear-gradient(to right, oklch(0.48 0 0) 0 2px, transparent 2px 7px),
			repeating-linear-gradient(to bottom, oklch(0.48 0 0) 0 2px, transparent 2px 7px),
			repeating-linear-gradient(to right, oklch(0.48 0 0) 0 2px, transparent 2px 7px),
			repeating-linear-gradient(to bottom, oklch(0.48 0 0) 0 2px, transparent 2px 7px);
		background-repeat: repeat-x, repeat-y, repeat-x, repeat-y;
		background-position:
			0 0,
			100% 0,
			0 100%,
			0 0;
		background-size:
			100% 1px,
			1px 100%,
			100% 1px,
			1px 100%;
	}

	.corner {
		position: absolute;
		background: oklch(0.11 0 0);
		font-size: 1.5rem;
		line-height: 1;
		color: oklch(0.48 0 0);
	}

	.tl {
		top: 0;
		left: 0;
		transform: translate(-50%, -50%);
	}

	.tr {
		top: 0;
		right: 0;
		transform: translate(50%, -50%);
	}

	.bl {
		bottom: 0;
		left: 0;
		transform: translate(-50%, 50%);
	}

	.br {
		right: 0;
		bottom: 0;
		transform: translate(50%, 50%);
	}

	.title {
		position: absolute;
		top: 0;
		left: 3rem;
		transform: translateY(-50%);
		padding: 0 0.625rem;
		background: oklch(0.11 0 0);
		font-size: 1.25rem;
		letter-spacing: 0.05em;
		color: oklch(0.78 0.17 155);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	h1 {
		margin: 0;
		font-size: 3.5rem;
		font-weight: 600;
		letter-spacing: -0.025em;
	}

	.lede {
		max-width: 62ch;
		margin: 0;
		font-size: 1.25rem;
		line-height: 1.6;
		color: oklch(0.62 0 0);
	}

	.row {
		display: flex;
		align-items: baseline;
		gap: 1.5rem;
	}

	.bar {
		color: oklch(0.78 0.17 155);
	}

	.bar.short {
		color: oklch(0.78 0.12 70);
	}

	.muted {
		color: oklch(0.62 0 0);
	}

	.install {
		margin: 1rem 0 0;
		font-size: 1.25rem;
		color: oklch(0.86 0 0);
	}
</style>
