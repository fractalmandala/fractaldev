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


<article class="content-section narrow-half">
<div class="richtext">
	<p>Fractalicons is a comprehensive, tree-shakeable icon library for Svelte 5, featuring <b>27,000+ icons</b> across 25 popular open-source icon families, with short, ergonomic import prefixes.</p>
	<ul>
		<li>Built ready for Svelte 5.</li>
		<li>Tree-shakeable: each family compiles to a single module of `IconData` payloads; named imports shake down to just the icons you reference.</li>
		<li>Prefix-cased: fast to type (`lu` for Lucide, `ph` for Phosphor, `re` for Remix, etc.) with full-name aliases preserved.</li>
		<li>
			Color/Stroke Preserved: colors are normalized to `currentColor` and presentation attributes (strokes, stroke-widths, animations, fill styles) are kept intact.
		</li>
	</ul>
</div>
</article>