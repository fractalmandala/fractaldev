<script lang="ts">
	import Icon from 'fractalicons/Icon.svelte';
	import type { IconData } from 'fractalicons';

	interface IconSet {
		id: string;
		label: string;
		prefix: string;
	}

	interface LoadedIcon {
		exportName: string;
		data: IconData;
	}

	const SETS: IconSet[] = [
		{ id: 'lucide', label: 'Lucide', prefix: 'lu' },
		{ id: 'phosphor', label: 'Phosphor', prefix: 'ph' },
		{ id: 'phosphorfill', label: 'Phosphor Fill', prefix: 'phf' },
		{ id: 'remix', label: 'Remix Line', prefix: 're' },
		{ id: 'remixfill', label: 'Remix Fill', prefix: 'ref' },
		{ id: 'tabler', label: 'Tabler', prefix: 'tb' },
		{ id: 'tablerfill', label: 'Tabler Filled', prefix: 'tbf' },
		{ id: 'iconoir', label: 'Iconoir', prefix: 'ic' },
		{ id: 'iconoirfill', label: 'Iconoir Fill', prefix: 'icf' },
		{ id: 'heroicons', label: 'Heroicons', prefix: 'he' },
		{ id: 'heroiconsfill', label: 'Heroicons Solid', prefix: 'hef' },
		{ id: 'feathericons', label: 'Feather', prefix: 'fe' },
		{ id: 'octicons', label: 'Octicons', prefix: 'oc' },
		{ id: 'fontawesome', label: 'Font Awesome', prefix: 'far' },
		{ id: 'fontawesomesolid', label: 'Font Awesome Solid', prefix: 'fas' },
		{ id: 'boxregular', label: 'Boxicons', prefix: 'bx' },
		{ id: 'boxsolid', label: 'Boxicons Solid', prefix: 'bxs' },
		{ id: 'coreui', label: 'CoreUI', prefix: 'cu' },
		{ id: 'anticons', label: 'Ant Design', prefix: 'an' },
		{ id: 'famicons', label: 'Famicons', prefix: 'fa' },
		{ id: 'circum', label: 'Circum', prefix: 'ci' },
		{ id: 'cssgg', label: 'css.gg', prefix: 'gg' },
		{ id: 'simple', label: 'Simple Icons', prefix: 'si' },
		{ id: 'simpleline', label: 'Simple Line', prefix: 'sl' },
		{ id: 'materialanim', label: 'Material Animated', prefix: 'maa' }
	];

	// Explicit loader map so Vite can code-split one chunk per set.
	// Each set loads lazily only when selected.
	// NOTE: extensionless (`fractalicons/lucide`) — the package exposes
	// explicit per-family subpaths resolving to dist/*.js + dist/*.d.ts,
	// so a `.js` suffix would break type resolution.
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

	let activeSet = $state('lucide');
	let icons = $state<LoadedIcon[]>([]);
	let loading = $state(false);
	let loadError = $state<string | null>(null);
	let query = $state('');
	let visibleCount = $state(PAGE_SIZE);
	let iconSize = $state(28);
	let copied = $state<string | null>(null);
	let counts = $state<Record<string, number>>({});
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const activeMeta = $derived(SETS.find((s) => s.id === activeSet) ?? SETS[0]);

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

	async function loadSet(id: string) {
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
			// Module exports each icon twice (short `luX` + long `lucideX`).
			// Dedupe by set:name, keeping the shortest export name.
			const byIcon = new Map<string, LoadedIcon>();
			const keys = Object.keys(mod).sort((a, b) => a.length - b.length);
			for (const exportName of keys) {
				const value = mod[exportName];
				if (!isIconData(value)) continue;
				const key = `${value.set}:${value.name}`;
				if (!byIcon.has(key)) byIcon.set(key, { exportName, data: value });
			}
			const list = [...byIcon.values()].sort((a, b) =>
				a.exportName.localeCompare(b.exportName)
			);
			icons = list;
			counts = { ...counts, [id]: list.length };
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

	function selectSet(id: string) {
		if (id === activeSet && icons.length > 0) return;
		activeSet = id;
		query = '';
		copied = null;
	}

	async function copyIcon(exportName: string) {
		const snippet = `import { ${exportName} } from 'fractalicons/${activeSet}';`;
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
		loadSet(activeSet);
	});
</script>

<svelte:head>
	<title>Icons · fractalutils</title>
