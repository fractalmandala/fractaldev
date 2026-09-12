<script lang="ts">
	// Room 04 — install. Three stations: add the package (manager tabs feed
	// the copy command), import the theme once, drop a graph. A live GraphStat
	// plate proves the result; the token bay lists the six theming variables.
	import { GraphStat } from '$lib';
	import CopyCode from '$site/components/docs/copy-code.svelte';

	const managers = ['pnpm', 'npm', 'bun'] as const;
	type Manager = (typeof managers)[number];

	const commands: Record<Manager, string> = {
		pnpm: 'pnpm add markgraphy',
		npm: 'npm install markgraphy',
		bun: 'bun add markgraphy'
	};

	let manager = $state<Manager>('pnpm');
	const command = $derived(commands[manager]);

	const tokens = [
		{ name: '--graph-accent', note: 'The one highlight.' },
		{ name: '--graph-accent-2', note: 'Second series.' },
		{ name: '--graph-accent-3', note: 'Third cycle.' },
		{ name: '--border', note: 'Dashed edge color.' },
		{ name: '--text-primary', note: 'Primary ink.' },
		{ name: '--bg', note: 'Plain black. #000.' }
	];

	const stats = [
		{ value: '12,400', label: 'docs' },
		{ value: '4,100', label: 'copies' },
		{ value: '860', label: 'shipped', accent: true }
	];
</script>

<svelte:head>
	<title>Install — markgraphy</title>
	<meta name="description" content="One npm package. Svelte 5 is the only peer. Theming is six CSS variables." />
</svelte:head>

