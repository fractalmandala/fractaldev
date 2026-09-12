<script lang="ts">
	import { SCHEMES } from '$lib/demos/registry';
	import { playground, SCENES, cssVars, fontStack } from '$lib/demos/playground.svelte';
	import SchemeScene from '$lib/demos/components/SchemeScene.svelte';
	import PaletteEditor from '$lib/demos/components/PaletteEditor.svelte';
	import { APP_NAME } from '$lib/utils';

	/**
	 * The Demos Ground — every design scheme in `lib/demos/designs/` rendered
	 * live in four settings with editable tokens. Playground chrome uses the
	 * project's sass vocabulary; each showcased scheme paints itself through
	 * its own `--ds-*` token layer (the sanctioned exception).
	 */

	playground.register(SCHEMES);

	const activeScheme = $derived(
		SCHEMES.find((s) => s.id === playground.activeSchemeId) ?? SCHEMES[0]
	);
	const activePal = $derived(playground.palette(activeScheme?.id ?? ''));
	const activeVars = $derived(activeScheme ? cssVars(activeScheme, activePal) : {});
	const stageStyle = $derived(
		Object.entries(activeVars)
			.map(([k, v]) => `${k}: ${v}`)
			.join('; ')
	);

	const typeRows = $derived.by(() => {
		const t = activeScheme?.typography ?? {};
		return ['display-lg', 'body-md', 'label-md']
			.filter((k) => t[k])
			.map((k) => ({ key: k, spec: t[k]! }));
	});

	const specRows = $derived.by(() => {
		const s = activeScheme?.spacing ?? {};
		const r = activeScheme?.rounded ?? {};
		const entries = [
			['base', s.base],
			['gap', s.gap],
			['card pad', s['card-padding']],
			['section', s['section-padding']],
			['card radius', r.card],
			['control radius', r.control],
			['pill radius', r.pill]
		] as [string, string | undefined][];
		return entries.filter((pair): pair is [string, string] => !!pair[1]);
	});

	function sweepClasses(): string {
		return playground.stageLayout === 'grid' ? 'card-grid' : 'reel pad-bottom-8';
	}

	function isActiveScene(id: string): boolean {
		return playground.scene === id;
	}
</script>

<svelte:head>
	<title>Demos Ground · {APP_NAME}</title>
	<meta
		name="description"
		content="Live design-scheme playground — edit tokens, see every setting repaint."
	/>
</svelte:head>

