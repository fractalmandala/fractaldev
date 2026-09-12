<script module lang="ts">
	/** A node in a dependency tree. */
	export interface DepNode {
		/** Package or module name. */
		name: string;
		/** Semver or tag string — rendered as a muted tag next to the name. */
		version: string;
		/** Direct dependencies of this package. */
		children?: DepNode[];
		/** Accent the row (e.g. mark the root or a pinned package). */
		accent?: boolean;
	}

	export interface GraphDepsProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. */
		title: string;
		/** Root-level dependencies, each with a name and version. */
		deps: DepNode[];
		/** Maximum depth to render. Default 6. Clamped 1..16. */
		depth?: number;
		/** Animate the cascade. Default true. Reduced motion shows the full tree. */
		animated?: boolean;
		/** Milliseconds between cascading reveals. Default 80. */
		speedMs?: number;
		/** Caption rendered muted under the tree. */
		label?: string;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		deps,
		depth = 6,
		animated = true,
		speedMs = 80,
		label = '',
		class: className = ''
	}: GraphDepsProps = $props();

	// svelte-ignore state_referenced_locally
	const maxDepth = Math.max(1, Math.min(16, depth));

	interface FlatRow {
		key: string;
		branch: string;
		depthMark: string;
		name: string;
		version: string;
		accent?: boolean;
		depth: number;
	}

	function flatten(
		nodes: DepNode[],
		prefix = '',
		trail = 'root',
		isRoot = true,
		currentDepth = 0
	): FlatRow[] {
		const singleRoot = isRoot && nodes.length === 1;
		return nodes.flatMap((node, index) => {
			const last = index === nodes.length - 1;
			const branch = singleRoot ? '' : prefix + (last ? '└─ ' : '├─ ');
			const childPrefix = singleRoot ? '' : prefix + (last ? '   ' : '│  ');
			const row: FlatRow = {
				key: `${trail}/${node.name}@${node.version}-${index}`,
				branch,
				depthMark: '·'.repeat(Math.max(0, currentDepth + (singleRoot ? 0 : 1))),
				name: node.name,
				version: node.version,
				accent: node.accent,
				depth: currentDepth
			};
			const kids =
				node.children && currentDepth < maxDepth
					? flatten(node.children, childPrefix, row.key, false, currentDepth + 1)
					: [];
			return [row, ...kids];
		});
	}

	const rows = $derived(flatten(deps));
	const hasAccent = $derived(rows.some((r) => r.accent));

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	let revealed = $state(0);
	const preRevealed = $derived(moving ? 0 : rows.length);

	$effect(() => {
		revealed = preRevealed;
	});

	$effect(() => {
		if (!moving || rows.length < 2) return;
		const timer = window.setInterval(() => {
			if (revealed >= rows.length) {
				revealed = 0;
			} else {
				revealed = revealed + 1;
			}
		}, Math.max(40, speedMs));
		return () => window.clearInterval(timer);
	});

	const visible = $derived(moving ? revealed : rows.length);

	// Counts for the bottom caption: how many packages and how many roots.
	const totalCount = $derived(rows.length);
	const rootCount = $derived(deps.length);
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="scroll">
			<ul class="tree" role="list">
				{#each rows as row, i (row.key)}
					{#if i < visible}
						<li
							class="row"
							class:dim={hasAccent && !row.accent}
							style="--d: {row.depth}"
						>
							<span class="depth" aria-hidden="true">{row.depthMark}</span>
							<span class="branch" aria-hidden="true">{row.branch}</span>
							<span class="name" class:c-accent={row.accent}>{row.name}</span>
							<span class="at" aria-hidden="true">@</span>
							<span class="version">{row.version}</span>
						</li>
					{/if}
				{/each}
			</ul>
			<span class="sr-only">Dependency tree with {totalCount} packages under {rootCount} roots.</span>
		</div>
		{#if label}
			<p class="caption">{label}</p>
		{/if}
	</GraphBody>
</Graph>

<style>
	.scroll {
		overflow-x: auto;
	}

	.tree {
		display: flex;
		min-width: max-content;
		flex-direction: column;
		gap: 0.22rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.row {
		display: inline-flex;
		align-items: baseline;
		gap: 0.35rem;
		font-size: 0.82rem;
		white-space: nowrap;
		animation: dep-fade 0.32s ease-out;
	}

	@keyframes dep-fade {
		from {
			opacity: 0;
			transform: translateX(0.2rem);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.row {
			animation: none;
		}
	}

	.depth {
		color: var(--text-muted, oklch(0.3 0 0));
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		user-select: none;
		min-width: 0;
	}

	.branch {
		color: var(--border, oklch(0.6 0 0 / 0.5));
		user-select: none;
	}

	.name {
		color: var(--text-primary, oklch(0.93 0 0));
	}

	.c-accent {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.at {
		color: var(--text-muted, oklch(0.3 0 0));
		user-select: none;
	}

	.version {
		color: var(--text-secondary, oklch(0.62 0 0));
		font-size: 0.78rem;
	}

	.dim {
		opacity: 0.55;
	}

	.caption {
		margin: 0.6rem 0 0;
		font-size: 0.78rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border-width: 0;
	}
</style>
