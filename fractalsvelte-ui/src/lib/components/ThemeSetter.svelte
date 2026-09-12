<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { AuraPreset } from '#lib/data/auras.ts';
	import { gradientAppearance, patternAppearance } from '#lib/data/background-appearance.ts';
	import type { Pattern, PatternCategory } from '#lib/data/patterns.ts';
	import type { ThemeFamily, ThemeMode } from '#lib/data/theme-families.ts';
	import type { BgStyle, ThemeInfo } from '#lib/data/themes.ts';

	type Tab = 'theme' | 'auras' | 'gradients' | 'patterns';
	type AccentSource = 'preset' | 'custom';
	type BackgroundSelection =
		| { style: 'plain' }
		| { style: 'aura'; id: string }
		| { style: 'gradient'; id: string }
		| { style: 'pattern'; id: string };

	type Props = {
		open?: boolean;
		mode?: ThemeMode;
		children?: Snippet;
	};

	let { open = $bindable(false), mode = $bindable<ThemeMode>('light'), children }: Props = $props();
	let activeTab = $state<Tab>('theme');
	let themeFamilies = $state<ThemeFamily[]>([]);
	let auras = $state<AuraPreset[]>([]);
	let gradients = $state<{ id: string; name: string; colors: string[]; css: string }[]>([]);
	let patterns = $state<Pattern[]>([]);
	let patternCategories = $state<{ id: PatternCategory; label: string; count: number; icon: string }[]>([]);
	let selectedThemeFamilyId = $state('');
	let accentSource = $state<AccentSource>('preset');
	let customThemeColor = $state('#04825b');
	let customThemeColorAlt = $state('#047857');
	let selectedBackground = $state<BackgroundSelection>({ style: 'plain' });
	let patternCategory = $state<PatternCategory | 'all'>('all');
	let backgroundFilter = $state<'matching' | 'all'>('matching');
	let hydrated = $state(false);

	let selectedThemeFamily = $derived(themeFamilies.find((family) => family.id === selectedThemeFamilyId));
	let selectedTheme = $derived(selectedThemeFamily?.variants[mode]);
	let selectedBackgroundId = $derived(selectedBackground.style === 'plain' ? undefined : selectedBackground.id);
	let selectedAura = $derived(selectedBackground.style === 'aura' ? auras.find((aura) => aura.id === selectedBackgroundId) : undefined);
	let selectedGradient = $derived(selectedBackground.style === 'gradient' ? gradients.find((gradient) => gradient.id === selectedBackgroundId) : undefined);
	let selectedPattern = $derived(selectedBackground.style === 'pattern' ? patterns.find((pattern) => pattern.id === selectedBackgroundId) : undefined);
	let visiblePatterns = $derived(patternCategory === 'all' ? patterns : patterns.filter((pattern) => pattern.category === patternCategory));
	let visibleAuras = $derived(auras.filter((aura) => backgroundFilter === 'all' || aura.dark === (mode === 'dark') || (selectedBackground.style === 'aura' && selectedBackground.id === aura.id)));
	let visibleGradients = $derived(gradients.filter((gradient) => backgroundFilter === 'all' || gradientAppearance(gradient) === mode || (selectedBackground.style === 'gradient' && selectedBackground.id === gradient.id)));
	let visibleClassifiedPatterns = $derived(visiblePatterns.filter((pattern) => backgroundFilter === 'all' || patternAppearance(pattern) === mode || (selectedBackground.style === 'pattern' && selectedBackground.id === pattern.id)));
	let loading = $state(new Set<Tab>());

	function clean(value: string) {
		return value.replace(/[;{}]/g, '').trim();
	}

	function toKebabCase(key: string) {
		return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
	}

	function backgroundDeclarations(pattern: Pattern) {
		const supported = new Set(['background', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'backgroundAttachment', 'backgroundBlendMode']);
		return Object.entries(pattern.style)
			.filter(([key, value]) => supported.has(key) && value !== undefined)
			.map(([key, value]) => `${toKebabCase(key)}: ${clean(String(value))}`)
			.join('; ');
	}

	function themeDeclarations(theme: ThemeInfo | undefined) {
		if (!theme) return [];
		const declarations = Object.entries(theme.tokens).map(([name, value]) => `--${name}: ${clean(value)}`);
		if (accentSource === 'custom') {
			declarations.push(`--theme-color: ${clean(customThemeColor)}`, `--theme-color-alt: ${clean(customThemeColorAlt)}`);
		}
		return declarations;
	}

	function selectionDeclarations(selection: BackgroundSelection) {
		if (selection.style === 'aura') return [`background-color: ${clean(selectedAura?.baseColor ?? 'var(--bg-canvas)')}`];
		if (selection.style === 'gradient') return [`background: ${clean(selectedGradient?.css ?? 'var(--bg-canvas)')}`];
		if (selection.style === 'pattern' && selectedPattern) return [backgroundDeclarations(selectedPattern)];
		return ['background: var(--bg-canvas)'];
	}

	let style = $derived([...themeDeclarations(selectedTheme), ...selectionDeclarations(selectedBackground)].join('; '));

	async function loadTab(tab: Tab) {
		if (loading.has(tab)) return;
		if (tab === 'theme' && themeFamilies.length) return;
		if (tab === 'auras' && auras.length) return;
		if (tab === 'gradients' && gradients.length) return;
		if (tab === 'patterns' && patterns.length) return;
		loading.add(tab);
		loading = new Set(loading);
		if (tab === 'theme') {
			const { THEME_FAMILIES } = await import('#lib/data/theme-families.ts');
			themeFamilies = THEME_FAMILIES;
			if (!selectedThemeFamilyId && THEME_FAMILIES[0]) chooseTheme(THEME_FAMILIES[0]);
		}
		if (tab === 'auras') {
			const { AURA_PRESETS } = await import('#lib/data/auras.ts');
			auras = AURA_PRESETS;
		}
		if (tab === 'gradients') {
			const { GRADIENT_PRESETS } = await import('#lib/data/gradients.ts');
			gradients = GRADIENT_PRESETS;
		}
		if (tab === 'patterns') {
			const { PATTERNS, PATTERN_CATEGORIES } = await import('#lib/data/patterns.ts');
			patterns = PATTERNS;
			patternCategories = PATTERN_CATEGORIES;
		}
		loading.delete(tab);
		loading = new Set(loading);
	}

	function selectTab(tab: Tab) {
		activeTab = tab;
		void loadTab(tab);
	}

	$effect(() => {
		if (open) void loadTab(activeTab);
	});

	function isBackgroundSelection(value: unknown): value is BackgroundSelection {
		if (!value || typeof value !== 'object' || !('style' in value)) return false;
		const selection = value as { style?: unknown; id?: unknown };
		if (selection.style === 'plain') return true;
		return ['aura', 'gradient', 'pattern'].includes(String(selection.style)) && typeof selection.id === 'string';
	}

	function applyDocumentAppearance() {
		for (const element of [document.documentElement, document.body]) {
			element.dataset.theme = mode;
			element.dataset.mode = mode;
			element.dataset.themeFamily = selectedThemeFamilyId;
			element.dataset.bgStyle = selectedBackground.style;
			element.style.colorScheme = mode;
		}
	}

	onMount(() => {
		const savedMode = localStorage.getItem('fractalsvelte.mode');
		if (savedMode === 'light' || savedMode === 'dark') mode = savedMode;
		selectedThemeFamilyId = localStorage.getItem('fractalsvelte.theme-family') ?? '';

		try {
			const savedBackground = localStorage.getItem('fractalsvelte.background');
			if (savedBackground) {
				const parsed = JSON.parse(savedBackground);
				if (isBackgroundSelection(parsed)) selectedBackground = parsed;
			}
		} catch {
			selectedBackground = { style: 'plain' };
		}

		void loadTab('theme');
		if (selectedBackground.style !== 'plain') void loadTab(`${selectedBackground.style}s` as Tab);
		hydrated = true;
	});

	$effect(() => {
		if (!hydrated) return;
		localStorage.setItem('fractalsvelte.mode', mode);
		localStorage.setItem('fractalsvelte.theme-family', selectedThemeFamilyId);
		localStorage.setItem('fractalsvelte.background', JSON.stringify(selectedBackground));
		applyDocumentAppearance();
	});

	function chooseTheme(themeFamily: ThemeFamily) {
		selectedThemeFamilyId = themeFamily.id;
		const theme = themeFamily.variants[mode];
		if (accentSource === 'preset') {
			customThemeColor = theme.tokens['theme-color'] ?? theme.accentColor;
			customThemeColorAlt = theme.tokens['theme-color-alt'] ?? theme.accentColor;
		}
	}

	function setAccentSource(source: AccentSource) {
		accentSource = source;
		if (source === 'preset' && selectedTheme) {
			customThemeColor = selectedTheme.tokens['theme-color'] ?? selectedTheme.accentColor;
			customThemeColorAlt = selectedTheme.tokens['theme-color-alt'] ?? selectedTheme.accentColor;
		}
	}

	function chooseBackground(style: BgStyle, id?: string) {
		if (style === 'plain') selectedBackground = { style };
		if (style === 'aura') selectedBackground = { style, id: id ?? '' };
		if (style === 'gradient') selectedBackground = { style, id: id ?? '' };
		if (style === 'pattern') selectedBackground = { style, id: id ?? '' };
	}

	function auraLayerStyle(aura: AuraPreset, index: number) {
		const layer = aura.layers[index];
		return [
			`--aura-background: ${clean(layer.background)}`,
			`--aura-blend-mode: ${clean(layer.blendMode)}`,
			`--aura-opacity: ${layer.opacity ?? 1}`,
			`--aura-blur-mobile: ${layer.blurMobile ?? layer.blur ?? 0}px`,
			`--aura-blur-desktop: ${layer.blurDesktop ?? layer.blur ?? 0}px`
		].join('; ');
	}

	function previewStyle(theme: ThemeInfo) {
		return `background: ${clean(theme.tokens['bg-canvas'] ?? theme.bgColor)}; color: ${clean(theme.tokens['text-primary'] ?? theme.textColor)}`;
	}

	function close() {
		open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="theme-setter" data-mode={mode} {style}>
	{#if selectedAura}
		<div class="theme-setter__aura" aria-hidden="true">
			{#each selectedAura.layers as _, index}
				<div class="theme-setter__aura-layer" style={auraLayerStyle(selectedAura, index)}></div>
			{/each}
		</div>
	{/if}

	<div class="theme-setter__content">
		{@render children?.()}
	</div>

	{#if open}
		<button class="theme-setter__backdrop" type="button" aria-label="Close theme settings" onclick={close}></button>
		<aside class="theme-setter__drawer" aria-label="Theme settings">
			<div class="theme-setter__drawer-header">
				<div><span class="theme-setter__eyebrow">Appearance</span><h2>Theme setter</h2></div>
				<button class="theme-setter__close" type="button" aria-label="Close theme settings" onclick={close}>×</button>
			</div>

			<div class="theme-setter__tabs" role="tablist" aria-label="Theme setting categories">
				{#each [{ id: 'theme', label: 'Theme' }, { id: 'auras', label: 'Auras' }, { id: 'gradients', label: 'Gradients' }, { id: 'patterns', label: 'Patterns' }] as tab}
					<button type="button" role="tab" aria-selected={activeTab === tab.id} onclick={() => selectTab(tab.id as Tab)}>{tab.label}</button>
				{/each}
			</div>

			<div class="theme-setter__panel">
				{#if activeTab === 'theme'}
					<div class="theme-setter__section-heading"><div><h3>Base theme</h3><p>Sets surfaces, text, borders, and state colours.</p></div></div>
					{#if loading.has('theme') || !themeFamilies.length}
						<p class="theme-setter__loading">Loading preset themes…</p>
					{:else}<div class="theme-setter__theme-grid">
						{#each themeFamilies as themeFamily}
							<button class="theme-setter__theme-card" class:selected={themeFamily.id === selectedThemeFamilyId} type="button" aria-pressed={themeFamily.id === selectedThemeFamilyId} onclick={() => chooseTheme(themeFamily)}>
								<span class="theme-setter__theme-preview" style={previewStyle(themeFamily.variants[mode])}><span></span><span></span><i style={`background: ${clean(themeFamily.variants[mode].tokens['theme-color'] ?? themeFamily.variants[mode].accentColor)}`}></i></span>
								<span><strong>{themeFamily.name}</strong><small>{themeFamily.variants[mode].description}</small><em>{mode} {themeFamily.isDerived[mode] ? 'variant' : 'preset'}</em></span>
							</button>
						{/each}
					</div>{/if}

					<div class="theme-setter__section-heading theme-setter__section-heading--accent"><div><h3>Accent source</h3><p>Use the selected preset’s accent pair or your own.</p></div></div>
					<div class="theme-setter__segmented" aria-label="Accent source">
						<button class:active={accentSource === 'preset'} type="button" aria-pressed={accentSource === 'preset'} onclick={() => setAccentSource('preset')}>Use preset accents</button>
						<button class:active={accentSource === 'custom'} type="button" aria-pressed={accentSource === 'custom'} onclick={() => setAccentSource('custom')}>Use my accents</button>
					</div>

					<div class="theme-setter__accent-fields" data-disabled={accentSource !== 'custom' || undefined}>
						<label><span>Theme colour</span><input type="color" value={customThemeColor} disabled={accentSource !== 'custom'} oninput={(event) => customThemeColor = event.currentTarget.value} /><input type="text" value={customThemeColor} disabled={accentSource !== 'custom'} aria-label="Theme colour value" oninput={(event) => customThemeColor = event.currentTarget.value} /></label>
						<label><span>Theme colour alt</span><input type="color" value={customThemeColorAlt} disabled={accentSource !== 'custom'} oninput={(event) => customThemeColorAlt = event.currentTarget.value} /><input type="text" value={customThemeColorAlt} disabled={accentSource !== 'custom'} aria-label="Theme colour alt value" oninput={(event) => customThemeColorAlt = event.currentTarget.value} /></label>
					</div>
				{:else if activeTab === 'auras'}
					<div class="theme-setter__section-heading"><div><h3>Aura backgrounds</h3><p>Layered, blended, responsive colour fields.</p></div><button class:active={selectedBackground.style === 'plain'} type="button" onclick={() => chooseBackground('plain')}>Plain</button></div>
					<div class="theme-setter__mode-filter"><button class:active={backgroundFilter === 'matching'} type="button" onclick={() => backgroundFilter = 'matching'}>{mode} only</button><button class:active={backgroundFilter === 'all'} type="button" onclick={() => backgroundFilter = 'all'}>All modes</button></div>
					{#if loading.has('auras') || !auras.length}
						<p class="theme-setter__loading">Loading aura backgrounds…</p>
					{:else}<div class="theme-setter__background-grid">
						{#each visibleAuras as aura}
							<button class="theme-setter__background-card" class:selected={selectedBackground.style === 'aura' && selectedBackground.id === aura.id} type="button" aria-pressed={selectedBackground.style === 'aura' && selectedBackground.id === aura.id} onclick={() => chooseBackground('aura', aura.id)}>
								<span class="theme-setter__aura-preview" style={`background-color: ${clean(aura.baseColor)}`}>
									{#each aura.layers as _, index}<span style={auraLayerStyle(aura, index)}></span>{/each}
								</span>
								<span><strong>{aura.name}</strong><small>{aura.description}</small><em data-mode={aura.dark ? 'dark' : 'light'}>{aura.dark ? 'dark' : 'light'}</em></span>
							</button>
						{/each}
					</div>{/if}
				{:else if activeTab === 'gradients'}
					<div class="theme-setter__section-heading"><div><h3>Gradient backgrounds</h3><p>Use the preset gradient directly as the page background.</p></div><button class:active={selectedBackground.style === 'plain'} type="button" onclick={() => chooseBackground('plain')}>Plain</button></div>
					<div class="theme-setter__mode-filter"><button class:active={backgroundFilter === 'matching'} type="button" onclick={() => backgroundFilter = 'matching'}>{mode} only</button><button class:active={backgroundFilter === 'all'} type="button" onclick={() => backgroundFilter = 'all'}>All modes</button></div>
					{#if loading.has('gradients') || !gradients.length}
						<p class="theme-setter__loading">Loading gradient backgrounds…</p>
					{:else}<div class="theme-setter__background-grid theme-setter__background-grid--compact">
						{#each visibleGradients as gradient}
							<button class="theme-setter__background-card" class:selected={selectedBackground.style === 'gradient' && selectedBackground.id === gradient.id} type="button" aria-pressed={selectedBackground.style === 'gradient' && selectedBackground.id === gradient.id} onclick={() => chooseBackground('gradient', gradient.id)}>
								<span class="theme-setter__gradient-preview" style={`background: ${clean(gradient.css)}`}></span>
								<span><strong>{gradient.name}</strong><small>{gradient.colors.join(' · ')}</small><em data-mode={gradientAppearance(gradient)}>{gradientAppearance(gradient)}</em></span>
							</button>
						{/each}
					</div>{/if}
				{:else}
					<div class="theme-setter__section-heading"><div><h3>Pattern backgrounds</h3><p>Pattern background declarations supersede the current background.</p></div><button class:active={selectedBackground.style === 'plain'} type="button" onclick={() => chooseBackground('plain')}>Plain</button></div>
					<div class="theme-setter__mode-filter"><button class:active={backgroundFilter === 'matching'} type="button" onclick={() => backgroundFilter = 'matching'}>{mode} only</button><button class:active={backgroundFilter === 'all'} type="button" onclick={() => backgroundFilter = 'all'}>All modes</button></div>
					<div class="theme-setter__filter" aria-label="Pattern category">
						<button class:active={patternCategory === 'all'} type="button" onclick={() => patternCategory = 'all'}>All</button>
						{#each patternCategories as category}<button class:active={patternCategory === category.id} type="button" onclick={() => patternCategory = category.id}>{category.label}</button>{/each}
					</div>
					{#if loading.has('patterns') || !patterns.length}
						<p class="theme-setter__loading">Loading pattern backgrounds…</p>
					{:else}<div class="theme-setter__background-grid theme-setter__background-grid--compact">
						{#each visibleClassifiedPatterns as pattern}
							<button class="theme-setter__background-card" class:selected={selectedBackground.style === 'pattern' && selectedBackground.id === pattern.id} type="button" aria-pressed={selectedBackground.style === 'pattern' && selectedBackground.id === pattern.id} onclick={() => chooseBackground('pattern', pattern.id)}>
								<span class="theme-setter__pattern-preview" style={backgroundDeclarations(pattern)}></span>
								<span><strong>{pattern.name}</strong><small>{pattern.category}</small><em data-mode={patternAppearance(pattern)}>{patternAppearance(pattern)}</em></span>
							</button>
						{/each}
					</div>{/if}
				{/if}
			</div>
		</aside>
	{/if}
</div>
