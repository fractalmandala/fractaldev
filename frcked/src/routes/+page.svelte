<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getDefaultProps, KIT_CATEGORIES } from '$lib/data/playgroundDefaults';
	import '$lib/components/kit/_kit.sass';

	// Dynamically discover all kit Svelte components via Vite glob
	const modules = import.meta.glob('/src/lib/components/kit/*.svelte');

	type ComponentEntry = {
		name: string;
		path: string;
		category: string;
		loader: () => Promise<any>;
	};

	const allComponents: ComponentEntry[] = Object.entries(modules)
		.map(([path, loader]) => {
			const name = path.split('/').pop()?.replace('.svelte', '') ?? '';
			return {
				name,
				path,
				category: KIT_CATEGORIES[name] ?? 'General',
				loader
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));

	// Unique categories
	const categories = ['All', ...Array.from(new Set(allComponents.map((c) => c.category))).sort()];

	// State
	let searchQuery = $state('');
	let selectedCategory = $state('All');
	let activeName = $state<string | null>(null);
	let activePath = $state<string | null>(null);
	let ActiveComponent = $state<any>(null);
	let isLoading = $state(false);
	let loadError = $state<string | null>(null);
	let renderKey = $state(0);
	let copied = $state(false);

	// Viewport & Stage
	let viewportWidth = $state<'100%' | '768px' | '375px'>('100%');
	let showGrid = $state(false);

	// Filtered list
	const filteredComponents = $derived(
		allComponents.filter((comp) => {
			const query = searchQuery.trim().toLowerCase();
			const matchesQuery = !query || comp.name.toLowerCase().includes(query);
			if (!matchesQuery) return false;

			if (selectedCategory !== 'All' && comp.category !== selectedCategory) {
				return false;
			}
			return true;
		})
	);

	const activeProps = $derived(activeName ? getDefaultProps(activeName) : {});

	async function selectComponent(name: string, path: string, loader: () => Promise<any>, updateUrl = true) {
		activeName = name;
		activePath = path;
		isLoading = true;
		loadError = null;
		ActiveComponent = null;

		if (updateUrl) {
			const url = new URL(page.url);
			url.searchParams.set('c', name);
			goto(url.toString(), { keepFocus: true, replaceState: true, noScroll: true });
		}

		try {
			const mod = await loader();
			ActiveComponent = mod.default;
			renderKey++;
		} catch (err: any) {
			loadError = err?.message || `Failed to load component: ${name}`;
		} finally {
			isLoading = false;
		}
	}

	function reloadCurrent() {
		if (!activeName) return;
		const target = allComponents.find((c) => c.name === activeName);
		if (target) {
			selectComponent(target.name, target.path, target.loader, false);
		}
	}

	async function copyImport() {
		if (!activeName) return;
		const statement = `import { ${activeName} } from '$lib/components/kit';`;
		await navigator.clipboard.writeText(statement);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	onMount(() => {
		const param = page.url.searchParams.get('c');
		const match = param
			? allComponents.find((c) => c.name.toLowerCase() === param.toLowerCase())
			: allComponents.find((c) => c.name === 'Button') || allComponents[0];

		if (match) {
			selectComponent(match.name, match.path, match.loader, false);
		}
	});
</script>

<svelte:head>
	<title>{activeName ? `${activeName} · Kit Playground` : 'Kit Playground'}</title>
</svelte:head>

<div class="playground-wrapper">
	<!-- Left Sidebar -->
	<aside class="sidebar-left border-right playground-sidebar">
		<div class="sidebar-header border-bottom pad-3">
			<div class="row justify-between ycenter mb-2">
				<span class="text-xs font-semibold uppercase tracking-wider text-muted">Kit Components</span>
				<span class="count-badge">{filteredComponents.length} / {allComponents.length}</span>
			</div>
			<div class="search-box">
				<input
					type="search"
					placeholder="Search kit..."
					class="playground-search"
					bind:value={searchQuery}
				/>
			</div>

			<!-- Category Select -->
			<div class="category-select-wrapper mt-2">
				<select class="category-select" bind:value={selectedCategory}>
					{#each categories as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="sidebar-scrollable">
			{#if filteredComponents.length === 0}
				<div class="empty-notice text-center pad-6 text-muted text-xs">
					No components matching "{searchQuery}"
				</div>
			{:else}
				<ul class="component-nav-list">
					{#each filteredComponents as comp (comp.path)}
						<li>
							<button
								type="button"
								class="component-nav-btn {activeName === comp.name ? 'active' : ''}"
								onclick={() => selectComponent(comp.name, comp.path, comp.loader)}
							>
								<span class="component-name">{comp.name}</span>
								<span class="category-tag">{comp.category}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</aside>

	<!-- Main Preview Area -->
	<main class="main-section playground-main">
		{#if !activeName}
			<div class="stage-placeholder text-muted">
				<p>Select a kit component from the sidebar to inspect and preview it.</p>
			</div>
		{:else}
			<!-- Stage Header Toolbar -->
			<div class="playground-stage-toolbar border-bottom pad-3 row justify-between ycenter wrap gap-2">
				<div class="row ycenter gap-2">
					<h1 class="text-base font-bold m-0">{activeName}</h1>
					<span class="file-path-tag text-xs text-muted">
						{activePath?.replace('/src/lib/components/kit/', '')}
					</span>
				</div>

				<div class="row ycenter gap-2">
					<!-- Viewport Selector -->
					<div class="btn-group row gap-1">
						<button
							type="button"
							class="tool-btn {viewportWidth === '100%' ? 'active' : ''}"
							title="Full Viewport (100%)"
							onclick={() => (viewportWidth = '100%')}
						>
							Full
						</button>
						<button
							type="button"
							class="tool-btn {viewportWidth === '768px' ? 'active' : ''}"
							title="Tablet Viewport (768px)"
							onclick={() => (viewportWidth = '768px')}
						>
							768px
						</button>
						<button
							type="button"
							class="tool-btn {viewportWidth === '375px' ? 'active' : ''}"
							title="Mobile Viewport (375px)"
							onclick={() => (viewportWidth = '375px')}
						>
							375px
						</button>
					</div>

					<div class="divider-v"></div>

					<!-- Grid Toggle -->
					<button
						type="button"
						class="tool-btn {showGrid ? 'active' : ''}"
						title="Toggle coordinate grid"
						onclick={() => (showGrid = !showGrid)}
					>
						Grid
					</button>

					<!-- Copy Import -->
					<button
						type="button"
						class="tool-btn"
						title="Copy import statement"
						onclick={copyImport}
					>
						{copied ? '✓ Copied' : 'Import'}
					</button>

					<!-- Reload / Remount -->
					<button
						type="button"
						class="tool-btn"
						title="Reload component"
						onclick={reloadCurrent}
					>
						↻
					</button>
				</div>
			</div>

			<!-- Component Canvas Stage -->
			<div class="stage-viewport-container pad-4">
				<div
					class="stage-frame {showGrid ? 'with-grid' : ''}"
					style="width: {viewportWidth};"
				>
					{#if isLoading}
						<div class="stage-status text-muted pad-8 text-center">
							<span>Loading module for {activeName}...</span>
						</div>
					{:else if loadError}
						<div class="stage-error pad-4 border m-4">
							<div class="row ycenter gap-2 text-danger font-semibold mb-2">
								<span>⚠ Module Resolution Error</span>
							</div>
							<pre class="error-pre text-xs">{loadError}</pre>
							<button class="tool-btn mt-3" onclick={reloadCurrent}>Retry Loading</button>
						</div>
					{:else if ActiveComponent}
						{#key renderKey}
							<div class="component-mount-boundary pad-8">
								<svelte:boundary>
									<ActiveComponent {...activeProps}>
										{#snippet children()}
											<span>{activeName} Content</span>
										{/snippet}
									</ActiveComponent>
									{#snippet failed(error, reset)}
										{@const err = (error instanceof Error ? error : new Error(String(error)))}
										<div class="stage-error pad-4 border">
											<div class="text-danger font-semibold mb-1">Runtime Render Error</div>
											<pre class="error-pre text-xs">{err.message}</pre>
											{#if err.stack}
												<details class="mt-2">
													<summary class="text-xs text-muted cursor-pointer">View Call Stack</summary>
													<pre class="error-pre text-xs mt-1">{err.stack}</pre>
												</details>
											{/if}
											<button class="tool-btn mt-3" onclick={reset}>Reset Component</button>
										</div>
									{/snippet}
								</svelte:boundary>
							</div>
						{/key}
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	/* All backgrounds strictly use var(--bg) only */
	.playground-wrapper {
		display: flex;
		width: 100%;
		min-height: calc(100vh - var(--frk-header-height, 60px) - var(--footer-height, 48px));
		background: var(--bg);
	}

	.playground-sidebar {
		width: 290px;
		min-width: 290px;
		max-width: 290px;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--frk-header-height, 60px) - var(--footer-height, 48px));
		position: sticky;
		top: var(--frk-header-height, 60px);
		box-sizing: border-box;
	}

	.sidebar-header {
		background: var(--bg);
		flex-shrink: 0;
	}

	.playground-search {
		width: 100%;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 6px 10px;
		font-size: 12px;
		color: var(--text-primary);
		outline: none;
		box-sizing: border-box;
	}

	.playground-search:focus {
		border-color: var(--theme-color);
	}

	.category-select-wrapper {
		width: 100%;
	}

	.category-select {
		width: 100%;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 4px 8px;
		font-size: 11px;
		color: var(--text-primary);
		outline: none;
		cursor: pointer;
	}

	.category-select:focus {
		border-color: var(--theme-color);
	}

	.count-badge {
		font-size: 10px;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 9999px;
		padding: 1px 7px;
	}

	.sidebar-scrollable {
		flex: 1;
		overflow-y: auto;
		background: var(--bg);
		padding: 6px;
	}

	.component-nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.component-nav-btn {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 10px;
		background: var(--bg);
		border: 1px solid transparent;
		border-radius: 4px;
		color: var(--text-secondary);
		font-size: 12px;
		cursor: pointer;
		text-align: left;
		transition: all 0.1s ease;
	}

	.component-nav-btn:hover {
		color: var(--text-primary);
		border-color: var(--border);
	}

	.component-nav-btn.active {
		background: var(--bg);
		border-color: var(--theme-color);
		color: var(--theme-color);
		font-weight: 600;
	}

	.category-tag {
		font-size: 9px;
		text-transform: uppercase;
		border: 1px solid var(--border);
		border-radius: 3px;
		padding: 1px 5px;
		color: var(--text-muted);
	}

	.playground-main {
		flex: 1;
		min-width: 0;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		min-height: calc(100vh - var(--frk-header-height, 60px) - var(--footer-height, 48px));
	}

	.playground-stage-toolbar {
		background: var(--bg);
		position: sticky;
		top: var(--frk-header-height, 60px);
		z-index: 10;
	}

	.file-path-tag {
		font-family: monospace;
		padding: 2px 6px;
		border: 1px solid var(--border);
		border-radius: 3px;
	}

	.tool-btn {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		color: var(--text-secondary);
		font-size: 11px;
		padding: 4px 8px;
		cursor: pointer;
		transition: all 0.1s ease;
	}

	.tool-btn:hover {
		border-color: var(--text-primary);
		color: var(--text-primary);
	}

	.tool-btn.active {
		border-color: var(--theme-color);
		color: var(--theme-color);
		font-weight: 600;
	}

	.divider-v {
		width: 1px;
		height: 16px;
		background: var(--border);
	}

	.stage-viewport-container {
		flex: 1;
		background: var(--bg);
		display: flex;
		justify-content: center;
		align-items: flex-start;
		overflow-y: auto;
		padding: 24px;
	}

	.stage-frame {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 8px;
		min-height: 400px;
		transition: width 0.2s ease;
		box-sizing: border-box;
		position: relative;
	}

	.stage-frame.with-grid {
		background-color: var(--bg);
		background-image: radial-gradient(var(--border) 1px, transparent 1px);
		background-size: 16px 16px;
	}

	.component-mount-boundary {
		width: 100%;
		min-height: 200px;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
	}

	.stage-error {
		background: var(--bg);
		border-color: var(--danger, #ef4444);
		border-radius: 6px;
		color: var(--text-primary);
	}

	.error-pre {
		background: var(--bg);
		border: 1px solid var(--border);
		padding: 8px;
		border-radius: 4px;
		overflow-x: auto;
		color: var(--danger, #ef4444);
		font-family: monospace;
	}

	.stage-placeholder {
		margin: auto;
		padding: 48px;
		text-align: center;
	}
</style>