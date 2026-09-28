import { THEMES, type ThemeInfo } from './themes.js';

export type ThemeMode = 'light' | 'dark';

export type ThemeFamily = {
	id: string;
	name: string;
	variants: Record<ThemeMode, ThemeInfo>;
	isDerived: Record<ThemeMode, boolean>;
};

const lightSurfaceTokens = {
	'white-fixed': '#FFFFFF',
	'black-fixed': '#171717',
	bg: '#FAFAFA',
	'bg-surface': '#FAFAFA',
	'bg-raised': '#F4F4F5',
	'bg-panel': '#FBFBF9',
	'bg-sunken': '#FFFFFF',
	'bg-popover': '#FAF7F7',
	'bg-button': '#CED8D3',
	'bg-sidebar': '#FAFAFA',
	'bg-input': '#FAF7F7',
	'bg-button-soft': '#F8FAFC',
	border: '#d8d8d8',
	'border-subtle': '#eceaea',
	'border-strong': '#cfcfcf',
	'text-primary': '#262627',
	'text-secondary': '#777777',
	'text-muted': '#aeaeae',
	'text-inverse': '#ffffff',
	'state-hover': '#eae9e8',
	'state-selected': '#eaeae9'
};

const darkSurfaceTokens = {
	'white-fixed': '#FFFFFF',
	'black-fixed': '#171717',
	bg: '#171717',
	'bg-surface': '#191919',
	'bg-raised': '#242424',
	'bg-panel': '#1e1e1e',
	'bg-sunken': '#121212',
	'bg-popover': '#1e1e1e',
	'bg-button': '#333333',
	'bg-sidebar': '#171717',
	'bg-input': '#1e1e1e',
	'bg-button-soft': '#222222',
	border: '#2a2a2a',
	'border-subtle': '#242424',
	'border-strong': '#363636',
	'text-primary': '#eceaea',
	'text-secondary': '#9a9a9a',
	'text-muted': '#6b6b6b',
	'text-inverse': '#171717',
	'state-hover': '#242424',
	'state-selected': '#2b2b2b'
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
