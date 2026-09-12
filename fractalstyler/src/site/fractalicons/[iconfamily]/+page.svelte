<script lang="ts">
	import Icon from 'fractalicons/Icon.svelte';
	import type { IconData } from 'fractalicons';
	import { iconFamilies } from '$lib/data/iconfamilies.js';

	interface LoadedIcon {
		exportName: string;
		data: IconData;
	}

	let { data } = $props();

	// Explicit loader map so Vite can code-split one chunk per set.
	const loaders: Record<string, () => Promise<Record<string, unknown>>> = {
		lucide: () => import('fractalicons/lucide'),
		phosphor: () => import('fractalicons/phosphor'),
		phosphorfill: () => import('fractalicons/phosphorfill'),
		remix: () => import('fractalicons/remix'),
		remixfill: () => import('fractalicons/remixfill'),
		tabler: () => import('fractalicons/tabler'),
		tablerfill: () => import('fractalicons/tablerfill'),
		iconoir: () => import('fractalicons/iconoir'),
		iconoirfill: () => import('fractalicons/iconoirfill'),
		heroicons: () => import('fractalicons/heroicons'),
		heroiconsfill: () => import('fractalicons/heroiconsfill'),
		feathericons: () => import('fractalicons/feathericons'),
		octicons: () => import('fractalicons/octicons'),
		fontawesome: () => import('fractalicons/fontawesome'),
		fontawesomesolid: () => import('fractalicons/fontawesomesolid'),
		boxregular: () => import('fractalicons/boxregular'),
		boxsolid: () => import('fractalicons/boxsolid'),
		coreui: () => import('fractalicons/coreui'),
		anticons: () => import('fractalicons/anticons'),
		famicons: () => import('fractalicons/famicons'),
		circum: () => import('fractalicons/circum'),
		cssgg: () => import('fractalicons/cssgg'),
		simple: () => import('fractalicons/simple'),
		simpleline: () => import('fractalicons/simpleline'),
		materialanim: () => import('fractalicons/materialanim')
	};

	const PAGE_SIZE = 240;

	const family = $derived(data.family);

	let icons = $state<LoadedIcon[]>([]);
	let loading = $state(false);
	let loadError = $state<string | null>(null);
	let query = $state('');
	let visibleCount = $state(PAGE_SIZE);
	let iconSize = $state(28);
	let copied = $state<string | null>(null);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return icons;
		return icons.filter((i) => i.exportName.toLowerCase().includes(q));
	});

	const visible = $derived(filtered.slice(0, visibleCount));

	function isIconData(v: unknown): v is IconData {
		if (!v || typeof v !== 'object') return false;
		const o = v as Record<string, unknown>;
		return (
			typeof o.name === 'string' &&
			typeof o.set === 'string' &&
			typeof o.viewBox === 'string' &&
			typeof o.body === 'string'
		);
	}

	async function loadFamily(id: string) {
		const loader = loaders[id];
		if (!loader) {
			loadError = `No loader for set "${id}".`;
			icons = [];
			return;
		}
		loading = true;
		loadError = null;
		visibleCount = PAGE_SIZE;
		try {
			const mod = await loader();
			const byIcon = new Map<string, LoadedIcon>();
			const keys = Object.keys(mod).sort((a, b) => a.length - b.length);
			for (const exportName of keys) {
				const value = mod[exportName];
				if (!isIconData(value)) continue;
				const key = `${value.set}:${value.name}`;
				if (!byIcon.has(key)) byIcon.set(key, { exportName, data: value });
			}
			const list = [...byIcon.values()].sort((a, b) => a.exportName.localeCompare(b.exportName));
			icons = list;
		} catch (e) {
			console.error(e);
			icons = [];
			loadError =
				`Could not load "${id}" from the installed fractalicons package. ` +
				`If this set is new, update the dependency (npm i fractalicons@latest ` +
				`or file:../fractalicons) and retry.`;
		} finally {
			loading = false;
		}
	}

	async function copyIcon(exportName: string) {
		const snippet = `import { ${exportName} } from 'fractalicons/${family.id}';`;
		try {
			await navigator.clipboard.writeText(snippet);
		} catch {
			const ta = document.createElement('textarea');
			ta.value = snippet;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			ta.remove();
		}
		copied = exportName;
		if (copyTimer) clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = null), 1400);
	}

	$effect(() => {
		loadFamily(family.id);
	});