<section class="install">


	<div class="bench">
		<article class="station on">
			<p class="st-num">[ station 01 ]</p>
			<h2>Add the package.</h2>
			<p>Graphs, frame, and theme in one install.</p>
			<div class="pkg" role="group" aria-label="Package manager">
				{#each managers as id (id)}
					<button
						type="button"
						class="tab"
						aria-pressed={manager === id}
						onclick={() => (manager = id)}
					>
						[ {id} ]
					</button>
				{/each}
			</div>
			<div class="cmd">
				<code>{command}</code>
				<CopyCode text={command} label="copy" />
			</div>
		</article>

		<article class="station">
			<p class="st-num">[ station 02 ]</p>
			<h2>Import the base tokens.</h2>
			<p>In the root <code>+layout.svelte</code>.</p>
			<div class="import-box">
				<header><span>+layout.svelte</span></header>
				<pre><span class="tok">import</span> 'fractalstyler2/styles';
<span class="tok">import</span> 'markgraphy/styles/index.sass';

let &#123; children &#125; = $props();</pre>
			</div>
		</article>

		<article class="station">
			<p class="st-num">[ station 03 ]</p>
			<h2>Drop a graph.</h2>
			<p>Import any graph from <code>markgraphy</code>.</p>
			<div class="import-box">
				<header><span>page</span></header>
				<pre><span class="tok">import</span> &#123; GraphStat &#125; from '<span class="tok">markgraphy</span>';

&lt;GraphStat title="THIS WEEK" items=&#123;items&#125; /&gt;</pre>
			</div>
		</article>
	</div>

	<div class="live-row">
		<div class="svx">
			<p class="eyebrow">[ markdown ]</p>
			<h3>Use in a .svx file</h3>
			<pre>&lt;script&gt;
  <span class="tok">import</span> &#123; GraphMeter &#125; from '<span class="tok">markgraphy</span>';
&lt;/script&gt;

&lt;GraphMeter title="SHIPPED" value=&#123;0.67&#125; caption="of plan" /&gt;</pre>
		</div>
	</div>

	<div class="tokens">
		<p class="eyebrow">[ tokens ]</p>
		<div class="token-bay">
			{#each tokens as token (token.name)}
				<div class="token">
					<code>{token.name}</code>
					<p>{token.note}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.install {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: calc(100svh - 3.4rem);
		padding-bottom: 2rem;
	}

	.bench {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-left: 1px dashed var(--border);
		border-right: 1px dashed var(--border);
	}

	.station {
		padding: 1.5rem 1.2rem 1.4rem;
		border-right: 1px dashed var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		min-height: 280px;
		min-width: 0;
	}

	.station:last-child {
		border-right: 0;
	}

	.station.on {
		background: color-mix(in oklab, var(--graph-accent) 6%, var(--bg));
	}

	.st-num {
		margin: 0;
		color: var(--text-muted);
		letter-spacing: 0.16em;
		font-size: 0.66rem;
		text-transform: uppercase;
	}

	.station h2 {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 1.45rem;
		letter-spacing: -0.04em;
	}

	.station p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.85rem;
		max-width: 36ch;
	}

	.pkg {
		display: flex;
		gap: 0.3rem;
		flex-wrap: wrap;
	}

	.tab {
		color: var(--text-secondary);
		padding: 0 0.7rem;
		min-height: 36px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-size: 0.62rem;
		border: 1px solid var(--border);
		background: transparent;
	}

	.tab:hover {
		color: var(--text-primary);
		border-color: var(--text-primary);
	}

	.tab[aria-pressed='true'] {
		color: var(--bg);
		background: var(--text-primary);
		border-color: var(--text-primary);
	}

	.cmd {
		border: 1px solid var(--border);
		background: var(--bg-terminal, #0c0c0c);
		padding: 0.85rem 0.9rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.8rem;
	}

	.cmd code {
		font-size: 0.78rem;
	}

	.station .import-box {
		margin-top: auto;
	}

	.live-row {
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 1rem;
		padding: 1.3rem 0 0;
	}

	.plate {
		min-height: 220px;
		padding: 1.8rem 1.3rem 1.2rem;
		background: var(--bg-raised);
		display: grid;
		align-items: center;
	}

	.svx {
		border: 1px dashed var(--border);
		padding: 1.3rem 1.2rem;
		min-width: 0;
	}

	.svx h3 {
		margin: 0.4rem 0 0.35rem;
		font-family: var(--font-sans);
		font-size: 1.1rem;
		letter-spacing: -0.03em;
	}

	.svx pre {
		margin: 0.7rem 0 0;
		color: var(--text-primary);
		font-size: 0.8rem;
		line-height: 1.55;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.tokens {
		padding: 1.4rem 0 0.4rem;
	}

	.tokens > .eyebrow {
		display: block;
		margin: 0 0 0.7rem;
	}

	.token-bay {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: 1px dashed var(--border);
	}

	.token {
		padding: 0.9rem 1rem;
		border-right: 1px dashed var(--border);
		border-bottom: 1px dashed var(--border);
	}

	.token:nth-child(3n) {
		border-right: 0;
	}

	.token code {
		color: var(--text-primary);
		font-size: 0.78rem;
	}

	.token p {
		margin: 0.3rem 0 0;
		color: var(--text-secondary);
		font-size: 0.75rem;
	}

	@media (max-width: 1024px) {
		.bench {
			grid-template-columns: 1fr;
		}

		.station {
			border-right: 0;
			border-bottom: 1px dashed var(--border);
			min-height: 0;
			padding: 1.2rem 1rem 1.1rem;
			gap: 0.7rem;
		}

		.station h2 {
			font-size: 1.3rem;
		}

		.station:last-child {
			border-bottom: 0;
		}

		.live-row {
			grid-template-columns: 1fr;
		}

		.plate {
			padding: 1.3rem 1rem 1.1rem;
		}

		.svx {
			padding: 1rem;
		}

		.token-bay {
			grid-template-columns: 1fr 1fr;
		}

		.token {
			padding: 0.75rem 0.85rem;
		}

		.token:nth-child(3n) {
			border-right: 1px dashed var(--border);
		}

		.token:nth-child(2n) {
			border-right: 0;
		}
	}
</style>
