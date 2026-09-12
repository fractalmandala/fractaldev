import type { Scheme, RoleKey } from './scheme-types';
import { ROLE_KEYS } from './scheme-types';
import { isHexColor, rollPalette, shift, inkOn } from './color-utils';

/**
 * Playground state for the Demos Ground.
 *
 * A single reactive record maps every scheme id → its live-editable role
 * palette. Scenes, type specimens and swatches all read through `cssVars()`
 * so any edit repaints every scene of that scheme instantly. Edits are
 * session-local (no persistence) — reloading restocks the canonical palettes.
 */

export type SceneId = 'app' | 'landing' | 'checkout' | 'article';
export type StageLayout = 'grid' | 'reel';

export const SCENES: { id: SceneId; label: string; blurb: string }[] = [
	{ id: 'app', label: 'App', blurb: 'Dashboard chrome, metrics, tables' },
	{ id: 'landing', label: 'Landing', blurb: 'Hero, badges, CTAs' },
	{ id: 'checkout', label: 'Checkout', blurb: 'Forms, cart, payment' },
	{ id: 'article', label: 'Article', blurb: 'Reading surface, prose rhythm' }
];

const HISTORY_LIMIT = 40;

class PlaygroundState {
	/** schemeId → role → hex. Seeded from parsed schemes; edited live. */
	palettes = $state<Record<string, Record<RoleKey, string>>>({});
	/** schemeId → per-role reset baseline (the file's canonical colors). */
	private baselines = $state<Record<string, Record<RoleKey, string>>>({});
	/** schemeId → undo stacks. */
	private history = $state<Record<string, string[][]>>({});

	activeSchemeId = $state<string>('');
	scene = $state<SceneId>('app');
	stageLayout = $state<StageLayout>('grid');
	/** Browser-safe system fonts only — Google font names fall back. */
	typeMode = $state<'spec' | 'system'>('spec');

	register(schemes: Scheme[]) {
		for (const s of schemes) {
			if (this.palettes[s.id]) continue; // HMR-safe: keep live edits
			const base = {} as Record<RoleKey, string>;
			const live = {} as Record<RoleKey, string>;
			for (const key of ROLE_KEYS) {
				base[key] = isHexColor(s.roles[key]) ? (s.roles[key] as string).toLowerCase() : '#888888';
				live[key] = base[key];
			}
			this.baselines[s.id] = base;
			this.palettes[s.id] = live;
			this.history[s.id] = [];
		}
		if (!this.activeSchemeId && schemes.length) this.activeSchemeId = schemes[0].id;
	}

	palette(id: string): Record<RoleKey, string> {
		return this.palettes[id] ?? ({} as Record<RoleKey, string>);
	}

	setRole(id: string, role: RoleKey, value: string) {
		const pal = this.palettes[id];
		if (!pal || pal[role] === value) return;
		this.pushHistory(id);
		pal[role] = value.toLowerCase();
	}

	/** Shift one role's hue while keeping lightness/saturation character. */
	spinRole(id: string, role: RoleKey, degrees: number) {
		const pal = this.palettes[id];
		if (!pal) return;
		this.pushHistory(id);
		pal[role] = shift(pal[role], degrees, 0, 0);
	}

	/** Randomize the whole palette ("Deal the Deck"). */
	shuffle(id: string) {
		const pal = this.palettes[id];
		if (!pal) return;
		this.pushHistory(id);
		Object.assign(pal, rollPalette());
	}

	reset(id: string) {
		const pal = this.palettes[id];
		const base = this.baselines[id];
		if (!pal || !base) return;
		this.pushHistory(id);
		Object.assign(pal, base);
	}

	undo(id: string) {
		const stack = this.history[id];
		const pal = this.palettes[id];
		if (!stack || !stack.length || !pal) return;
		const prev = stack.pop() as string[];
		ROLE_KEYS.forEach((key, i) => (pal[key] = prev[i]));
	}

	canUndo(id: string): boolean {
		return (this.history[id]?.length ?? 0) > 0;
	}

	private pushHistory(id: string) {
		const pal = this.palettes[id];
		const stack = this.history[id];
		if (!pal || !stack) return;
		stack.push(ROLE_KEYS.map((k) => pal[k]));
		if (stack.length > HISTORY_LIMIT) stack.shift();
	}
}

export const playground = new PlaygroundState();

