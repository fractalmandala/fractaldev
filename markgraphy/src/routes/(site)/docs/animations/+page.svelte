<script lang="ts">
	import type { Component } from 'svelte';
	import PageHeader from '$site/components/docs/page-header.svelte';
	import { animatedComponents } from '$site/docs/catalog';
	import { SITE_NAME } from '$site/lib/site';
	import {
		GraphAgni,
		GraphAum,
		GraphBoot,
		GraphCron,
		GraphDamru,
		GraphDeps,
		GraphDiya,
		GraphFire,
		GraphFlame,
		GraphFlowPlayer,
		GraphGanga,
		GraphHash,
		GraphJapa,
		GraphLife,
		GraphMandel,
		GraphMandala,
		GraphPulse,
		GraphRain,
		GraphScatter,
		GraphScope,
		GraphSequence,
		GraphSpinners,
		GraphState,
		GraphStream,
		GraphSurya,
		GraphTerminal,
		GraphTicker,
		GraphTypewriter,
		GraphWorkflow
	} from '$lib';

	type DemoEntry = {
		// Component with heterogeneous props — validated against the map below.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Comp: Component<any>;
		props: Record<string, unknown>;
	};

	const demos: Record<string, DemoEntry> = {
		'graph-typewriter': {
			Comp: GraphTypewriter,
			props: { title: 'BOOT', speedMs: 45, lines: ['> boot markgraphy', '> ready'] }
		},
		'graph-workflow': {
			Comp: GraphWorkflow,
			props: {
				title: 'DEPLOY',
				autoPlay: true,
				speedMs: 1100,
				nodes: [
					{ id: 'commit', label: 'commit' },
					{ id: 'lint', label: 'lint' },
					{ id: 'test', label: 'test' },
					{ id: 'build', label: 'build' },
					{ id: 'publish', label: 'publish' }
				]
			}
		},
		'graph-ticker': {
			Comp: GraphTicker,
			props: {
				title: 'FLEET',
				items: [
					{ label: 'api', status: 'ok' },
					{ label: 'db-lag 2.1s', status: 'warn' },
					{ label: 'edge-eu', status: 'down' },
					{ label: 'cdn', status: 'ok' }
				]
			}
		},
		'graph-scope': {
			Comp: GraphScope,
			props: {
				title: 'RPM',
				mode: 'area',
				window: 32,
				rows: 5,
				data: [12, 18, 31, 27, 44, 39, 52, 48, 61, 55, 40, 33, 25, 29, 37, 46, 58, 50, 42, 35]
			}
		},
		'graph-sequence': {
			Comp: GraphSequence,
			props: { title: 'REQUEST', speedMs: 600 }
		},
		'graph-stream': {
			Comp: GraphStream,
			props: { title: 'THROUGHPUT', unit: 'req/s', length: 44, intervalMs: 750 }
		},
		'graph-flow-player': {
			Comp: GraphFlowPlayer,
			props: {
				title: 'PIPELINE',
				autoPlay: true,
				speedMs: 1400,
				steps: [
					{ label: 'scaffold the parser', detail: 'reads the grammar file' },
					{ label: 'emit tokens', detail: 'one pass, no backtracking' },
					{ label: 'render frames', detail: 'dashed borders, four corners' },
					{ label: 'publish', detail: 'npm and done' }
				]
			}
		},
		'graph-ganga': {
			Comp: GraphGanga,
			props: { title: 'GANGES', cols: 60, rows: 18 }
		},
		'graph-hash': {
			Comp: GraphHash,
			props: { title: 'FINGERPRINT', input: 'markgraphy', cols: 16, rows: 6 }
		},
		'graph-japa': {
			Comp: GraphJapa,
			props: { title: 'MALA', cols: 60, rows: 22 }
		},
		'graph-life': {
			Comp: GraphLife,
			props: { title: 'LIFE', cols: 40, rows: 12 }
		},
		'graph-mandel': {
			Comp: GraphMandel,
			props: { title: 'SEAHORSE', cols: 48, rows: 14 }
		},
		'graph-mandala': {
			Comp: GraphMandala,
			props: { title: 'YANTRA', cols: 48, rows: 24, folds: 8, rings: 5 }
		},
		'graph-pulse': {
			Comp: GraphPulse,
			props: { title: 'API', length: 44, intervalMs: 900 }
		},
		'graph-spinners': {
			Comp: GraphSpinners,
			props: { title: 'FETCH', kind: 'bounce', label: 'loading tiles', speedMs: 90 }
		},
		'graph-state': {
			Comp: GraphState,
			props: { title: 'AGENT', speedMs: 700 }
		},
		'graph-agni': {
			Comp: GraphAgni,
			props: { title: 'HAVAN', cols: 44, rows: 12 }
		},
		'graph-aum': {
			Comp: GraphAum,
			props: { title: 'AUM' }
		},
		'graph-boot': {
			Comp: GraphBoot,
			props: {
				title: 'DEPLOY',
				steps: [
					{ label: 'compose up', eta: '~1.2s' },
					{ label: 'migrate', eta: '~0.6s' },
					{ label: 'seed', eta: '~0.4s' },
					{ label: 'healthcheck' },
					{ label: 'release', eta: '~0.8s' }
				]
			}
		},
		'graph-damru': {
			Comp: GraphDamru,
			props: { title: 'BEAT', cols: 60, rows: 16 }
		},
		'graph-diya': {
			Comp: GraphDiya,
			props: { title: 'DIWALI', cols: 60, rows: 14, lamps: 5 }
		},
		'graph-fire': {
			Comp: GraphFire,
			props: { title: 'FURNACE', cols: 48, rows: 10, cooling: 0.55 }
		},
		'graph-flame': {
			Comp: GraphFlame,
			props: { title: 'PROFILE', speedMs: 600 }
		},
		'graph-rain': {
			Comp: GraphRain,
			props: { title: 'RAIN', cols: 48, rows: 12 }
		},
		'graph-surya': {
			Comp: GraphSurya,
			props: { title: 'DAWN', cols: 52, rows: 14 }
		},
		'graph-terminal': {
			Comp: GraphTerminal,
			props: {
				title: 'SHELL',
				lines: [
					{ kind: 'prompt', text: 'pnpm dev' },
					{ kind: 'output', text: '  VITE v5 ready in 312ms' },
					{ kind: 'output', text: '  ➜  Local:   http://localhost:5173/' },
					{ kind: 'output', text: '  ➜  Network: http://192.168.1.10:5173/' }
				]
			}
		},
		'graph-cron': {
			Comp: GraphCron,
			props: { title: 'EVERY 15', expr: '*/15 * * * *', count: 8, baseTime: Date.UTC(2026, 8, 6, 11, 53) }
		},
		'graph-deps': {
			Comp: GraphDeps,
			props: {
				title: 'DEPS',
				deps: [
					{
						name: 'markgraphy',
						version: '0.9.0',
						accent: true,
						children: [
							{ name: 'svelte', version: '^5.0.0' },
							{ name: 'shiki', version: '^4.0.0' }
						]
					},
					{
						name: 'docs',
						version: '0.9.0',
						children: [
							{ name: 'mdsvex', version: '^0.12.0' },
							{ name: 'vite', version: '^5.0.0' }
						]
					}
				]
			}
		},
		'graph-scatter': {
			Comp: GraphScatter,
			props: {
				title: 'CORRELATION',
				trend: true,
				data: [
					{ x: 1.2, y: 0.8 },
					{ x: 2.0, y: 1.4 },
					{ x: 2.5, y: 1.6 },
					{ x: 3.1, y: 2.1 },
					{ x: 3.6, y: 2.4 },
					{ x: 4.0, y: 2.7 },
					{ x: 4.5, y: 2.9 },
					{ x: 5.0, y: 3.3 },
					{ x: 5.4, y: 3.4, accent: true },
					{ x: 5.9, y: 3.7 },
					{ x: 6.3, y: 4.0 },
					{ x: 6.8, y: 4.1 }
				]
			}
		}
	};
