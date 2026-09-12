import type { Scheme } from '$lib/data/schemeTypes';
import { contrastRatio, inkOn } from './colorUtils';

function resolveFontStack(name?: string): string {
	if (!name) return 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
	const trimmed = name.trim();
	if (trimmed.toLowerCase().includes('mono') || trimmed === 'JetBrains Mono') {
		return '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
	}
	if (trimmed === 'Gloock') {
		return '"Gloock", Georgia, serif';
	}
	if (trimmed === 'DM Sans') {
		return '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
	}
	if (trimmed === 'System Font') {
		return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
	}
	return `"${trimmed}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
}

function parseGuardrails(body: string): string[] {
	const guardrailMatch = body.match(/## Guardrails([\s\S]*?)(?:##|$)/i);
	if (guardrailMatch) {
		const lines = guardrailMatch[1]
			.split('\n')
			.map((l) => l.trim())
			.filter((l) => l.startsWith('-') || l.startsWith('*'))
			.map((l) => l.replace(/^[-*]\s*/, ''));
		if (lines.length > 0) return lines;
	}
	return [
		'Preserve the visible hierarchy, first-screen composition, and section rhythm.',
		'Keep background, surface, text, and border roles distinct to retain contrast pattern.',
		'Keep buttons, cards, and badges aligned to declared radius and border tokens.'
	];
}

function parseOverviewSnippets(body: string): string {
	const overviewMatch = body.match(/## Overview\s*\n([\s\S]*?)(?:##|$)/i);
	if (overviewMatch) {
		const clean = overviewMatch[1]
			.split('\n')
			.map((l) => l.trim())
			.filter((l) => l && !l.startsWith('-') && !l.startsWith('#'))
			.join(' ');
		if (clean.length > 20) return clean.slice(0, 220) + (clean.length > 220 ? '…' : '');
	}
	return 'Designed for building reusable UI components in modern web projects with responsive behavior and production-ready presentation.';
}

export function generateDesignSpecimenHtml(scheme: Scheme): string {
	const primary = scheme.roles.primary || '#3b82f6';
	const secondary = scheme.roles.secondary || '#1e293b';
	const accent = scheme.roles.accent || scheme.roles.tertiary || primary;
	const background = scheme.roles.background || '#0a0a0c';
	const surface = scheme.roles.surface || '#141418';
	const textPrimary = scheme.roles['text-primary'] || '#ffffff';
	const textSecondary = scheme.roles['text-secondary'] || '#a1a1aa';
	const border = scheme.roles.border || 'rgba(255, 255, 255, 0.12)';

	// Adaptive WCAG contrast calculations
	// 1. Text on Page Background
	const textOnBackground =
		contrastRatio(background, textPrimary) >= 4.5 ? textPrimary : inkOn(background);
	const textOnBackgroundMuted =
		contrastRatio(background, textSecondary) >= 3
			? textSecondary
			: inkOn(background) === '#ffffff'
				? 'rgba(255, 255, 255, 0.7)'
				: 'rgba(0, 0, 0, 0.65)';

	// 2. Text on Card/Panel Surfaces (Solves dark surface with dark declared textPrimary)
	const textOnSurface =
		contrastRatio(surface, textPrimary) >= 4.5 ? textPrimary : inkOn(surface);
	const textOnSurfaceMuted =
		contrastRatio(surface, textSecondary) >= 3.5
			? textSecondary
			: inkOn(surface) === '#ffffff'
				? 'rgba(255, 255, 255, 0.7)'
				: 'rgba(0, 0, 0, 0.65)';

	// 3. Text on Buttons and Badges
	const textOnPrimary = inkOn(primary);
	const textOnAccent = inkOn(accent);

	const displayFont = scheme.typography['display-lg'] || {};
	const bodyFont = scheme.typography['body-md'] || {};
	const labelFont = scheme.typography['label-md'] || {};

	const fontDisplayFamily = resolveFontStack(displayFont.fontFamily);
	const fontBodyFamily = resolveFontStack(bodyFont.fontFamily);
	const fontMonoFamily = resolveFontStack(labelFont.fontFamily || 'JetBrains Mono');

	const radiusCard = scheme.rounded.card || scheme.rounded.md || '12px';
	const radiusControl = scheme.rounded.control || scheme.rounded.md || '6px';
	const radiusPill = scheme.rounded.pill || '9999px';

	const spaceCard = scheme.spacing['card-padding'] || '24px';
	const spaceGap = scheme.spacing.gap || '16px';
	const spaceSection = scheme.spacing['section-padding'] || '64px';

	const guardrails = parseGuardrails(scheme.body);
	const overviewText = scheme.description || parseOverviewSnippets(scheme.body);

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>${scheme.name} — Design System Specimen</title>
  <meta name="description" content="${scheme.description}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Gloock&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --primary: ${primary};
      --secondary: ${secondary};
      --accent: ${accent};
      --background: ${background};
      --surface: ${surface};
      --surface-hover: color-mix(in srgb, ${surface} 85%, ${textOnSurface} 15%);
      --text-on-background: ${textOnBackground};
      --text-on-background-muted: ${textOnBackgroundMuted};
      --text-on-surface: ${textOnSurface};
      --text-on-surface-muted: ${textOnSurfaceMuted};
      --text-on-primary: ${textOnPrimary};
      --text-on-accent: ${textOnAccent};
      --border: ${border};

      --font-display: ${fontDisplayFamily};
      --font-body: ${fontBodyFamily};
      --font-mono: ${fontMonoFamily};

      --radius-card: ${radiusCard};
      --radius-control: ${radiusControl};
      --radius-pill: ${radiusPill};

      --space-card: ${spaceCard};
      --space-gap: ${spaceGap};
      --space-section: ${spaceSection};
    }

    *, *::before, *::after {
      box-sizing: border-box;
      min-width: 0;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
      background-color: var(--background);
      color: var(--text-on-background);
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* System Top HUD */
    .system-hud {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem clamp(1rem, 3vw, 2.5rem);
      background: color-mix(in srgb, var(--background) 90%, transparent);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      color: var(--text-on-background);
    }

    .system-identity {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .system-name {
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-on-background);
      letter-spacing: -0.01em;
    }

    .system-badge {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-pill);
      background: color-mix(in srgb, var(--primary) 15%, transparent);
      color: var(--primary);
      border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
      font-weight: 500;
    }

    .palette-swatches {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .swatch-item {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem 0.35rem 0.45rem;
      border-radius: var(--radius-pill);
      background: color-mix(in srgb, var(--surface) 65%, transparent);
      border: 1px solid var(--border);
      cursor: pointer;
      user-select: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .swatch-item:hover {
      transform: translateY(-1px);
      border-color: color-mix(in srgb, var(--primary) 50%, var(--border));
      background: color-mix(in srgb, var(--surface) 90%, transparent);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .swatch-dot {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(0, 0, 0, 0.2);
      flex-shrink: 0;
      transition: background-color 0.15s ease;
    }

    .swatch-label {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-on-background);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .swatch-hex {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--text-on-background-muted);
      background: color-mix(in srgb, var(--background) 60%, transparent);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
    }

    .swatch-color-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      border: none;
      padding: 0;
      margin: 0;
      z-index: 2;
    }

    /* Main Container */
    .specimen-stage {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem);
      display: flex;
      flex-direction: column;
      gap: clamp(2rem, 5vw, 3.5rem);
    }

    /* Hero Section */
    .showcase-hero {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding-bottom: 2rem;
      border-bottom: 1px dashed var(--border);
    }

    .hero-kicker {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--primary);
      font-weight: 600;
    }

    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(2rem, 6.5vw, ${displayFont.fontSize || '56px'});
      font-weight: ${displayFont.fontWeight || 600};
      line-height: ${displayFont.lineHeight || 1.05};
      letter-spacing: ${displayFont.letterSpacing || '-0.03em'};
      color: var(--text-on-background);
      margin: 0;
      word-break: break-word;
    }

    .hero-lede {
      font-size: clamp(1rem, 2vw, ${bodyFont.fontSize || '16px'});
      line-height: ${bodyFont.lineHeight || 1.6};
      color: var(--text-on-background-muted);
      max-width: 68ch;
      margin: 0;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.65rem 1.4rem;
      background: var(--primary);
      color: var(--text-on-primary);
      border: 1px solid var(--primary);
      border-radius: var(--radius-control);
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: filter 0.15s ease;
    }

    .btn-primary:hover {
      filter: brightness(1.1);
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.65rem 1.4rem;
      background: var(--surface);
      color: var(--text-on-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-control);
      font-family: var(--font-body);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn-secondary:hover {
      background: var(--surface-hover);
    }

    /* Bento Feature Grid */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
      gap: var(--space-gap);
    }

    .specimen-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      padding: var(--space-card);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      color: var(--text-on-surface);
      transition: border-color 0.15s ease;
    }

    .specimen-card:hover {
      border-color: color-mix(in srgb, var(--primary) 50%, var(--border));
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .card-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-on-surface);
    }

    .kpi-value {
      font-family: var(--font-display);
      font-size: clamp(2rem, 4vw, 2.75rem);
      font-weight: 700;
      line-height: 1;
      color: var(--primary);
    }

    .kpi-trend {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--accent);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    /* Interactive Specimen Data Table */
    .specimen-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;
      color: var(--text-on-surface);
    }

    .specimen-table th, .specimen-table td {
      padding: 0.6rem 0.5rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    .specimen-table th {
      color: var(--text-on-surface-muted);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .specimen-table td {
      color: var(--text-on-surface);
    }

    .status-pill {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-pill);
      font-family: var(--font-mono);
      font-size: 0.68rem;
      font-weight: 500;
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      color: var(--accent);
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    }

    /* Input Specimen Control */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-label {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-on-surface-muted);
    }

    .specimen-input {
      width: 100%;
      padding: 0.65rem 0.85rem;
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: var(--radius-control);
      color: var(--text-on-background);
      font-family: var(--font-body);
      font-size: 0.875rem;
      outline: none;
    }

    .specimen-input:focus {
      border-color: var(--primary);
    }

    /* Typography Ladder */
    .type-ladder {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: var(--space-card);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      color: var(--text-on-surface);
    }

    .ladder-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 1rem;
      align-items: baseline;
      padding-bottom: 1rem;
      border-bottom: 1px dotted var(--border);
    }

    .ladder-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .ladder-meta {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--text-on-surface-muted);
    }

    .ladder-sample-display {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 3vw, 2rem);
      font-weight: 600;
      color: var(--text-on-surface);
    }

    .ladder-sample-body {
      font-family: var(--font-body);
      font-size: 1rem;
      color: var(--text-on-surface-muted);
    }

    .ladder-sample-mono {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: var(--accent);
    }

    /* Guardrails Card */
    .guardrails-card {
      padding: var(--space-card);
      background: var(--surface);
      border: 1px dashed var(--border);
      border-radius: var(--radius-card);
      color: var(--text-on-surface);
    }

    .guardrails-title {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--primary);
      margin-bottom: 0.75rem;
      font-weight: 600;
    }

    .guardrails-list {
      margin: 0;
      padding-left: 1.25rem;
      color: var(--text-on-surface-muted);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.85rem;
    }

    /* Responsive Mobile Overrides */
    @media (max-width: 768px) {
      .system-hud {
        flex-direction: column;
        align-items: flex-start;
        padding: 0.75rem 1rem;
        gap: 0.5rem;
      }
      .ladder-row {
        grid-template-columns: 1fr;
        gap: 0.4rem;
      }
      .bento-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <!-- System Top HUD -->
  <header class="system-hud" data-od-id="system-hud">
    <div class="system-identity">
      <span class="system-name" data-od-id="system-name">${scheme.name}</span>
      <span class="system-badge" data-od-id="system-version">${scheme.version}</span>
    </div>
    <div class="palette-swatches" data-od-id="palette-swatches">
      <label class="swatch-item" title="Click to tweak Primary color">
        <input class="swatch-color-input" type="color" data-role="primary" value="${primary}" />
        <span class="swatch-dot" style="background: ${primary};"></span>
        <span class="swatch-label">Primary</span>
        <span class="swatch-hex" data-hex-for="primary">${primary}</span>
      </label>
      <label class="swatch-item" title="Click to tweak Accent color">
        <input class="swatch-color-input" type="color" data-role="accent" value="${accent}" />
        <span class="swatch-dot" style="background: ${accent};"></span>
        <span class="swatch-label">Accent</span>
        <span class="swatch-hex" data-hex-for="accent">${accent}</span>
      </label>
      <label class="swatch-item" title="Click to tweak Surface color">
        <input class="swatch-color-input" type="color" data-role="surface" value="${surface}" />
        <span class="swatch-dot" style="background: ${surface};"></span>
        <span class="swatch-label">Surface</span>
        <span class="swatch-hex" data-hex-for="surface">${surface}</span>
      </label>
      <label class="swatch-item" title="Click to tweak Background color">
        <input class="swatch-color-input" type="color" data-role="background" value="${background}" />
        <span class="swatch-dot" style="background: ${background};"></span>
        <span class="swatch-label">Background</span>
        <span class="swatch-hex" data-hex-for="background">${background}</span>
      </label>
    </div>
  </header>

  <main class="specimen-stage" id="specimen-stage" data-od-id="specimen-stage">
    <!-- Showcase Hero -->
    <section class="showcase-hero" id="showcase-hero" data-od-id="showcase-hero">
      <div class="hero-kicker" data-od-id="hero-kicker">[ system specimen · ${scheme.id} ]</div>
      <h1 class="hero-title" id="stage-title" data-od-id="stage-title">${scheme.name}</h1>
      <p class="hero-lede" id="hero-lede" data-od-id="hero-lede">${overviewText}</p>
      <div class="hero-actions" data-od-id="hero-actions">
        <button class="btn-primary" id="btn-primary" type="button" data-od-id="btn-primary">Explore Interface</button>
        <button class="btn-secondary" id="btn-secondary" type="button" data-od-id="btn-secondary">Inspect Tokens</button>
      </div>
    </section>

    <!-- Bento Component Grid -->
    <section class="bento-grid" data-od-id="bento-grid">
      <!-- Metric KPI Card -->
      <article class="specimen-card" id="card-metrics" data-od-id="card-metrics">
        <div class="card-header">
          <h2 class="card-title">Performance Index</h2>
          <span class="status-pill">Active</span>
        </div>
        <div class="kpi-value" id="kpi-value" data-od-id="kpi-value">99.8%</div>
        <div class="kpi-trend">
          <span>▲ +14.2%</span>
          <span style="color: var(--text-on-surface-muted);">vs baseline</span>
        </div>
      </article>

      <!-- Interactive Table Card -->
      <article class="specimen-card" id="card-table" data-od-id="card-table">
        <div class="card-header">
          <h2 class="card-title">Active Services</h2>
          <span class="system-badge">v2.4</span>
        </div>
        <table class="specimen-table">
          <thead>
            <tr><th>Component</th><th>Status</th><th>Latency</th></tr>
          </thead>
          <tbody>
            <tr><td id="table-row-1-name">Render Bridge</td><td><span class="status-pill">Ready</span></td><td>4ms</td></tr>
            <tr><td id="table-row-2-name">Style Pipeline</td><td><span class="status-pill">Active</span></td><td>12ms</td></tr>
          </tbody>
        </table>
      </article>

      <!-- Input Specimen Card -->
      <article class="specimen-card" id="card-input" data-od-id="card-input">
        <div class="card-header">
          <h2 class="card-title">Configuration</h2>
        </div>
        <div class="form-group">
          <label class="form-label" for="specimen-input-field">Theme Role Token</label>
          <input class="specimen-input" id="specimen-input-field" type="text" value="${primary}" readonly />
        </div>
      </article>
    </section>

    <!-- Typography Ladder -->
    <section class="type-ladder" data-od-id="type-ladder">
      <div class="card-header">
        <h2 class="card-title">Typography Scale & Stacks</h2>
        <span class="system-badge">${displayFont.fontFamily || 'Display'}</span>
      </div>

      <div class="ladder-row">
        <div class="ladder-meta">display-lg (${displayFont.fontSize || '64px'})</div>
        <div class="ladder-sample-display">${scheme.name}</div>
      </div>

      <div class="ladder-row">
        <div class="ladder-meta">body-md (${bodyFont.fontSize || '16px'})</div>
        <div class="ladder-sample-body">${overviewText}</div>
      </div>

      <div class="ladder-row">
        <div class="ladder-meta">label-md (12px mono)</div>
        <div class="ladder-sample-mono">const token = "${primary}"; // radius: ${radiusCard}</div>
      </div>
    </section>

    <!-- Guardrails Card -->
    <section class="guardrails-card" data-od-id="guardrails-card">
      <div class="guardrails-title">[ Architectural Guardrails ]</div>
      <ul class="guardrails-list">
        ${guardrails.map((g) => `<li>${g}</li>`).join('\n        ')}
      </ul>
    </section>
  </main>

  <script>
    (function() {
      function hexToRgb(hex) {
        var clean = hex.replace('#', '').trim();
        var full = clean.length === 3 ? clean.split('').map(function(c) { return c + c; }).join('') : clean;
        var n = parseInt(full.slice(0, 6), 16);
        if (isNaN(n)) return { r: 0, g: 0, b: 0 };
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
      }
      function luminance(hex) {
        var rgb = hexToRgb(hex);
        var lin = [rgb.r, rgb.g, rgb.b].map(function(v) {
          var c = v / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
      }
      function contrastRatio(a, b) {
        var la = luminance(a);
        var lb = luminance(b);
        return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
      }
      function inkOn(hex) {
        return contrastRatio(hex, '#000000') >= contrastRatio(hex, '#ffffff') ? '#000000' : '#ffffff';
      }

      var currentTokens = {
        primary: '${primary}',
        accent: '${accent}',
        surface: '${surface}',
        background: '${background}'
      };

      window.updateLiveThemeToken = function(role, val) {
        if (!val) return;
        currentTokens[role] = val;
        var root = document.documentElement;
        root.style.setProperty('--' + role, val);

        var input = document.querySelector('input[data-role="' + role + '"]');
        if (input && input.value.toLowerCase() !== val.toLowerCase()) {
          input.value = val;
        }
        var hexSpan = document.querySelector('[data-hex-for="' + role + '"]');
        if (hexSpan) hexSpan.textContent = val.toUpperCase();
        if (input && input.parentElement) {
          var dot = input.parentElement.querySelector('.swatch-dot');
          if (dot) dot.style.background = val;
        }

        if (role === 'surface' || role === 'primary' || role === 'background') {
          var textOnSurface = inkOn(currentTokens.surface);
          root.style.setProperty('--text-on-surface', textOnSurface);
          root.style.setProperty('--text-on-surface-muted', textOnSurface === '#ffffff' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)');
          root.style.setProperty('--surface-hover', 'color-mix(in srgb, ' + currentTokens.surface + ' 85%, ' + textOnSurface + ' 15%)');

          var textOnPrimary = inkOn(currentTokens.primary);
          root.style.setProperty('--text-on-primary', textOnPrimary);

          var textOnBackground = inkOn(currentTokens.background);
          root.style.setProperty('--text-on-background', textOnBackground);
          root.style.setProperty('--text-on-background-muted', textOnBackground === '#ffffff' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)');
        }
      };

      document.addEventListener('input', function(ev) {
        var t = ev.target;
        if (t && t.matches && t.matches('.swatch-color-input')) {
          var role = t.getAttribute('data-role');
          var val = t.value;
          window.updateLiveThemeToken(role, val);

          try {
            window.parent.postMessage({
              type: 'od-theme-tokens-updated',
              tokens: currentTokens
            }, '*');
          } catch (e) {}
        }
      });
    })();
  </script>
</body>
</html>`;
}
