// Playground themes — 12 favourites + full search index.
// Pairing rule (api §4.5): dark class => data-mode="dark", light => "light".
// The class + mode stamp on the CANVAS wrapper, never on <html>.

export interface ThemeEntry {
	name: string;
	mode: 'light' | 'dark';
	fav?: boolean;
}

export const FAV_THEMES: ThemeEntry[] = [
	{ name: 'theme-light-default', mode: 'light', fav: true },
	{ name: 'theme-editorial-light', mode: 'light', fav: true },
	{ name: 'theme-sakura-light', mode: 'light', fav: true },
	{ name: 'theme-matcha-light', mode: 'light', fav: true },
	{ name: 'theme-himalaya-light', mode: 'light', fav: true },
	{ name: 'theme-clay-studio-light', mode: 'light', fav: true },
	{ name: 'theme-night-dark', mode: 'dark', fav: true },
	{ name: 'theme-dracula-dark', mode: 'dark', fav: true },
	{ name: 'theme-catppuccin-mocha', mode: 'dark', fav: true },
	{ name: 'theme-nord-dark', mode: 'dark', fav: true },
	{ name: 'theme-gruvbox-dark', mode: 'dark', fav: true },
	{ name: 'theme-midnight-emerald-dark', mode: 'dark', fav: true }
];

export const ALL_THEMES: ThemeEntry[] = [
	...FAV_THEMES,
	{ name: 'theme-space-light', mode: 'light' },
	{ name: 'theme-sun-light', mode: 'light' },
	{ name: 'theme-monochrono-light', mode: 'light' },
	{ name: 'theme-molly-light', mode: 'light' },
	{ name: 'theme-malana-light', mode: 'light' },
	{ name: 'theme-coresync-light', mode: 'light' },
	{ name: 'theme-studio-light', mode: 'light' },
	{ name: 'theme-nordic-frost-light', mode: 'light' },
	{ name: 'theme-desert-dune-light', mode: 'light' },
	{ name: 'theme-lavender-mist-light', mode: 'light' },
	{ name: 'theme-botanical-light', mode: 'light' },
	{ name: 'theme-solaris-light', mode: 'light' },
	{ name: 'theme-cyberpunk-day-light', mode: 'light' },
	{ name: 'theme-copper-patina-light', mode: 'light' },
	{ name: 'theme-dracula-light', mode: 'light' },
	{ name: 'theme-dark-default', mode: 'dark' },
	{ name: 'theme-lagoona-dark', mode: 'dark' },
	{ name: 'theme-frozen-dark', mode: 'dark' },
	{ name: 'theme-inkworm-dark', mode: 'dark' },
	{ name: 'theme-monochrono-dark', mode: 'dark' },
	{ name: 'theme-fouram-dark', mode: 'dark' },
	{ name: 'theme-wintercame-dark', mode: 'dark' },
	{ name: 'theme-sun-dark', mode: 'dark' },
	{ name: 'theme-console-dark', mode: 'dark' },
	{ name: 'theme-rose-pine-dark', mode: 'dark' },
	{ name: 'theme-obsidian-crimson-dark', mode: 'dark' },
	{ name: 'theme-synthwave-dark', mode: 'dark' },
	{ name: 'theme-deep-ocean-dark', mode: 'dark' },
	{ name: 'theme-amethyst-void-dark', mode: 'dark' },
	{ name: 'theme-himalaya-dark', mode: 'dark' },
	{ name: 'theme-editorial-dark', mode: 'dark' },
	{ name: 'theme-space-dark', mode: 'dark' }
];

export function searchThemes(q: string): ThemeEntry[] {
	const needle = q.trim().toLowerCase();
	if (!needle) return FAV_THEMES;
	return ALL_THEMES.filter((t) => t.name.toLowerCase().includes(needle)).slice(0, 12);
}