</script>

<svelte:head>
	<title>Animations — {SITE_NAME}</title>
	<meta
		name="description"
		content="Twenty-nine live glyph components — typewriters, tickers, scopes, sims, vedic figures, a scripted terminal, a typed workflow player, and three data-viz utilities — all running on one page."
	/>
</svelte:head>

<div class="page">
	<PageHeader
		title="Everything moving."
		kicker="animations"
		lead="Twenty-nine live glyph components on one page. Same dashed frames and --graph-* tokens as the rest of the library, one accent. Every unit freezes to a meaningful static frame under prefers-reduced-motion or animated={false}."
	/>

	<ul class="wall" role="list">
		{#each animatedComponents as item (item.slug)}
			{@const demo = demos[item.slug]}
			<li class="tile">
				<div class="plate">
					<div class="demo">
						<demo.Comp {...demo.props} />
					</div>
				</div>
				<div class="row">
					<a class="name" href={`/docs/${item.slug}`}>[ {item.title} ]</a>
					<span class="desc">{item.description}</span>
				</div>
			</li>
		{/each}
	</ul>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 2.4rem;
	}

	.wall {
		display: grid;
		gap: 1.1rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	@media (min-width: 900px) {
		.wall {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.tile {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		min-width: 0;
	}

	.plate {
		flex: 1;
		padding: 1.8rem 1.3rem 1.2rem;
		background: var(--bg-raised);
	}

	@media (max-width: 1024px) {
		.page {
			gap: 1.6rem;
		}

		.wall {
			gap: 0.9rem;
		}

		.plate {
			padding: 1.2rem 1rem 1rem;
		}
	}

	.demo {
		min-width: 0;
		overflow-x: auto;
	}

	.row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		padding: 0 0.2rem;
	}

	.name {
		flex-shrink: 0;
		color: var(--text-primary);
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.name:hover {
		color: var(--graph-accent);
	}

	.desc {
		color: var(--text-secondary);
		font-size: 0.78rem;
		text-align: right;
		text-wrap: pretty;
	}
</style>
