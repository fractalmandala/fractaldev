<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import CopyCode from '$site/components/docs/copy-code.svelte';
	import { ModeToggle, presets, toggleMode } from 'fractalstyler2'
	import Sun from '$site/icons/sun.svelte'
	import Moon from '$site/icons/moon.svelte'
	import { ACCENT_EVENT, accents, currentAccentId, DEFAULT_ACCENT_ID, setAccent } from '$site/lib/accents';
	import { GITHUB_URL, NPM_URL, SITE_VERSION } from '$site/lib/site';
	import Logo from '$site/icons/markgraphy.svelte'
	import ColorPicker from './ColorPicker.svelte'

	const links = [
		{ label: 'docs', href: '/docs' },
		{ label: 'examples', href: '/docs/examples' },
		{ label: 'animations', href: '/docs/animations' },
		{ label: 'rules', href: '/docs/rules' },
		{ label: 'editor', href: '/docs/editor' }
	];

	let isDark = $state(false);
	const path = $derived(page.url.pathname);

	function applyMode() {
		toggleMode();
		isDark = document.documentElement.getAttribute('data-mode') === 'dark';
	}

	async function toggle() {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			applyMode();
			return;
		}

		const wasDark = isDark;

		// Create a full-screen overlay that captures the current theme
		const overlay = document.createElement('div');
		overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
		// Use html2canvas-like approach: just use the current background color
		const computedBg = getComputedStyle(document.body).backgroundColor;
		overlay.style.background = computedBg;
		document.body.appendChild(overlay);

		// Apply the theme change
		applyMode();

		// Animate the overlay away to reveal the new theme
		// Dark→Light: overlay shrinks downward (reveals from top)
		// Light→Dark: overlay shrinks upward (reveals from bottom)
		const to = wasDark ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)';

		const anim = overlay.animate(
			{ clipPath: ['inset(0 0 0 0)', to] },
			{
				duration: 520,
				easing: 'cubic-bezier(0.65, 0, 0.35, 1)'
			}
		);

		anim.onfinish = () => overlay.remove();
	}

	function isCurrent(href: string) {
		if (href.startsWith('http')) return false;
		if (href === '/docs') return path === '/docs' || path.startsWith('/docs/graph-') || path.startsWith('/docs/installation') || path.startsWith('/docs/skill');
		return path === href || path.startsWith(href + '/');
	}

	let current = $state(DEFAULT_ACCENT_ID);
	const dark = $derived(presets.mode === 'dark');
	function sync() {
		current = currentAccentId();
	}

	$effect(() => {
		sync();
		window.addEventListener(ACCENT_EVENT, sync);
		return () => window.removeEventListener(ACCENT_EVENT, sync);
	});

	onMount(() => {
		isDark = document.documentElement.getAttribute('data-mode') === 'dark';
	});

	// Accent dropdown
	let accentOpen = $state(false);
	let showPicker = $state(false);
	let dropdownEl: HTMLElement | undefined;

	function toggleAccentDropdown() {
		accentOpen = !accentOpen;
		if (accentOpen) showPicker = false;
	}

	function closeAccentDropdown() {
		accentOpen = false;
		showPicker = false;
	}

	function onDocClick(e: MouseEvent) {
		if (!accentOpen) return;
		if (dropdownEl && !dropdownEl.contains(e.target as Node)) {
			closeAccentDropdown();
		}
	}

	$effect(() => {
		if (accentOpen) {
			document.addEventListener('click', onDocClick);
			return () => document.removeEventListener('click', onDocClick);
		}
	});

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && accentOpen) closeAccentDropdown();
	}
</script>

