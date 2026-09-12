<script lang="ts">
	import { onMount } from 'svelte';
	import {
		themeState,
		THEMES,
		LIGHT_THEMES,
		DARK_THEMES,
		type ThemeInfo
	} from '$lib/utils/theme.svelte';
	import ThemeButton from '$lib/siteicons/theme.svelte';
	import Sun from '$lib/siteicons/sun.svelte';
	import Moon from '$lib/siteicons/moon.svelte';

	let activeTab = $state<'all' | 'light' | 'dark' | 'custom'>('all');
	let searchFilter = $state<string>('');
	let pickerEl = $state<HTMLDivElement | null>(null);

	onMount(() => {
		themeState.init();

		function handleClickOutside(e: MouseEvent) {
			if (themeState.isOpen && pickerEl && !pickerEl.contains(e.target as Node)) {
				themeState.closePicker();
			}
		}

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape' && themeState.isOpen) {
				themeState.closePicker();
			}
		}

		window.addEventListener('click', handleClickOutside);
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('click', handleClickOutside);
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	const filteredThemes = $derived.by(() => {
		let list: ThemeInfo[] = [];
		if (activeTab === 'light') {
			list = LIGHT_THEMES;
		} else if (activeTab === 'dark') {
			list = DARK_THEMES;
		} else if (activeTab === 'custom') {
			list = themeState.customThemes;
		} else {
			list = themeState.allThemes;
		}

		if (!searchFilter.trim()) return list;

		const q = searchFilter.toLowerCase().trim();
		return list.filter(
			(t) =>
				t.name.toLowerCase().includes(q) ||
				t.id.toLowerCase().includes(q) ||
				t.auraName.toLowerCase().includes(q) ||
				t.description.toLowerCase().includes(q)
		);
	});
</script>

<div class="theme-controls" bind:this={pickerEl}>
	<!-- Quick Mode Flip (Sun/Moon) -->
	<button
		type="button"
		class="is-icon-strong"
		data-variation="icon"
		title={themeState.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
		aria-label={themeState.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
		onclick={() => themeState.toggleMode()}
	>
		{#if themeState.isDark}
			<Sun />
		{:else}
			<Moon />
		{/if}
	</button>

	<!-- Theme Dropdown Trigger -->
	<button
		type="button"
		class="is-icon-strong"
		data-variant="icon"
		aria-haspopup="dialog"
		aria-expanded={themeState.isOpen}
		title="Choose theme and aura background"
		onclick={(e) => {
			e.stopPropagation();
			themeState.togglePicker();
		}}
	>
		<ThemeButton />
	</button>

	{#if themeState.isOpen}
		<div class="theme-popover" role="dialog" aria-label="Theme and Aura Background Switcher">
			<!-- Style Switcher (Plain vs Aura Gradient) -->
			<div class="theme-style-switcher">
				<div class="theme-style-toggle-group">
					<button
						type="button"
						class="theme-style-toggle-btn"
						class:active={themeState.bgStyle === 'plain'}
						onclick={() => themeState.setBgStyle('plain')}
						title="Clean distraction-free flat backgrounds"
					>
						<span>◻</span> Plain
					</button>
					<button
						type="button"
						class="theme-style-toggle-btn"
						class:active={themeState.bgStyle === 'aura'}
						onclick={() => themeState.setBgStyle('aura')}
						title="Atmospheric gradient blend aura"
					>
						<span>✨</span> Aura Gradient
					</button>
				</div>

				<div class="row gap6 ycenter">
					<a
						href="/studio"
						class="theme-tab-btn"
						style="text-decoration: none; font-weight: 600; color: var(--theme-color);"
						onclick={() => themeState.closePicker()}
						title="Open interactive Theme & Aura Studio"
					>
						🎨 Studio
					</a>

					<button
						type="button"
						class="theme-icon-btn"
						aria-label="Close theme menu"
						onclick={() => themeState.closePicker()}
					>
						<svg
							viewBox="0 0 24 24"
							width="14"
							height="14"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Filter Tabs -->
			<div class="theme-tabs row xbetween">
				<div class="row gap8 ycenter wrap">
					<button
						type="button"
						class="theme-tab-btn"
						class:active={activeTab === 'all'}
						onclick={() => (activeTab = 'all')}
					>
						All ({themeState.allThemes.length})
					</button>
					<button
						type="button"
						class="theme-tab-btn"
						class:active={activeTab === 'light'}
						onclick={() => (activeTab = 'light')}
					>
						Light ({LIGHT_THEMES.length})
					</button>
					<button
						type="button"
						class="theme-tab-btn"
						class:active={activeTab === 'dark'}
						onclick={() => (activeTab = 'dark')}
					>
						Dark ({DARK_THEMES.length})
					</button>
					{#if themeState.customThemes.length > 0}
						<button
							type="button"
							class="theme-tab-btn"
							class:active={activeTab === 'custom'}
							onclick={() => (activeTab = 'custom')}
						>
							Custom ({themeState.customThemes.length})
						</button>
					{/if}
					<button
						type="button"
						class="theme-tab-btn"
						title="Cycle to next theme"
						aria-label="Cycle to next theme"
						onclick={() => themeState.cycleNext()}
					>
						NEXT
					</button>
				</div>
			</div>

			<!-- Themes Grid -->
			<div class="theme-grid-container">
				{#each filteredThemes as theme (theme.id)}
					<button
						type="button"
						class="theme-card"
						class:active={themeState.current === theme.id}
						title="{theme.name} — {theme.description} (Aura: {theme.auraName})"
						onclick={() => {
							themeState.setTheme(theme.id);
						}}
					>
						<div class="theme-card-header">
							<span class="theme-card-name">{theme.name}</span>
							<span class="theme-card-badge">{theme.mode}</span>
						</div>

						<div
							class="theme-card-preview"
							style="background-color: {theme.bgColor}; color: {theme.textColor}; border-color: {theme.accentColor}33"
						>
							<span class="theme-preview-dot" style="background-color: {theme.accentColor}"></span>
							<span class="theme-preview-dot" style="background-color: {theme.textColor}"></span>
						</div>

						<span class="theme-aura-tag">
							✨ {theme.auraName}
						</span>
					</button>
				{/each}
			</div>

			<!-- Popover Footer -->
			<div class="theme-popover-footer">
				<button
					type="button"
					class="theme-footer-btn"
					onclick={() => themeState.resetDefault()}
					title="Set default theme (.theme-light-default)"
				>
					Reset to Default
				</button>
				<button
					type="button"
					class="theme-footer-btn"
					onclick={() => themeState.cycleRandom()}
					title="Pick a random theme"
				>
					🎲 Random
				</button>
			</div>
		</div>
	{/if}
</div>