<div class="main-section" style={stageStyle}>
	<header class="box gap-sm">
		<span class="eyebrow">Creative Ground</span>
		<h1 class="text-3xl weight-600 text-tight">Demos Ground</h1>
		<p class="text-sm text-secondary">
			{SCHEMES.length} design schemes from the corpus, each rendered live in four settings.
			Pick a scheme, edit its palette — surfaces, ink, borders and accents re-tune across
			every scene at once. Chrome follows the house style; each scheme paints itself with
			its own tokens.
		</p>
	</header>

	<!-- Scheme rail: horizontal strip of every scheme's palette -->
	<section class="box gap-sm">
		<div class="row ycenter xbetween">
			<h2 class="text-sm weight-600 text-primary">Schemes</h2>
			<span class="badge">{SCHEMES.length}</span>
		</div>		<div class="reel pad-bottom-8">
			{#each SCHEMES as scheme (scheme.id)}
				{@const p = playground.palette(scheme.id)}
				{@const active = scheme.id === activeScheme?.id}
				<button
					class="button {active ? 'active' : ''}"
					onclick={() => (playground.activeSchemeId = scheme.id)}
					title={scheme.description}
				>
					<span class="box gap-xs w-192">
						<span class="row h-16 wfull">
							<span class="h-16 w-64" style="background: {p.primary};"></span>
							<span class="h-16 w-48" style="background: {p.background};"></span>
							<span class="h-16 w-48" style="background: {p.surface};"></span>
							<span class="h-16 w-24" style="background: {p.accent};"></span>
							<span class="h-16 w-8" style="background: {p['text-primary']};"></span>
						</span>
						<span class="text-xs weight-500 text-primary truncate">{scheme.name}</span>
						<span class="text-xs text-muted truncate">{scheme.tags.slice(0, 3).join(' · ')}</span>
					</span>
				</button>
			{/each}
		</div>
	</section>

	<!-- Stage + editor -->
	<div class="grid-2 gap-lg">
		<section class="box gap-md min0">
			<div class="row ycenter xbetween wrap gap-sm">
				<div class="row gap-xs">
					{#each SCENES as scene (scene.id)}
						<button
							class="button small {isActiveScene(scene.id) ? 'primary' : 'ghost'}"
							onclick={() => (playground.scene = scene.id)}
							title={scene.blurb}
						>
							{scene.label}
						</button>
					{/each}
				</div>
				<div class="row gap-xs">
					<button
						class="button small ghost {playground.typeMode === 'spec' ? 'active' : ''}"
						onclick={() => (playground.typeMode = 'spec')}
						title="Use each scheme's declared type families (system-safe fallbacks)"
					>
						Declared type
					</button>
					<button
						class="button small ghost {playground.typeMode === 'system' ? 'active' : ''}"
						onclick={() => (playground.typeMode = 'system')}
						title="Render all scenes in the house system stack"
					>
						System type
					</button>
				</div>
			</div>

			{#if activeScheme}
				<div class="border radius-md">
					<SchemeScene scheme={activeScheme} pal={activePal} scene={playground.scene} />
				</div>
				<p class="text-xs text-muted">
					{SCENES.find((s) => s.id === playground.scene)?.blurb} · tokens:
					{activeScheme.version || 'unversioned'}
				</p>
			{/if}

			<!-- Type + token specimens -->
			<div class="grid-2 gap-md">
				<div class="box gap-sm pad-md border radius-md">
					<h3 class="text-sm weight-600 text-primary">Type scale</h3>
					{#each typeRows as row (row.key)}
						<div class="box gap-xs">
							<div class="row ycenter xbetween">
								<code class="text-xs text-muted">{row.key}</code>
								<span class="text-xs text-secondary truncate">
									{row.spec.fontFamily} {row.spec.fontSize}
								</span>
							</div>
							<div
								style="
									font-family: {fontStack(row.spec.fontFamily)};
									font-size: {row.spec.fontSize ?? '1rem'};
									font-weight: {row.spec.fontWeight ?? 400};
									line-height: {row.spec.lineHeight ?? 1.5};
									letter-spacing: {row.spec.letterSpacing ?? 'normal'};
									color: var(--text-primary);
								"
							>
								{#if row.key === 'display-lg'}
									Design is a decision
								{:else if row.key === 'body-md'}
									Body copy carries the argument — rhythm, measure and weight keep it readable
									while the palette does the pointing.
								{:else}
									LABEL · TOKEN · SPECIMEN
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<div class="box gap-sm pad-md border radius-md">
					<h3 class="text-sm weight-600 text-primary">Shape &amp; rhythm</h3>
					{#each specRows as pair (pair[0])}
						<div class="row ycenter xbetween">
							<span class="text-xs text-secondary">{pair[0]}</span>
							<code class="text-xs text-muted">{pair[1]}</code>
						</div>
					{/each}
					<div class="row gap-sm pad-top-8 wrap">
						<span
							class="badge"
							style="border-radius: var(--ds-pill-radius, 9999px); background: var(--ds-primary); color: var(--ds-ink-on-primary, #fff);"
						>
							primary
						</span>
						<span
							class="badge"
							style="border-radius: var(--ds-pill-radius, 9999px); background: var(--ds-accent); color: var(--ds-ink-on-accent, #fff);"
						>
							accent
						</span>
						<span
							class="badge"
							style="border-radius: var(--ds-pill-radius, 9999px); border: 1px solid var(--ds-border); color: var(--ds-text-secondary);"
						>
							outline
						</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Palette editor rail -->
		<aside class="box gap-sm pad-md border radius-md min0">
			{#if activeScheme}
				<div class="box gap-xs">
					<h2 class="text-sm weight-600 text-primary">{activeScheme.name}</h2>
					<p class="text-xs text-secondary">{activeScheme.description.slice(0, 160)}…</p>
					<div class="row gap-xs wrap">
						{#each activeScheme.tags.slice(0, 5) as tag (tag)}
							<span class="badge">{tag}</span>
						{/each}
					</div>
				</div>
				<PaletteEditor scheme={activeScheme} />
			{/if}
		</aside>
	</div>

	<!-- Full sweep: every scheme in the active scene -->
	<section class="box gap-md">
		<div class="row ycenter xbetween wrap gap-sm">
			<h2 class="text-lg weight-600 text-tight">The full sweep</h2>
			<div class="row gap-xs">
				<button
					class="button small ghost {playground.stageLayout === 'grid' ? 'active' : ''}"
					onclick={() => (playground.stageLayout = 'grid')}
				>
					Grid
				</button>
				<button
					class="button small ghost {playground.stageLayout === 'reel' ? 'active' : ''}"
					onclick={() => (playground.stageLayout = 'reel')}
				>
					Reel
				</button>
			</div>
		</div>
		<p class="text-xs text-secondary">
			Every scheme rendered in the “{SCENES.find((s) => s.id === playground.scene)?.label}”
			setting with its canonical palette.
		</p>
		<div class={sweepClasses()}>
			{#each SCHEMES as scheme (scheme.id)}
				{@const vars = Object.entries(cssVars(scheme, playground.palette(scheme.id)))
					.map(([k, v]) => `${k}: ${v}`)
					.join('; ')}
				<div class={playground.stageLayout === 'reel' ? 'w-400' : 'wfull'} style={vars}>
				<div class="box gap-xs wfull">
					<div class="row ycenter xbetween">
						<span class="text-xs weight-500 text-primary truncate">{scheme.name}</span>
						<button
							class="button small ghost"
							onclick={() => (playground.activeSchemeId = scheme.id)}
						>
							Open
						</button>
					</div>
					<div class="h-240 wfull">
						<SchemeScene {scheme} pal={playground.palette(scheme.id)} scene={playground.scene} />
					</div>
				</div>
				</div>
			{/each}
		</div>
	</section>
</div>