</script>

<svelte:head>
	<title>{family.label} · Icons · fractalutils</title>
</svelte:head>

<article class="content-section">
	<header class="article-header box">
		<h1 class="text-tight-lg">{family.label}</h1>
		<p class="text-secondary text-md">{family.count} Icons</p>
		<div class="box gap-xs marg-top-sm">
			<label class="field grow">
				<input
					class="input search"
					type="search"
					placeholder="Search {family.label} icons..."
					bind:value={query}
					autocomplete="off"
					spellcheck={false}
				/>
			</label>
			<label class="row ycenter gap-xs">
				<span class="text-sm text-secondary">Size · <span>{iconSize}px</span></span>
				<input type="range" min="16" max="48" step="1" bind:value={iconSize} />
			</label>
		</div>
	</header>
	<div class="box gap-bs">
		<p class="text-muted text-sm mono status" aria-live="polite"></p>
		{#if loading}
			<div class="card-grid gap-bs" aria-hidden="true">
				{#each Array(PAGE_SIZE / 4) as _, i (i)}
					<div class="card icon-card skeleton"><div class="skeleton-box"></div></div>
				{/each}
			</div>
		{:else if loadError}
			<div class="card pad-bs box gap-8">
				<p class="bold">Set unavailable</p>
				<p class="text-secondary text-sm">{loadError}</p>
				<div>
					<button type="button" class="pill active" onclick={() => loadFamily(family.id)}>
						Retry
					</button>
				</div>
			</div>
		{:else if filtered.length === 0}
			<div class="card pad-bs box gap-8">
				<p class="bold">No icons found</p>
				<p class="text-secondary text-sm">
					Nothing in {family.label} matches "{query}". Try a shorter term.
				</p>
			</div>
		{:else}
			<div class="icon-grid">
				{#each visible as item (item.exportName)}
					<button
						type="button"
						class="card icon-card"
						title={item.exportName}
						onclick={() => copyIcon(item.exportName)}
					>
						<span class="icon-glyph">
							<Icon icon={item.data} size={iconSize} />
						</span>
						<span class="mono icon-name truncate">{item.exportName}</span>
						<span class="copy-hint text-xs text-muted">
							{copied === item.exportName ? 'Copied ✓' : 'Click to copy'}
						</span>
					</button>
				{/each}
			</div>

			{#if visible.length < filtered.length}
				<div class="row xcenter">
					<button type="button" class="pill active" onclick={() => (visibleCount += PAGE_SIZE)}>
						Show more · {filtered.length - visible.length} remaining
					</button>
				</div>
			{/if}

			<details class="card pad-bs usage">
				<summary class="bold">Usage</summary>
				<pre class="mono text-sm"><code
						>{`import Icon from 'fractalicons/Icon.svelte';
import { ${visible[0]?.exportName ?? family.prefix + 'Activity'} } from 'fractalicons/${family.id}';

<Icon icon={${visible[0]?.exportName ?? family.prefix + 'Activity'}} size={24} />`}</code
					></pre>
			</details>
		{/if}
	</div>
</article>

<style>
	.status {
		margin: 0;
	}
	.icon-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
		gap: 0.75rem;
	}
	.icon-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 0.6rem 0.8rem;
		cursor: pointer;
		text-align: center;
	}
	button.icon-card:hover {
		border-color: var(--accent, #6366f1);
		transform: translateY(-1px);
	}
	.icon-glyph {
		display: grid;
		place-items: center;
		min-height: 48px;
		color: var(--text-primary, #0f172a);
	}
	.icon-name {
		max-width: 100%;
		font-size: 0.72rem;
	}
	.copy-hint {
		opacity: 0;
		transition: opacity 0.15s ease;
	}
	.icon-card:hover .copy-hint,
	.icon-card:focus-visible .copy-hint {
		opacity: 1;
	}
	.skeleton {
		min-height: 132px;
	}
	.skeleton-box {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: color-mix(in srgb, currentColor 10%, transparent);
		animation: pulse 1.2s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.4;
		}
	}
	.usage pre {
		overflow-x: auto;
		background: var(--canvas, #0f172a);
		color: var(--text-inverse, #fff);
		border-radius: 8px;
		padding: 1rem;
	}
</style>
