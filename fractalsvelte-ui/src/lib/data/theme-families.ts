import { THEMES, type ThemeInfo } from './themes.js';

export type ThemeMode = 'light' | 'dark';

export type ThemeFamily = {
	id: string;
	name: string;
	variants: Record<ThemeMode, ThemeInfo>;
	isDerived: Record<ThemeMode, boolean>;
};

const lightSurfaceTokens = {
	bg: '#fdfefe',
	'bg-surface': '#f8f7f7',
	'bg-raised': '#f1f5f9',
	'bg-panel': '#f1f3f5',
	'bg-footer': '#e9ecef',
	'bg-popover': '#ffffff',
	'bg-dialog': '#ffffff',
	'bg-terminal': '#0f172a',
	'bg-input': '#ffffff',
	'bg-canvas': '#f8f9fa',
	border: '#e2e8f0',
	'border-subtle': '#edf2f7',
	'text-primary': '#0f172a',
	'text-secondary': '#5b6472',
	'text-muted': '#929497',
	'text-inverse': '#ffffff',
	'state-hover': '#e2e8f0',
	'state-hover-subtle': '#f1f5f9',
	'state-selected': '#cbd5e1'
};

const darkSurfaceTokens = {
	bg: '#111827',
	'bg-surface': '#18212f',
	'bg-raised': '#253041',
	'bg-panel': '#202b3b',
	'bg-footer': '#17202e',
	'bg-popover': '#202b3b',
	'bg-dialog': '#202b3b',
	'bg-terminal': '#0f172a',
	'bg-input': '#17202e',
	'bg-canvas': '#111827',
	border: '#334155',
	'border-subtle': '#27364a',
	'text-primary': '#f8fafc',
	'text-secondary': '#cbd5e1',
	'text-muted': '#94a3b8',
	'text-inverse': '#0f172a',
	'state-hover': '#334155',
	'state-hover-subtle': '#263244',
	'state-selected': '#3b4b61'
};

function familyKey(theme: ThemeInfo) {
	return theme.id
		.replace(/^theme-/, '')
		.replace(/^light-/, 'default-')
		.replace(/-(light|dark)$/, '')
		.replace(/-day$/, '');
}

function familyName(theme: ThemeInfo) {
	return theme.name.replace(/\s+(light|dark)$/i, '').replace(/\s+day$/i, '');
}

function deriveVariant(source: ThemeInfo, mode: ThemeMode, name: string): ThemeInfo {
	const surfaces = mode === 'dark' ? darkSurfaceTokens : lightSurfaceTokens;
	const accentColor = source.tokens['theme-color'] ?? source.accentColor;
	const accentColorAlt = source.tokens['theme-color-alt'] ?? accentColor;
	return {
		...source,
		id: `${source.id}-${mode}-derived`,
		name: `${name} ${mode === 'dark' ? 'Dark' : 'Light'}`,
		mode,
		bgColor: surfaces.bg,
		textColor: surfaces['text-primary'],
		tokens: { ...source.tokens, ...surfaces, 'theme-color': accentColor, 'theme-color-alt': accentColorAlt }
	};
}

export const THEME_FAMILIES: ThemeFamily[] = Object.values(
	THEMES.reduce<Record<string, { name: string; light?: ThemeInfo; dark?: ThemeInfo }>>((families, theme) => {
		const id = familyKey(theme);
		const family = families[id] ?? { name: familyName(theme) };
		family[theme.mode] = theme;
		families[id] = family;
		return families;
	}, {})
).map((family) => {
	const light = family.light ?? deriveVariant(family.dark!, 'light', family.name);
	const dark = family.dark ?? deriveVariant(family.light!, 'dark', family.name);
	return {
		id: familyKey(light),
		name: family.name,
		variants: { light, dark },
		isDerived: { light: !family.light, dark: !family.dark }
	};
});