</svelte:head>

<div class="box gap-bs pad-bs icons-page">
	<header class="box gap-8">
		<p class="eyebrow text-muted">fractalicons</p>
		<h1 class="text-3xl bold">Icons</h1>
		<p class="text-secondary text-md">
			{SETS.length} sets · pick a set to browse every icon in it. Click any icon to copy
			its import.
		</p>
	</header>

	<!-- Set filters -->
	<div
		class="row gap-8 filters"
		role="tablist"
		aria-label="Icon sets"
	>
		{#each SETS as set (set.id)}
			{@const count = counts[set.id]}
			<button
				type="button"
				role="tab"
				aria-selected={set.id === activeSet}
				class="pill"
				class:active={set.id === activeSet}
				onclick={() => selectSet(set.id)}
			>
				<span>{set.label}</span>
				<span class="pill-prefix mono">· {set.prefix}</span>
				{#if count !== undefined}
					<span class="pill-count mono">{count}</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Toolbar -->
	<div class="row ycenter gap-bs toolbar">
		<label class="field grow">
			<span class="field-label">Search {activeMeta.label}</span>
			<input
				type="search"
				placeholder="Filter by export name, e.g. {activeMeta.prefix}Activity…"
				bind:value={query}
				autocomplete="off"
				spellcheck={false}
			/>
		</label>
		<label class="size-field">
			<span class="field-label">Size · <span class="mono">{iconSize}px</span></span>
			<input type="range" min="16" max="48" step="1" bind:value={iconSize} />
		</label>
	</div>

	<p class="text-muted text-sm mono status" aria-live="polite">
		{#if loading}
			Loading {activeMeta.label}…
		{:else if loadError}
			{activeMeta.label} · failed to load
		{:else}
			{filtered.length} icon{filtered.length === 1 ? '' : 's'} in {activeMeta.label}
			{#if query.trim()}
				matching “{query.trim()}”
			{/if}
			· showing {visible.length}
		{/if}
	</p>

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
				<button type="button" class="pill active" onclick={() => loadSet(activeSet)}>
					Retry
				</button>
			</div>
		</div>
	{:else if filtered.length === 0}
		<div class="card pad-bs box gap-8">
			<p class="bold">No icons found</p>
			<p class="text-secondary text-sm">
				Nothing in {activeMeta.label} matches “{query}”. Try a shorter term.
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
				<button
					type="button"
					class="pill active"
					onclick={() => (visibleCount += PAGE_SIZE)}
				>
					Show more · {filtered.length - visible.length} remaining
				</button>
			</div>
		{/if}

		<details class="card pad-bs usage">
			<summary class="bold">Usage</summary>
			<pre class="mono text-sm"><code>{`import Icon from 'fractalicons/Icon.svelte';
import { ${visible[0]?.exportName ?? activeMeta.prefix + 'Activity'} } from 'fractalicons/${activeSet}';

<Icon icon={${visible[0]?.exportName ?? activeMeta.prefix + 'Activity'}} size={24} />`}</code></pre>
		</details>
	{/if}
</div>

<style>
	.icons-page {
		max-width: 1200px;
		margin-inline: auto;
		width: 100%;
	}
	.filters {
		flex-wrap: wrap;
		position: sticky;
		top: 0;
		z-index: 5;
		padding-block: 0.5rem;
		background: color-mix(in srgb, var(--surface, #fff) 88%, transparent);
		backdrop-filter: blur(8px);
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid var(--border, #e2e8f0);
		background: var(--panel, #fff);
		color: var(--text-secondary, #475569);
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		font-size: 0.85rem;
		cursor: pointer;
		white-space: nowrap;
	}
	.pill:hover {
		border-color: var(--accent, #6366f1);
		color: var(--text-primary, #0f172a);
	}
	.pill.active {
		background: var(--text-primary, #0f172a);
		border-color: var(--text-primary, #0f172a);
		color: var(--text-inverse, #fff);
	}
	.pill-prefix {
		opacity: 0.65;
		font-size: 0.75rem;
	}
	.pill-count {
		font-size: 0.72rem;
		opacity: 0.7;
		background: color-mix(in srgb, currentColor 12%, transparent);
		border-radius: 999px;
		padding: 0.05rem 0.45rem;
	}
	.toolbar {
		flex-wrap: wrap;
		align-items: end;
	}
	.size-field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 170px;
	}
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
