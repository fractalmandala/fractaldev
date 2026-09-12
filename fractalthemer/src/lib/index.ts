// Components
export { default as ThemePicker } from './components/ThemePicker.svelte';
export { default as ThemeToggle } from './components/ThemeToggle.svelte';
export { default as AuraBackground } from './components/AuraBackground.svelte';
export { default as ThemeScript } from './components/ThemeScript.svelte';

// State & Runes
export { themeState, ThemeState } from './state/theme.svelte.js';

// Data & Constants
export {
	THEMES,
	LIGHT_THEMES,
	DARK_THEMES,
	DEFAULT_THEME_ID,
	THEME_TWINS,
	type ThemeInfo,
	type BgStyle
} from './data/themes.js';

export { CORE_TOKENS, type TokenMeta } from './data/tokens.js';
export { AURA_PRESETS, type AuraLayer, type AuraPreset } from './data/auras.js';
export { GRADIENT_PRESETS, isGradientDark, type GradientPreset } from './data/gradients.js';
export {
	PATTERNS,
	PATTERN_CATEGORIES,
	isPatternDark,
	type Pattern,
	type PatternCategory
} from './data/patterns.js';

// Utilities
export { getAntiFlickerScript } from './utils/anti-flicker.js';