/**
 * Map a scheme's live palette + typography onto CSS custom properties.
 * Returned inline in a `style=` attribute on the scheme sandbox root —
 * this is the scheme's own token layer (the sanctioned exception), while
 * all structural styling stays on the project's sass vocabulary.
 */
export function cssVars(scheme: Scheme, pal: Record<RoleKey, string>): Record<string, string> {
	const vars: Record<string, string> = {};
	for (const key of ROLE_KEYS) {
		vars[`--ds-${key}`] = pal[key];
	}

	// Derived ink choices — black/white per container, recomputed on every
	// edit so text stays legible no matter what the user does to the palette.
	vars['--ds-ink-on-primary'] = inkOn(pal.primary);
	vars['--ds-ink-on-accent'] = inkOn(pal.accent);
	vars['--ds-ink-on-tertiary'] = inkOn(pal.tertiary);
	vars['--ds-ink-on-surface'] = inkOn(pal.surface);

	const type = scheme.typography;
	const display = type['display-lg'];
	const body = type['body-md'];
	const label = type['label-md'];
	const spec = playground.typeMode === 'spec';

	vars['--ds-font-display'] = spec && display?.fontFamily ? fontStack(display.fontFamily) : 'var(--font-sans)';
	vars['--ds-font-body'] = spec && body?.fontFamily ? fontStack(body.fontFamily) : 'var(--font-sans)';
	vars['--ds-font-label'] = spec && label?.fontFamily ? fontStack(label.fontFamily) : 'var(--font-mono)';

	vars['--ds-display-size'] = display?.fontSize ?? '48px';
	vars['--ds-display-weight'] = String(display?.fontWeight ?? 600);
	vars['--ds-display-lh'] = display?.lineHeight ?? '1.1';
	vars['--ds-display-tracking'] = display?.letterSpacing ?? '0';

	vars['--ds-body-size'] = body?.fontSize ?? '15px';
	vars['--ds-body-weight'] = String(body?.fontWeight ?? 400);
	vars['--ds-body-lh'] = body?.lineHeight ?? '1.6';

	vars['--ds-label-size'] = label?.fontSize ?? '12px';
	vars['--ds-label-weight'] = String(label?.fontWeight ?? 600);

	// Shape + rhythm tokens from the scheme's own declarations. Some corpus
	// files declare only `rounded.md` — accept it as the universal fallback.
	const radiusMd = scheme.rounded['md'];
	vars['--ds-card-radius'] =
		scheme.rounded['card'] ?? scheme.rounded['control'] ?? radiusMd ?? '12px';
	vars['--ds-control-radius'] = scheme.rounded['control'] ?? radiusMd ?? '8px';
	vars['--ds-pill-radius'] = scheme.rounded['pill'] ?? '9999px';
	vars['--ds-card-pad'] = scheme.spacing['card-padding'] ?? '24px';
	vars['--ds-section-pad'] = scheme.spacing['section-padding'] ?? '64px';
	vars['--ds-gap'] = scheme.spacing['gap'] ?? '16px';
	vars['--ds-base'] = scheme.spacing['base'] ?? '8px';

	return vars;
}

const FONT_ALIASES: Record<string, string> = {
	'inter': "'Inter', var(--font-sans)",
	'system font': 'var(--font-sans)',
	'sf pro display': 'var(--font-sans)',
	'sf pro text': 'var(--font-sans)',
	'dm sans': "'DM Sans', var(--font-sans)",
	'jetbrains mono': "var(--font-mono)",
	'jetbrains mono, monospace': 'var(--font-mono)',
	'georgia': "Georgia, 'Times New Roman', serif",
	'garamond': "Garamond, Georgia, serif",
	'space grotesk': "'Space Grotesk', var(--font-sans)",
	'ibm plex sans': "'IBM Plex Sans', var(--font-sans)",
	'ibm plex mono': "var(--font-mono)",
	'roboto mono': 'var(--font-mono)',
	'menlo': 'var(--font-mono)'
};

/** Browser-safe fallback chain for a declared family (no webfont loading). */
export function fontStack(family: string | undefined): string {
	if (!family) return 'var(--font-sans)';
	const key = family.trim().toLowerCase();
	if (FONT_ALIASES[key]) return FONT_ALIASES[key];
	// Unknown family → try it literally, then fall back to the system stack.
	return `'${family.replace(/['"\\]/g, '')}', var(--font-sans)`;
}