<header class="site-wrapper row xbetween wfull">
	<a class="sitelogo" href="/">
		<Logo/>
	</a>
	<div class="hud-right grow row gap-sm">
	<nav class="nav row gap-sm" aria-label="Primary">
		{#each links as link (link.href)}
			<a
				href={link.href}
				rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
				aria-current={isCurrent(link.href) ? 'page' : undefined}
			>
				<p><span class="kicker-hover">[ </span> {link.label} <span class="kicker-hover"> ]</span></p>
			</a>
		{/each}
	</nav>
		<div class="row gap-sm">
			<!-- Accent dropdown -->
			<div class="accent-dd" role="button" tabindex="0" bind:this={dropdownEl} onkeydown={onKeydown}>
				<button
					type="button"
					class="accent-trigger"
					aria-label="Accent color"
					aria-expanded={accentOpen}
					onclick={toggleAccentDropdown}
				>
					<span class="accent-preview" style:background={current}></span>
				</button>
				{#if accentOpen}
					<div class="accent-panel">
						{#if !showPicker}
							<div class="swatch-grid">
								{#each accents as accent (accent.id)}
									<button
										type="button"
										class="swatch-btn"
										class:selected={accent.id === current}
										style:--swatch={accent.accent}
										aria-label={accent.accent}
										onclick={(e) => {
											e.stopPropagation();
											setAccent(accent.accent);
											closeAccentDropdown();
										}}
									>
										<span class="swatch-dot"></span>
									</button>
								{/each}
							</div>
							<button
								type="button"
								class="custom-btn"
								onclick={(e) => {
									e.stopPropagation();
									showPicker = true;
								}}
							>
								<span class="custom-icon">+</span>
								<span>Custom color</span>
							</button>
						{:else}
							<ColorPicker value={current} />
							<button
								type="button"
								class="back-btn"
								onclick={(e) => {
									e.stopPropagation();
									showPicker = false;
								}}
							>
								← Back to presets
							</button>
						{/if}
					</div>
				{/if}
			</div>
			<button class="button is-icon" onclick={toggle}>
				{#if dark}
					<Sun/>
				{:else}
					<Moon/>
				{/if}
			</button>
		</div>
	</div>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 40;
		height: 80px;
		align-items: center;
		padding: 0.7rem var(--pad);
		border-bottom: 1px dashed var(--border);
		background: var(--bg);
	}

	.sitelogo {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		min-width: 0;
	}

	.nav {
		display: flex;
	}

	.nav a {
		display: inline-flex;
		align-items: center;
		padding: 0.15rem 0.25rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		text-decoration: none;
		white-space: nowrap;
	}

	.hud-right {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		min-width: 0;
	}

	@media (max-width: 980px) {
		.nav {
			display: none;
		}
	}

	@media (max-width: 560px) {
		header {
			padding: 0.55rem var(--pad);
		}

		.hud-right.grow {
			gap: 0.4rem;
		}

		.sitelogo :global(svg) {
			width: 118px;
			height: auto;
		}
	}

	/* ── Accent dropdown ─────────────────────────────────── */

	.accent-dd {
		position: relative;
	}

	.accent-trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: 0;
		border-radius: 0.375rem;
		background: transparent;
		cursor: pointer;
	}

	.accent-trigger:hover {
		background: var(--bg-surface, #1a1a1a);
	}

	.accent-preview {
		display: block;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 9999px;
		border: 2px solid var(--border, #333);
	}

	.accent-panel {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		width: 16rem;
		background: var(--bg-dialog, #1e1e1e);
		border: 1px solid var(--border, #333);
		border-radius: 0.75rem;
		box-shadow: 0 8px 32px rgba(0,0,0,0.4);
		z-index: 50;
		overflow: hidden;
	}

	.swatch-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.25rem;
		padding: 0.6rem 0.6rem 0.4rem;
	}

	.swatch-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		aspect-ratio: 1;
		padding: 0;
		border: 0;
		border-radius: 0.375rem;
		background: transparent;
		cursor: pointer;
		position: relative;
	}

	.swatch-btn:hover {
		background: var(--bg-surface, #2a2a2a);
	}

	.swatch-btn.selected {
		background: var(--text-muted, #555);
	}

	.swatch-dot {
		display: block;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 9999px;
		background: var(--swatch);
	}

	.custom-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		width: calc(100% - 1.2rem);
		margin: 0 0.6rem 0.5rem;
		padding: 0.4rem 0.6rem;
		border: 1px dashed var(--border, #444);
		border-radius: 0.5rem;
		background: transparent;
		color: var(--text-secondary, #999);
		font-size: 0.8rem;
		cursor: pointer;
	}

	.custom-btn:hover {
		border-color: var(--text-muted, #666);
		color: var(--text-primary, #ddd);
	}

	.custom-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.back-btn {
		display: block;
		width: calc(100% - 1.2rem);
		margin: 0 0.6rem 0.5rem;
		padding: 0.35rem 0.6rem;
		border: 0;
		border-radius: 0.375rem;
		background: var(--bg-surface, #2a2a2a);
		color: var(--text-secondary, #999);
		font-size: 0.75rem;
		cursor: pointer;
	}

	.back-btn:hover {
		color: var(--text-primary, #ddd);
	}

</style>
