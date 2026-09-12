import {
	THEMES,
	DEFAULT_THEME_ID,
	THEME_TWINS,
	type ThemeInfo,
	type BgStyle
} from '../data/themes.js';
import { CORE_TOKENS } from '../data/tokens.js';
import { AURA_PRESETS, type AuraLayer, type AuraPreset } from '../data/auras.js';
import { GRADIENT_PRESETS, isGradientDark, type GradientPreset } from '../data/gradients.js';
import { PATTERNS, isPatternDark, type Pattern } from '../data/patterns.js';

function shiftColorLightness(hex: string, percent: number): string {
	let clean = hex.replace('#', '').trim();
	if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
	if (clean.length !== 6) return '#047857';

	const num = parseInt(clean, 16);
	const r = ((num >> 16) & 255) / 255;
	const g = ((num >> 8) & 255) / 255;
	const b = (num & 255) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	const newL = Math.max(0, Math.min(100, l * 100 + percent)) / 100;

	let newR: number;
	let newG: number;
	let newB: number;

	if (s === 0) {
		newR = newG = newB = newL;
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
		const p = 2 * newL - q;
		newR = hue2rgb(p, q, h + 1 / 3);
		newG = hue2rgb(p, q, h);
		newB = hue2rgb(p, q, h - 1 / 3);
	}

	const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
	return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

// Glass regime: when a vivid background (aura, gradient, pattern) owns the
// canvas, opaque -bg-* surfaces would clash with it. These alphas (percent of
// the theme's own literal color, mixed toward transparent) let the single
// backdrop show through. bg-terminal stays opaque for code legibility.
const GLASS_TOKEN_ALPHAS: Record<string, number> = {
	bg: 0,
	'bg-canvas': 25,
	'bg-panel': 45,
	'bg-footer': 50,
	'bg-surface': 55,
	'bg-raised': 60,
	'bg-input': 78,
	'bg-popover': 85,
	'bg-dialog': 88
};

export class ThemeState {
	current = $state<string>(DEFAULT_THEME_ID);
	bgStyle = $state<BgStyle>('plain');
	activeGradient = $state<string | null>(null);
	activeAura = $state<string | null>(null);
	activePattern = $state<string | null>(null);
	isOpen = $state<boolean>(false);
	customThemes = $state<ThemeInfo[]>([]);
	activeCustomOverrides = $state<Record<string, string> | null>(null);
	activeCustomAuraLayers = $state<AuraLayer[] | null>(null);

	// Accent Color Customization State. The accent is an override LAYER above
	// theme selection: it survives theme switches, refreshes, and sessions, and
	// is only cleared by an explicit reset.
	useCustomAccent = $state<boolean>(false);
	customAccentColor = $state<string>('#04825B');
	customAccentAltColor = $state<string>('#047857');
	// Alt starts as an auto-derived shade of the accent; once the user sets it
	// by hand it stops tracking the accent until reset.
	accentAltTouched = $state<boolean>(false);

	get allThemes(): ThemeInfo[] {
		return [...THEMES, ...this.customThemes];
	}

	get allGradients(): GradientPreset[] {
		return GRADIENT_PRESETS;
	}

	get allAuras(): AuraPreset[] {
		return AURA_PRESETS;
	}

	get allPatterns(): Pattern[] {
		return PATTERNS;
	}

	get currentTheme(): ThemeInfo {
		return this.allThemes.find((t) => t.id === this.current) ?? THEMES[0];
	}

	get isDark(): boolean {
		return this.currentTheme.mode === 'dark';
	}

	get isAura(): boolean {
		return this.bgStyle === 'aura';
	}

	get isGradient(): boolean {
		return this.bgStyle === 'gradient';
	}

	get isPattern(): boolean {
		return this.bgStyle === 'pattern';
	}

	get activeGradientPreset(): GradientPreset | null {
		return GRADIENT_PRESETS.find((g) => g.id === this.activeGradient) ?? null;
	}

	get activeAuraPreset(): AuraPreset | null {
		return AURA_PRESETS.find((a) => a.id === this.activeAura) ?? null;
	}

	get activePatternObject(): Pattern | null {
		return PATTERNS.find((p) => p.id === this.activePattern) ?? null;
	}

	// ---- Per-mode background memory -------------------------------------------
	// Gradients, patterns and auras are each classified light or dark. Picks are
	// remembered PER MODE (ft-<family>-<light|dark>) so a light/dark flip
	// restores the other mode's pick instead of clobbering or dropping it.
	private modePickKey(family: 'aura' | 'gradient' | 'pattern', dark: boolean): string {
		return `ft-${family}-${dark ? 'dark' : 'light'}`;
	}

	private saveModePick(family: 'aura' | 'gradient' | 'pattern', id: string, dark: boolean) {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(this.modePickKey(family, dark), id);
		} catch {}
	}

	private fitsMode(family: 'aura' | 'gradient' | 'pattern', id: string, dark: boolean): boolean {
		if (family === 'aura') {
			const a = AURA_PRESETS.find((x) => x.id === id);
			return !!a && a.dark === dark;
		}
		if (family === 'gradient') {
			const g = GRADIENT_PRESETS.find((x) => x.id === id);
			return !!g && isGradientDark(g) === dark;
		}
		const p = PATTERNS.find((x) => x.id === id);
		return !!p && isPatternDark(p) === dark;
	}

	// The user's remembered pick for (family, mode) when it fits, else the first
	// preset of the family that fits the mode; null when the family has none.
	private modePick(family: 'aura' | 'gradient' | 'pattern', dark: boolean): string | null {
		if (typeof window !== 'undefined') {
			try {
				const saved = localStorage.getItem(this.modePickKey(family, dark));
				if (saved && this.fitsMode(family, saved, dark)) return saved;
			} catch {}
		}
		if (family === 'aura') return AURA_PRESETS.find((a) => a.dark === dark)?.id ?? null;
		if (family === 'gradient') return GRADIENT_PRESETS.find((g) => isGradientDark(g) === dark)?.id ?? null;
		return PATTERNS.find((p) => isPatternDark(p) === dark)?.id ?? null;
	}

	// Legacy picks (saved before per-mode memory, or picked while the picker
	// still mixed modes): archive them under their own fitting mode, then refill
	// the active slot with a pick that fits the current mode.
	private normalizePick(family: 'aura' | 'gradient' | 'pattern', dark: boolean) {
		const current = family === 'aura' ? this.activeAura : family === 'gradient' ? this.activeGradient : this.activePattern;
		if (!current || this.fitsMode(family, current, dark)) return;

		let trueDark: boolean | null = null;
		if (family === 'aura') {
			trueDark = AURA_PRESETS.find((a) => a.id === current)?.dark ?? null;
		} else if (family === 'gradient') {
			const g = GRADIENT_PRESETS.find((x) => x.id === current);
			trueDark = g ? isGradientDark(g) : null;
		} else {
			const p = PATTERNS.find((x) => x.id === current);
			trueDark = p ? isPatternDark(p) : null;
		}
		if (trueDark !== null) this.saveModePick(family, current, trueDark);

		const replacement = this.modePick(family, dark);
		if (family === 'aura') {
			this.activeAura = replacement;
			this.activeCustomAuraLayers = replacement ? AURA_PRESETS.find((a) => a.id === replacement)?.layers ?? null : null;
		} else if (family === 'gradient') {
			this.activeGradient = replacement;
		} else {
			this.activePattern = replacement;
		}
	}

	// On a light/dark flip: archive the current picks under the leaving mode,
	// then restore each family's pick for the target mode and re-persist. Custom
	// themes keep their own aura layers — those belong to the theme, not a mode.
	private refitBackgrounds(targetIsDark: boolean) {
		const leavingIsDark = !targetIsDark;
		if (this.activeAura && this.fitsMode('aura', this.activeAura, leavingIsDark)) {
			this.saveModePick('aura', this.activeAura, leavingIsDark);
		}
		if (this.activeGradient && this.fitsMode('gradient', this.activeGradient, leavingIsDark)) {
			this.saveModePick('gradient', this.activeGradient, leavingIsDark);
		}
		if (this.activePattern && this.fitsMode('pattern', this.activePattern, leavingIsDark)) {
			this.saveModePick('pattern', this.activePattern, leavingIsDark);
		}

		if (this.currentTheme.isCustom) return;

		const nextAura = this.modePick('aura', targetIsDark);
		const nextGradient = this.modePick('gradient', targetIsDark);
		const nextPattern = this.modePick('pattern', targetIsDark);
		let changed = false;
		if (nextAura && nextAura !== this.activeAura) {
			this.activeAura = nextAura;
			this.activeCustomAuraLayers = AURA_PRESETS.find((a) => a.id === nextAura)?.layers ?? null;
			changed = true;
		}
		if (nextGradient && nextGradient !== this.activeGradient) {
			this.activeGradient = nextGradient;
			changed = true;
		}
		if (nextPattern && nextPattern !== this.activePattern) {
			this.activePattern = nextPattern;
			changed = true;
		}
		if (changed) this.persistBackgroundState();
	}

	private ensureBackgroundPreset(style: BgStyle) {
		if (style === 'aura' && !this.activeAura) {
			const customLayers = this.currentTheme.isCustom ? this.currentTheme.customAura?.layers : null;
			if (customLayers?.length) {
				this.activeCustomAuraLayers = customLayers;
			} else if (this.currentTheme.auraId && AURA_PRESETS.some((a) => a.id === this.currentTheme.auraId)) {
				this.activeAura = this.currentTheme.auraId;
			} else {
				this.activeAura = this.modePick('aura', this.isDark);
				this.activeCustomAuraLayers = this.activeAura ? AURA_PRESETS.find((a) => a.id === this.activeAura)?.layers ?? null : null;
			}
		}

		if (style === 'gradient' && !this.activeGradient) {
			this.activeGradient = this.modePick('gradient', this.isDark);
		}

		if (style === 'pattern' && !this.activePattern) {
			this.activePattern = this.modePick('pattern', this.isDark);
		}
	}

	private persistBackgroundState() {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem('bgStyle', this.bgStyle);
			if (this.activeAura) localStorage.setItem('aura', this.activeAura);
			if (this.activeGradient) localStorage.setItem('gradient', this.activeGradient);
			if (this.activePattern) localStorage.setItem('pattern', this.activePattern);
		} catch {}
	}

	init() {
		if (typeof window === 'undefined') return;

		// Load custom themes from localStorage
		try {
			const savedCustom = localStorage.getItem('customThemes');
			if (savedCustom) {
				const parsed = JSON.parse(savedCustom);
				if (Array.isArray(parsed)) {
					this.customThemes = parsed;
				}
			}
		} catch {
			this.customThemes = [];
		}

		const savedTheme = localStorage.getItem('theme');
		if (savedTheme && this.allThemes.some((t) => t.id === savedTheme)) {
			this.current = savedTheme;
		} else {
			this.current = DEFAULT_THEME_ID;
		}

		const savedGradient = localStorage.getItem('gradient');
		if (savedGradient && GRADIENT_PRESETS.some((g) => g.id === savedGradient)) {
			this.activeGradient = savedGradient;
		}

		const savedAura = localStorage.getItem('aura');
		if (savedAura) {
			const preset = AURA_PRESETS.find((a) => a.id === savedAura);
			if (preset) {
				this.activeAura = savedAura;
				this.activeCustomAuraLayers = preset.layers;
			}
		}

		const savedPattern = localStorage.getItem('pattern');
		if (savedPattern && PATTERNS.some((p) => p.id === savedPattern)) {
			this.activePattern = savedPattern;
		}

		const savedBgStyle = localStorage.getItem('bgStyle') as BgStyle | null;
		if (savedBgStyle === 'aura' || savedBgStyle === 'plain' || savedBgStyle === 'gradient' || savedBgStyle === 'pattern') {
			this.bgStyle = savedBgStyle;
		} else {
			this.bgStyle = 'plain';
		}

		// Restore the persistent custom accent (previously only written, never read
		// back — which reset it on every refresh).
		try {
			const savedAccent = localStorage.getItem('customAccentColor');
			if (savedAccent && HEX_RE.test(savedAccent)) {
				const derivedAlt = shiftColorLightness(savedAccent, -12);
				const savedAlt = localStorage.getItem('customAccentAltColor');
				this.customAccentColor = savedAccent;
				this.customAccentAltColor = savedAlt && HEX_RE.test(savedAlt) ? savedAlt : derivedAlt;
				this.accentAltTouched = !!savedAlt && savedAlt !== derivedAlt;
				this.useCustomAccent = localStorage.getItem('useCustomAccent') === 'true';
			}
		} catch {}

		// Picks saved before per-mode memory (or under the other mode) are
		// re-homed so the restored state always fits the restored theme's mode.
		const initDark = this.isDark;
		this.normalizePick('aura', initDark);
		this.normalizePick('gradient', initDark);
		this.normalizePick('pattern', initDark);

		this.ensureBackgroundPreset(this.bgStyle);
		this.persistBackgroundState();
		this.apply(this.current, this.bgStyle);
	}

	setTheme(id: string) {
		const target = this.allThemes.find((t) => t.id === id);
		if (!target) return;

		const prevIsDark = this.isDark;
		this.current = id;
		if (target.isCustom && target.tokens) {
			this.activeCustomOverrides = target.tokens;
			if (target.customAura?.layers) {
				// Null the preset slot so the theme's own aura renders instead of
				// being shadowed by the last preset aura the user had selected.
				this.activeAura = null;
				this.activeCustomAuraLayers = target.customAura.layers;
			}
		} else {
			this.activeCustomOverrides = null;
			this.activeCustomAuraLayers = null;
		}

		// A theme switch that flips light/dark re-homes the mode-classified
		// backgrounds: the leaving mode's picks are archived, the target mode's
		// picks are restored, and persistence stays in sync.
		if (target.mode !== (prevIsDark ? 'dark' : 'light')) {
			this.refitBackgrounds(target.mode === 'dark');
		}

		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('theme', id);
			} catch {}
			this.apply(id, this.bgStyle);
		}
	}

	setBgStyle(style: BgStyle) {
		this.bgStyle = style;
		this.ensureBackgroundPreset(style);
		if (typeof window !== 'undefined') {
			this.persistBackgroundState();
			this.apply(this.current, style);
		}
	}

	setAura(id: string) {
		const target = AURA_PRESETS.find((a) => a.id === id);
		if (!target) return;
		this.activeAura = id;
		this.bgStyle = 'aura';
		if (typeof window !== 'undefined') {
			this.persistBackgroundState();
			this.apply(this.current, 'aura');
		}
	}

	clearAura() {
		this.activeAura = null;
		this.activeCustomAuraLayers = this.currentTheme.isCustom ? this.currentTheme.customAura?.layers ?? null : null;
		if (typeof window !== 'undefined') {
			try {
				localStorage.removeItem('aura');
			} catch {}
			this.apply(this.current, this.bgStyle);
		}
	}

	setGradient(id: string) {
		const target = GRADIENT_PRESETS.find((g) => g.id === id);
		if (!target) return;
		this.activeGradient = id;
		this.bgStyle = 'gradient';
		if (typeof window !== 'undefined') {
			this.persistBackgroundState();
			this.apply(this.current, 'gradient');
		}
	}

	clearGradient() {
		this.activeGradient = null;
		if (typeof window !== 'undefined') {
			try {
				localStorage.removeItem('gradient');
			} catch {}
		}
		if (this.bgStyle === 'gradient') {
			this.setBgStyle('plain');
		}
	}

	setPattern(id: string) {
		const target = PATTERNS.find((p) => p.id === id);
		if (!target) return;
		this.activePattern = id;
		this.bgStyle = 'pattern';
		if (typeof window !== 'undefined') {
			this.persistBackgroundState();
			this.apply(this.current, 'pattern');
		}
	}

	clearPattern() {
		this.activePattern = null;
		if (typeof window !== 'undefined') {
			try {
				localStorage.removeItem('pattern');
			} catch {}
		}
		if (this.bgStyle === 'pattern') {
			this.setBgStyle('plain');
		}
	}

	toggleBgStyle() {
		if (this.bgStyle === 'plain') {
			this.setBgStyle('aura');
		} else if (this.bgStyle === 'aura') {
			this.setBgStyle('gradient');
		} else if (this.bgStyle === 'gradient') {
			this.setBgStyle('pattern');
		} else {
			this.setBgStyle('plain');
		}
	}

	setCustomAccentColor(color: string) {
		this.customAccentColor = color;
		if (!this.accentAltTouched) {
			this.customAccentAltColor = shiftColorLightness(color, -12);
		}
		this.useCustomAccent = true;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('customAccentColor', color);
				localStorage.setItem('customAccentAltColor', this.customAccentAltColor);
				localStorage.setItem('useCustomAccent', 'true');
			} catch {}
		}
		this.apply(this.current, this.bgStyle);
	}

	setCustomAccentAltColor(color: string) {
		this.customAccentAltColor = color;
		this.accentAltTouched = true;
		this.useCustomAccent = true;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('customAccentAltColor', color);
				localStorage.setItem('useCustomAccent', 'true');
			} catch {}
		}
		this.apply(this.current, this.bgStyle);
	}

	// The only manual path that clears the accent override layer.
	resetCustomAccent() {
		this.useCustomAccent = false;
		this.accentAltTouched = false;
		this.customAccentColor = '#04825B';
		this.customAccentAltColor = '#047857';
		if (typeof window !== 'undefined') {
			try {
				localStorage.removeItem('customAccentColor');
				localStorage.removeItem('customAccentAltColor');
				localStorage.removeItem('useCustomAccent');
			} catch {}
		}
		this.apply(this.current, this.bgStyle);
	}

	setUseCustomAccent(use: boolean) {
		this.useCustomAccent = use;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('useCustomAccent', use ? 'true' : 'false');
			} catch {}
		}
		this.apply(this.current, this.bgStyle);
	}

	toggleMode() {
		// The twin (or first matching-mode) theme switch below re-homes the
		// mode-classified backgrounds: setTheme detects the mode flip and runs
		// refitBackgrounds, which archives each family's pick for the leaving
		// mode and restores the target mode's pick, then re-persists everything.
		const targetMode = this.isDark ? 'light' : 'dark';
		const twinId = THEME_TWINS[this.current];
		
		if (twinId && this.allThemes.some((t) => t.id === twinId)) {
			this.setTheme(twinId);
		} else {
			const matching = this.allThemes.filter((t) => t.mode === targetMode);
			if (matching.length) this.setTheme(matching[0].id);
		}

	}

	cycleNext() {
		const list = this.allThemes;
		const idx = list.findIndex((t) => t.id === this.current);
		const nextIdx = (idx + 1) % list.length;
		this.setTheme(list[nextIdx].id);
	}

	cycleRandom() {
		const pool = this.allThemes.filter((t) => t.id !== this.current);
		const randomTheme = pool[Math.floor(Math.random() * pool.length)];
		if (randomTheme) {
			this.setTheme(randomTheme.id);
		}
	}

	// Resets the theme and background style to defaults. The custom accent layer
	// is deliberately NOT touched: accent colors persist across resets, theme
	// switches and refreshes and are only cleared by the user themselves via
	// resetCustomAccent (the accent row's reset button).
	resetDefault() {
		this.activeCustomOverrides = null;
		this.activeCustomAuraLayers = null;
		this.activeAura = null;
		this.activeGradient = null;
		this.activePattern = null;
		if (typeof window !== 'undefined') {
			try {
				localStorage.removeItem('aura');
				localStorage.removeItem('gradient');
				localStorage.removeItem('pattern');
			} catch {}
		}
		this.clearCustomOverrides();
		this.setTheme(DEFAULT_THEME_ID);
		this.setBgStyle('plain');
	}

	togglePicker() {
		this.isOpen = !this.isOpen;
	}

	closePicker() {
		this.isOpen = false;
	}

	openPicker() {
		this.isOpen = true;
	}

	saveCustomTheme(custom: {
		id?: string;
		name: string;
		mode: 'light' | 'dark';
		description?: string;
		tokens: Record<string, string>;
		aura?: { id: string; name: string; description: string; layers: AuraLayer[] };
	}): ThemeInfo {
		const existingIdx = this.customThemes.findIndex(
			(t) => t.name.trim().toLowerCase() === custom.name.trim().toLowerCase() || (custom.id && t.id === custom.id)
		);
		const id = existingIdx >= 0 ? this.customThemes[existingIdx].id : custom.id || ('custom-' + Date.now().toString(36));

		const themeInfo: ThemeInfo = {
			id,
			name: custom.name,
			mode: custom.mode,
			accentColor: custom.tokens['theme-color'] || '#04825B',
			bgColor: custom.tokens['bg'] || (custom.mode === 'dark' ? '#0F172A' : '#FFFFFF'),
			textColor: custom.tokens['text-primary'] || (custom.mode === 'dark' ? '#F8FAFC' : '#0F172A'),
			description: custom.description || 'User created custom theme',
			auraId: custom.aura?.id || 'custom-aura',
			auraName: custom.aura?.name || 'Custom Aura',
			auraDescription: custom.aura?.description || 'Custom crafted gradient bloom',
			tokens: custom.tokens,
			isCustom: true,
			customAura: custom.aura
		};

		if (existingIdx >= 0) {
			this.customThemes[existingIdx] = themeInfo;
		} else {
			this.customThemes = [...this.customThemes, themeInfo];
		}

		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('customThemes', JSON.stringify(this.customThemes));
				localStorage.setItem('customTokens', JSON.stringify(custom.tokens));
			} catch {}
		}

		this.setTheme(id);
		return themeInfo;
	}

	deleteCustomTheme(id: string) {
		this.customThemes = this.customThemes.filter((t) => t.id !== id);
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('customThemes', JSON.stringify(this.customThemes));
			} catch {}
		}
		if (this.current === id) {
			this.resetDefault();
		}
	}

	setCustomTokens(tokens: Record<string, string>) {
		this.applyCustomOverrides(tokens);
	}

	applyCustomOverrides(tokens: Record<string, string>, auraLayers?: AuraLayer[]) {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		this.activeCustomOverrides = tokens;
		if (auraLayers) this.activeCustomAuraLayers = auraLayers;

		for (const [key, val] of Object.entries(tokens)) {
			root.style.setProperty('--' + key, val);
		}
	}

	clearCustomOverrides() {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		this.activeCustomOverrides = null;
		this.activeCustomAuraLayers = null;

		for (const token of CORE_TOKENS) {
			root.style.removeProperty('--' + token.key);
		}
	}

	apply(id: string, style?: BgStyle) {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		const currentStyle = style ?? this.bgStyle;

		// Clear inline token properties first
		this.clearCustomOverrides();

		// Remove all theme classes
		for (const theme of this.allThemes) {
			root.classList.remove(theme.id);
		}

		// Apply target theme class
		root.classList.add(id);

		const theme = this.allThemes.find((t) => t.id === id);
		if (theme) {
			root.setAttribute('data-theme', theme.mode);
			root.setAttribute('data-mode', theme.mode);
			root.setAttribute('data-theme-id', theme.id);
			root.setAttribute('data-theme-family', theme.id);
			root.setAttribute('data-bg-style', currentStyle);
			root.style.colorScheme = theme.mode;

			if (theme.tokens) {
				for (const [key, value] of Object.entries(theme.tokens)) {
					root.style.setProperty('--' + key, value);
				}
				if (theme.tokens['theme-color']) {
					root.style.setProperty('--ring', `color-mix(in srgb, ${theme.tokens['theme-color']} 35%, transparent)`);
				}
			}

			if (theme.isCustom && theme.tokens) {
				this.applyCustomOverrides(theme.tokens, theme.customAura?.layers);
			}

			// The accent layer is applied LAST so it wins over any theme's own
			// accent — built-in or custom.
			if (this.useCustomAccent) {
				root.style.setProperty('--theme-color', this.customAccentColor);
				root.style.setProperty('--theme-color-alt', this.customAccentAltColor);
			}

			if (currentStyle === 'gradient' && this.activeGradientPreset) {
				root.style.setProperty('--bg-gradient', this.activeGradientPreset.css);
			} else {
				root.style.removeProperty('--bg-gradient');
			}

			// Glass regime: with a vivid background owning the canvas, -bg-* tokens
			// turn translucent (mixed from the theme's own literals) so surfaces stop
			// competing with the backdrop. --glass-blur feeds backdrop-filter in
			// styles/_glass.sass. In plain mode the opaque token values stand.
			if (currentStyle === 'plain') {
				root.style.removeProperty('--glass-blur');
			} else {
				for (const [key, alpha] of Object.entries(GLASS_TOKEN_ALPHAS)) {
					const literal = theme.tokens?.[key] ?? CORE_TOKENS.find((t) => t.key === key)?.defaultVal;
					if (literal) {
						root.style.setProperty('--' + key, `color-mix(in srgb, ${literal} ${alpha}%, transparent)`);
					}
				}
				root.style.setProperty('--glass-blur', '14px');
			}
		}
	}
}

export const themeState = new ThemeState();


