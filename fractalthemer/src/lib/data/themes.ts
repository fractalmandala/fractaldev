import type { AuraLayer, AuraPreset } from "./auras.js";

export type BgStyle = "plain" | "aura" | "gradient" | "pattern";

export interface ThemeInfo {
	id: string;
	name: string;
	mode: 'light' | 'dark';
	twinId?: string;
	accentColor: string;
	bgColor: string;
	textColor: string;
	description: string;
	auraId: string;
	auraName: string;
	auraDescription: string;
	tokens: Record<string, string>;
	isCustom?: boolean;
	customAura?: {
		id: string;
		name: string;
		description: string;
		layers: AuraLayer[];
	};
}

export const THEME_TWINS: Record<string, string> = {
	'theme-light-default': 'theme-night-dark',
	'theme-night-dark': 'theme-light-default',
	'theme-himalaya-light': 'theme-frozen-dark',
	'theme-frozen-dark': 'theme-himalaya-light',
	'theme-editorial-light': 'theme-inkworm-dark',
	'theme-inkworm-dark': 'theme-editorial-light',
	'theme-space-light': 'theme-deep-ocean-dark',
	'theme-deep-ocean-dark': 'theme-space-light',
	'theme-sun-light': 'theme-obsidian-crimson-dark',
	'theme-obsidian-crimson-dark': 'theme-sun-light',
	'theme-monochrono-light': 'theme-monochrono-dark',
	'theme-monochrono-dark': 'theme-monochrono-light',
	'theme-molly-light': 'theme-lagoona-dark',
	'theme-lagoona-dark': 'theme-molly-light',
	'theme-malana-light': 'theme-fouram-dark',
	'theme-fouram-dark': 'theme-malana-light',
	'theme-coresync-light': 'theme-console-dark',
	'theme-console-dark': 'theme-coresync-light',
	'theme-studio-light': 'theme-gruvbox-dark',
	'theme-gruvbox-dark': 'theme-studio-light',
	'theme-matcha-light': 'theme-midnight-emerald-dark',
	'theme-midnight-emerald-dark': 'theme-matcha-light',
	'theme-sakura-light': 'theme-amethyst-void-dark',
	'theme-amethyst-void-dark': 'theme-sakura-light',
	'theme-nordic-frost-light': 'theme-nord-dark',
	'theme-nord-dark': 'theme-nordic-frost-light',
	'theme-desert-dune-light': 'theme-catppuccin-mocha',
	'theme-catppuccin-mocha': 'theme-desert-dune-light',
	'theme-lavender-mist-light': 'theme-synthwave-dark',
	'theme-synthwave-dark': 'theme-lavender-mist-light',
	'theme-botanical-light': 'theme-dracula-dark',
	'theme-dracula-dark': 'theme-botanical-light',
	'theme-paper-crisp-light': 'theme-wintercame-dark',
	'theme-wintercame-dark': 'theme-paper-crisp-light',
	'theme-sandstone-light': 'theme-sun-dark',
	'theme-sun-dark': 'theme-sandstone-light',
	'theme-terracotta-studio-light': 'theme-onedark-pro',
	'theme-onedark-pro': 'theme-terracotta-studio-light',
	'theme-ivory-slate-light': 'theme-rose-pine-dark',
	'theme-rose-pine-dark': 'theme-ivory-slate-light'
};


export interface TokenMeta {
	key: string;
	label: string;
	category: 'surface' | 'typography' | 'border' | 'state' | 'accent';
	description: string;
	defaultVal: string;
}

export const CORE_TOKENS: TokenMeta[] = [
	{ key: 'bg', label: 'App Canvas Base', category: 'surface', description: 'Deepest backdrop surface of the application', defaultVal: '#FFFFFF' },
	{ key: 'bg-surface', label: 'Card Surface', category: 'surface', description: 'Primary card and content container background', defaultVal: '#F8F9FA' },
	{ key: 'bg-raised', label: 'Raised Elements', category: 'surface', description: 'Elevated popovers, floating headers, tooltips', defaultVal: '#FFFFFF' },
	{ key: 'bg-panel', label: 'Sidebars & Panels', category: 'surface', description: 'Navbars, lateral sidebars, drawer panels', defaultVal: '#F1F3F5' },
	{ key: 'bg-footer', label: 'Footer Surface', category: 'surface', description: 'Bottom footer area', defaultVal: '#E9ECEF' },
	{ key: 'bg-popover', label: 'Popover & Modals', category: 'surface', description: 'Modal dialogs, dropdowns, popup menus', defaultVal: '#FFFFFF' },
	{ key: 'bg-dialog', label: 'Dialog Backdrop', category: 'surface', description: 'Dialog card background', defaultVal: '#FFFFFF' },
	{ key: 'bg-terminal', label: 'Code & Terminal', category: 'surface', description: 'Terminal blocks and code view background', defaultVal: '#0F172A' },
	{ key: 'bg-input', label: 'Form Inputs', category: 'surface', description: 'Input fields, textareas, select boxes', defaultVal: '#FFFFFF' },
	{ key: 'bg-canvas', label: 'Canvas / Viewport', category: 'surface', description: 'Outer workspace canvas background', defaultVal: '#F8F9FA' },
	{ key: 'border', label: 'Standard Border', category: 'border', description: 'Primary borders, card outlines, separators', defaultVal: '#E2E8F0' },
	{ key: 'border-subtle', label: 'Subtle Border', category: 'border', description: 'Faint divider lines and inner item borders', defaultVal: '#EDF2F7' },
	{ key: 'text-primary', label: 'Primary Text', category: 'typography', description: 'Headings, titles, high-contrast text', defaultVal: '#0F172A' },
	{ key: 'text-secondary', label: 'Secondary Text', category: 'typography', description: 'Body paragraphs, descriptions, labels', defaultVal: '#475569' },
	{ key: 'text-muted', label: 'Muted Text', category: 'typography', description: 'Captions, timestamps, metadata', defaultVal: '#7F91AA' },
	{ key: 'text-inverse', label: 'Inverse Text', category: 'typography', description: 'Contrast text on brand/accent buttons', defaultVal: '#FFFFFF' },
	{ key: 'state-hover', label: 'Hover State', category: 'state', description: 'Background tint on button and card hover', defaultVal: '#E2E8F0' },
	{ key: 'state-hover-subtle', label: 'Subtle Hover', category: 'state', description: 'Gentle hover state on list items', defaultVal: '#F1F5F9' },
	{ key: 'state-selected', label: 'Selected State', category: 'state', description: 'Active tab, selected item highlight', defaultVal: '#CBD5E1' },
	{ key: 'theme-color', label: 'Brand Accent', category: 'accent', description: 'Primary brand action color, active badges, highlights', defaultVal: '#04825B' },
	{ key: 'theme-color-alt', label: 'Accent Alternate', category: 'accent', description: 'Hover state for brand accent buttons', defaultVal: '#047857' },
];

export const THEMES: ThemeInfo[] = [
	{
		id: 'theme-light-default',
		name: 'Default Light',
		mode: 'light',
		accentColor: '#04825B',
		bgColor: '#FFFFFF',
		textColor: '#0F172A',
		description: 'Emerald accent on clean white',
		auraId: 'mesh-frosted-jade',
		auraName: 'Frosted Jade',
		auraDescription: 'Ancient jade carved from glacier ice and mountain mist',
		tokens: {
		  "bg": "#FFFFFF",
		  "bg-surface": "#F8F9FA",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#F1F3F5",
		  "bg-footer": "#E9ECEF",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#0F172A",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#F8F9FA",
		  "border": "#E2E8F0",
		  "border-subtle": "#EDF2F7",
		  "text-primary": "#0F172A",
		  "text-secondary": "#475569",
		  "text-muted": "#7F91AA",
		  "state-hover": "#E2E8F0",
		  "state-hover-subtle": "#F1F5F9",
		  "state-selected": "#CBD5E1",
		  "theme-color": "#04825B",
		  "theme-color-alt": "#047857",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#DC2626",
		  "syntax-heading": "#047857",
		  "syntax-link": "#04825B",
		  "syntax-code": "#DC2626",
		  "syntax-quote": "#475569",
		  "syntax-marker": "#04825B",
		  "syntax-meta": "#7C3AED",
		  "syntax-comment": "#7F91AA",
		  "canvas-postit-bg": "#FEF3C7",
		  "canvas-postit-text": "#1F1B0A",
		  "scrollbar-thumb": "#CBD5E1",
		  "md-h1": "#0F172A",
		  "md-h2": "#04825B",
		  "md-h3": "#7C3AED",
		  "md-bold": "#047857",
		  "md-code": "#DC2626",
		  "md-code-back": "#F1F5F9",
		  "md-bullet": "#04825B",
		  "md-bullet-in": "#04825B",
		  "md-blockquote": "#475569",
		  "border-md-table": "#E2E8F0"
		}
	},
	{
		id: 'theme-himalaya-light',
		name: 'Himalaya Light',
		mode: 'light',
		accentColor: '#2563EB',
		bgColor: '#F8FAFC',
		textColor: '#0F172A',
		description: 'Alpine slate & azure on mist',
		auraId: 'glacier-mist',
		auraName: 'Glacier Mist',
		auraDescription: 'Cyan into indigo',
		tokens: {
		  "bg": "#F8FAFC",
		  "bg-surface": "#FFFFFF",
		  "bg-raised": "#F1F5F9",
		  "bg-panel": "#EAEFF5",
		  "bg-footer": "#E2E8F0",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#0B1120",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#F8FAFC",
		  "border": "#CBD5E1",
		  "border-subtle": "#E2E8F0",
		  "text-primary": "#0F172A",
		  "text-secondary": "#334155",
		  "text-muted": "#64748B",
		  "state-hover": "#E2E8F0",
		  "state-hover-subtle": "#F1F5F9",
		  "state-selected": "#CBD5E1",
		  "theme-color": "#2563EB",
		  "theme-color-alt": "#1D4ED8",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#D92D20",
		  "syntax-heading": "#1E293B",
		  "syntax-link": "#2563EB",
		  "syntax-code": "#DC2626",
		  "syntax-quote": "#475467",
		  "syntax-marker": "#2563EB",
		  "syntax-meta": "#5A5DF0",
		  "syntax-comment": "#7B8EA8",
		  "canvas-postit-bg": "#EFF6FF",
		  "canvas-postit-text": "#1E3A8A",
		  "scrollbar-thumb": "#CBD5E1",
		  "md-h1": "#0F172A",
		  "md-h2": "#2563EB",
		  "md-h3": "#475569",
		  "md-bold": "#1E293B",
		  "md-code": "#2563EB",
		  "md-code-back": "#F1F5F9",
		  "md-bullet": "#2563EB",
		  "md-bullet-in": "#0769E3",
		  "md-blockquote": "#334155",
		  "border-md-table": "#CBD5E1"
		}
	},
	{
		id: 'theme-editorial-light',
		name: 'Editorial Light',
		mode: 'light',
		accentColor: '#2E5A36',
		bgColor: '#FAF8F5',
		textColor: '#232220',
		description: 'Forest olive on classic book paper',
		auraId: 'warm-ash',
		auraName: 'Warm Ash',
		auraDescription: 'Warm greige tones, understated and airy',
		tokens: {
		  "bg": "#FAF8F5",
		  "bg-surface": "#F2EFE9",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#EAE5DC",
		  "bg-footer": "#E0D9CE",
		  "bg-popover": "#FFFEFA",
		  "bg-dialog": "#FFFEFA",
		  "bg-terminal": "#1F2421",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#FAF8F5",
		  "border": "#DCD5C9",
		  "border-subtle": "#E8E2D7",
		  "text-primary": "#232220",
		  "text-secondary": "#58554E",
		  "text-muted": "#8E8A80",
		  "state-hover": "#E5DFC0",
		  "state-hover-subtle": "#F4F0E8",
		  "state-selected": "#D8CEBC",
		  "theme-color": "#2E5A36",
		  "theme-color-alt": "#43734C",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#BA1A1A",
		  "syntax-heading": "#2E5A36",
		  "syntax-link": "#43734C",
		  "syntax-code": "#BA1A1A",
		  "syntax-quote": "#58554E",
		  "syntax-marker": "#2E5A36",
		  "syntax-meta": "#8B6A30",
		  "syntax-comment": "#8E8A80",
		  "canvas-postit-bg": "#FFF9E6",
		  "canvas-postit-text": "#201A05",
		  "scrollbar-thumb": "#DCD5C9",
		  "md-h1": "#232220",
		  "md-h2": "#2E5A36",
		  "md-h3": "#4A4640",
		  "md-bold": "#2E5A36",
		  "md-code": "#43734C",
		  "md-code-back": "#F2EFE9",
		  "md-bullet": "#2E5A36",
		  "md-bullet-in": "#58554E",
		  "md-blockquote": "#4A4640",
		  "border-md-table": "#DCD5C9"
		}
	},
	{
		id: 'theme-space-light',
		name: 'Space Light',
		mode: 'light',
		accentColor: '#0D7A4D',
		bgColor: '#F4F8F6',
		textColor: '#0D261C',
		description: 'Pine mint & frost green canvas',
		auraId: 'flux-sage-smoke',
		auraName: 'Sage Smoke',
		auraDescription: 'Muted sage and eucalyptus shapes drifting through pale air',
		tokens: {
		  "bg": "#F4F8F6",
		  "bg-surface": "#E8F1EC",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#DCE8E2",
		  "bg-footer": "#CFDFD7",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#0A1C14",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#F4F8F6",
		  "border": "#BED4C8",
		  "border-subtle": "#D6E5DC",
		  "text-primary": "#0D261C",
		  "text-secondary": "#335C4A",
		  "text-muted": "#688E7D",
		  "state-hover": "#CFE2D7",
		  "state-hover-subtle": "#E2EEE7",
		  "state-selected": "#B8D3C4",
		  "theme-color": "#0D7A4D",
		  "theme-color-alt": "#065F38",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#DC2626",
		  "syntax-heading": "#0D7A4D",
		  "syntax-link": "#0B7C56",
		  "syntax-code": "#DC2626",
		  "syntax-quote": "#335C4A",
		  "syntax-marker": "#0D7A4D",
		  "syntax-meta": "#0273AE",
		  "syntax-comment": "#688E7D",
		  "canvas-postit-bg": "#E6F7F0",
		  "canvas-postit-text": "#064E3B",
		  "scrollbar-thumb": "#BED4C8",
		  "md-h1": "#0D261C",
		  "md-h2": "#0D7A4D",
		  "md-h3": "#335C4A",
		  "md-bold": "#065F38",
		  "md-code": "#0D7A4D",
		  "md-code-back": "#E8F1EC",
		  "md-bullet": "#0D7A4D",
		  "md-bullet-in": "#0B7C56",
		  "md-blockquote": "#335C4A",
		  "border-md-table": "#BED4C8"
		}
	},
	{
		id: 'theme-sun-light',
		name: 'Sun Light',
		mode: 'light',
		accentColor: '#B64F2A',
		bgColor: '#FAF6F0',
		textColor: '#2E1E14',
		description: 'Terracotta amber & sunbaked clay',
		auraId: 'golden-hour',
		auraName: 'Golden Hour',
		auraDescription: 'Amber melting into burnt sienna',
		tokens: {
		  "bg": "#FAF6F0",
		  "bg-surface": "#F3ECE0",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#EAE0D0",
		  "bg-footer": "#E0D4C0",
		  "bg-popover": "#FFFCF7",
		  "bg-dialog": "#FFFCF7",
		  "bg-terminal": "#241814",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#FAF6F0",
		  "border": "#D8C8B4",
		  "border-subtle": "#E8DDCC",
		  "text-primary": "#2E1E14",
		  "text-secondary": "#684E3E",
		  "text-muted": "#9E806E",
		  "state-hover": "#E5D2BF",
		  "state-hover-subtle": "#F4EAE0",
		  "state-selected": "#D5BDA6",
		  "theme-color": "#B64F2A",
		  "theme-color-alt": "#9E3C1B",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#B91C1C",
		  "syntax-heading": "#B64F2A",
		  "syntax-link": "#BE480A",
		  "syntax-code": "#B91C1C",
		  "syntax-quote": "#684E3E",
		  "syntax-marker": "#B64F2A",
		  "syntax-meta": "#B45309",
		  "syntax-comment": "#9E806E",
		  "canvas-postit-bg": "#FDF2E9",
		  "canvas-postit-text": "#2D1E18",
		  "scrollbar-thumb": "#D8C8B4",
		  "md-h1": "#2E1E14",
		  "md-h2": "#B64F2A",
		  "md-h3": "#684E3E",
		  "md-bold": "#9E3C1B",
		  "md-code": "#BE480A",
		  "md-code-back": "#F3ECE0",
		  "md-bullet": "#B64F2A",
		  "md-bullet-in": "#BE480A",
		  "md-blockquote": "#684E3E",
		  "border-md-table": "#D8C8B4"
		}
	},
	{
		id: 'theme-monochrono-light',
		name: 'Monochrono Light',
		mode: 'light',
		accentColor: '#312E81',
		bgColor: '#FFFFFF',
		textColor: '#09090B',
		description: 'High contrast minimalist ink & indigo',
		auraId: 'lattice-light-weave',
		auraName: 'Light Weave',
		auraDescription: 'Delicate grid on soft blue with subtle glow',
		tokens: {
		  "bg": "#FFFFFF",
		  "bg-surface": "#F4F4F6",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#E9E9EE",
		  "bg-footer": "#DDDEE5",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#09090B",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#FFFFFF",
		  "border": "#D1D1DB",
		  "border-subtle": "#E4E4EB",
		  "text-primary": "#09090B",
		  "text-secondary": "#49495A",
		  "text-muted": "#84849A",
		  "state-hover": "#E2E2EB",
		  "state-hover-subtle": "#F0F0F5",
		  "state-selected": "#D0D0DD",
		  "theme-color": "#312E81",
		  "theme-color-alt": "#4338CA",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#EF4444",
		  "syntax-heading": "#1E1B4B",
		  "syntax-link": "#4338CA",
		  "syntax-code": "#E71414",
		  "syntax-quote": "#49495A",
		  "syntax-marker": "#312E81",
		  "syntax-meta": "#7C3AED",
		  "syntax-comment": "#84849A",
		  "canvas-postit-bg": "#EEF2FF",
		  "canvas-postit-text": "#1E1B4B",
		  "scrollbar-thumb": "#D1D1DB",
		  "md-h1": "#09090B",
		  "md-h2": "#312E81",
		  "md-h3": "#49495A",
		  "md-bold": "#1E1B4B",
		  "md-code": "#4338CA",
		  "md-code-back": "#F4F4F6",
		  "md-bullet": "#312E81",
		  "md-bullet-in": "#4338CA",
		  "md-blockquote": "#49495A",
		  "border-md-table": "#D1D1DB"
		}
	},
	{
		id: 'theme-molly-light',
		name: 'Molly Light',
		mode: 'light',
		accentColor: '#0273AE',
		bgColor: '#F0F7FF',
		textColor: '#0B2545',
		description: 'Sky azure & ocean periwinkle',
		auraId: 'glass-aqua-bubble',
		auraName: 'Aqua Bubble',
		auraDescription: 'Soft translucent bubbles suspended in an aquatic glass surface',
		tokens: {
		  "bg": "#F0F7FF",
		  "bg-surface": "#E0EFFF",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#D0E4FA",
		  "bg-footer": "#BED8F5",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#0A192F",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#F0F7FF",
		  "border": "#B6D4F2",
		  "border-subtle": "#D2E4F8",
		  "text-primary": "#0B2545",
		  "text-secondary": "#2A4B7C",
		  "text-muted": "#5C7CA8",
		  "state-hover": "#CBE2F8",
		  "state-hover-subtle": "#E2EFFC",
		  "state-selected": "#B3D4F5",
		  "theme-color": "#0273AE",
		  "theme-color-alt": "#0369A1",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#EF4444",
		  "syntax-heading": "#0369A1",
		  "syntax-link": "#0273AE",
		  "syntax-code": "#D91313",
		  "syntax-quote": "#2A4B7C",
		  "syntax-marker": "#0B786E",
		  "syntax-meta": "#7C3AED",
		  "syntax-comment": "#5C7CA8",
		  "canvas-postit-bg": "#E0F2FE",
		  "canvas-postit-text": "#0369A1",
		  "scrollbar-thumb": "#B6D4F2",
		  "md-h1": "#0B2545",
		  "md-h2": "#0273AE",
		  "md-h3": "#7C3AED",
		  "md-bold": "#0369A1",
		  "md-code": "#0273AE",
		  "md-code-back": "#E0EFFF",
		  "md-bullet": "#0273AE",
		  "md-bullet-in": "#0273AE",
		  "md-blockquote": "#2A4B7C",
		  "border-md-table": "#B6D4F2"
		}
	},
	{
		id: 'theme-malana-light',
		name: 'Malana Light',
		mode: 'light',
		accentColor: '#BA501F',
		bgColor: '#FCF9F2',
		textColor: '#211812',
		description: 'Cream sandstone & warm cinnamon',
		auraId: 'grain-terracotta',
		auraName: 'Terracotta',
		auraDescription: 'Burnt clay with warm tactile grain',
		tokens: {
		  "bg": "#FCF9F2",
		  "bg-surface": "#F4EDE0",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#EADECB",
		  "bg-footer": "#DFCEB5",
		  "bg-popover": "#FFFDF9",
		  "bg-dialog": "#FFFDF9",
		  "bg-terminal": "#1C1814",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#FCF9F2",
		  "border": "#D7C7AE",
		  "border-subtle": "#E9DECD",
		  "text-primary": "#211812",
		  "text-secondary": "#5E4B3E",
		  "text-muted": "#937F70",
		  "state-hover": "#E5D3BD",
		  "state-hover-subtle": "#F3E8DA",
		  "state-selected": "#D4BD9E",
		  "theme-color": "#BA501F",
		  "theme-color-alt": "#B44614",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#DC2626",
		  "syntax-heading": "#BA501F",
		  "syntax-link": "#C3490A",
		  "syntax-code": "#DC2626",
		  "syntax-quote": "#5E4B3E",
		  "syntax-marker": "#15803D",
		  "syntax-meta": "#B45309",
		  "syntax-comment": "#937F70",
		  "canvas-postit-bg": "#FEF3C7",
		  "canvas-postit-text": "#451A03",
		  "scrollbar-thumb": "#D7C7AE",
		  "md-h1": "#211812",
		  "md-h2": "#BA501F",
		  "md-h3": "#15803D",
		  "md-bold": "#B44614",
		  "md-code": "#C3490A",
		  "md-code-back": "#F4EDE0",
		  "md-bullet": "#BA501F",
		  "md-bullet-in": "#B45309",
		  "md-blockquote": "#5E4B3E",
		  "border-md-table": "#D7C7AE"
		}
	},
	{
		id: 'theme-coresync-light',
		name: 'Coresync Light',
		mode: 'light',
		accentColor: '#BD3300',
		bgColor: '#E6E8EC',
		textColor: '#111622',
		description: 'Industrial titanium & flame orange',
		auraId: 'grain-concrete',
		auraName: 'Concrete Grain',
		auraDescription: 'Cool concrete gray with fine analog texture',
		tokens: {
		  "bg": "#E6E8EC",
		  "bg-surface": "#F0F2F5",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#DCE0E6",
		  "bg-footer": "#CFD4DC",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#111318",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#E6E8EC",
		  "border": "#C4CAD4",
		  "border-subtle": "#D8DDE5",
		  "text-primary": "#111622",
		  "text-secondary": "#424B5D",
		  "text-muted": "#728096",
		  "state-hover": "#D2D8E2",
		  "state-hover-subtle": "#E5EAF0",
		  "state-selected": "#BFC7D5",
		  "theme-color": "#BD3300",
		  "theme-color-alt": "#BD3300",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#DC2626",
		  "syntax-heading": "#BD3300",
		  "syntax-link": "#BD3200",
		  "syntax-code": "#C42020",
		  "syntax-quote": "#424B5D",
		  "syntax-marker": "#111622",
		  "syntax-meta": "#4F46E5",
		  "syntax-comment": "#728096",
		  "canvas-postit-bg": "#FFF7ED",
		  "canvas-postit-text": "#7C2D12",
		  "scrollbar-thumb": "#C4CAD4",
		  "md-h1": "#111622",
		  "md-h2": "#BD3300",
		  "md-h3": "#111622",
		  "md-bold": "#BD3300",
		  "md-code": "#C42020",
		  "md-code-back": "#F0F2F5",
		  "md-bullet": "#BD3300",
		  "md-bullet-in": "#BD3200",
		  "md-blockquote": "#424B5D",
		  "border-md-table": "#C4CAD4"
		}
	},
	{
		id: 'theme-studio-light',
		name: 'Studio Light',
		mode: 'light',
		accentColor: '#24201B',
		bgColor: '#F4F0E8',
		textColor: '#1C1A17',
		description: 'Architectural bone & warm ochre',
		auraId: 'flux-milk-tea',
		auraName: 'Milk Tea',
		auraDescription: 'Creamy caramel and beige organic forms with a soft tactile feel',
		tokens: {
		  "bg": "#F4F0E8",
		  "bg-surface": "#EAE4D6",
		  "bg-raised": "#FAF8F3",
		  "bg-panel": "#DDD5C3",
		  "bg-footer": "#D0C5AF",
		  "bg-popover": "#FCFAF6",
		  "bg-dialog": "#FCFAF6",
		  "bg-terminal": "#1B1A17",
		  "bg-input": "#FAF8F3",
		  "bg-canvas": "#F4F0E8",
		  "border": "#C8BDA8",
		  "border-subtle": "#DBD2C0",
		  "text-primary": "#1C1A17",
		  "text-secondary": "#544E44",
		  "text-muted": "#8E8678",
		  "state-hover": "#D8CEB8",
		  "state-hover-subtle": "#EAE3D2",
		  "state-selected": "#C8BBA0",
		  "theme-color": "#24201B",
		  "theme-color-alt": "#896525",
		  "text-inverse": "#F4F0E8",
		  "feedback-error": "#C84B31",
		  "syntax-heading": "#1C1A17",
		  "syntax-link": "#896525",
		  "syntax-code": "#B8452D",
		  "syntax-quote": "#544E44",
		  "syntax-marker": "#2D4232",
		  "syntax-meta": "#70695E",
		  "syntax-comment": "#8E8678",
		  "canvas-postit-bg": "#FFFDEB",
		  "canvas-postit-text": "#3D2A00",
		  "scrollbar-thumb": "#C8BDA8",
		  "md-h1": "#1C1A17",
		  "md-h2": "#1C1A17",
		  "md-h3": "#544E44",
		  "md-bold": "#896525",
		  "md-code": "#B8452D",
		  "md-code-back": "#FAF8F3",
		  "md-bullet": "#896525",
		  "md-bullet-in": "#24201B",
		  "md-blockquote": "#544E44",
		  "border-md-table": "#C8BDA8"
		}
	},
	{
		id: 'theme-matcha-light',
		name: 'Matcha Light',
		mode: 'light',
		accentColor: '#4D7C0F',
		bgColor: '#F5F7F2',
		textColor: '#1C2719',
		description: 'Zen bamboo & sweet matcha tea',
		auraId: 'mesh-alpine-meadow',
		auraName: 'Alpine Meadow',
		auraDescription: 'Wildflower blooms scattered across high altitude pastures',
		tokens: {
		  "bg": "#F5F7F2",
		  "bg-surface": "#EBF0E4",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#DFE7D6",
		  "bg-footer": "#D2DDC7",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#162016",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#F5F7F2",
		  "border": "#C3D3B5",
		  "border-subtle": "#DAE6CF",
		  "text-primary": "#1C2719",
		  "text-secondary": "#4A5B44",
		  "text-muted": "#7E9377",
		  "state-hover": "#D5E2C9",
		  "state-hover-subtle": "#E8F0DF",
		  "state-selected": "#C0D2B2",
		  "theme-color": "#4D7C0F",
		  "theme-color-alt": "#3F6212",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#DC2626",
		  "syntax-heading": "#3F6212",
		  "syntax-link": "#4B780A",
		  "syntax-code": "#D52222",
		  "syntax-quote": "#4A5B44",
		  "syntax-marker": "#4D7C0F",
		  "syntax-meta": "#A16207",
		  "syntax-comment": "#7E9377",
		  "canvas-postit-bg": "#ECFCCB",
		  "canvas-postit-text": "#365314",
		  "scrollbar-thumb": "#C3D3B5",
		  "md-h1": "#1C2719",
		  "md-h2": "#4D7C0F",
		  "md-h3": "#4A5B44",
		  "md-bold": "#3F6212",
		  "md-code": "#4D7C0F",
		  "md-code-back": "#EBF0E4",
		  "md-bullet": "#4D7C0F",
		  "md-bullet-in": "#4B780A",
		  "md-blockquote": "#4A5B44",
		  "border-md-table": "#C3D3B5"
		}
	},
	{
		id: 'theme-sakura-light',
		name: 'Sakura Light',
		mode: 'light',
		accentColor: '#D02370',
		bgColor: '#FDF7F8',
		textColor: '#331622',
		description: 'Cherry blossom & rose quartz',
		auraId: 'mesh-sakura',
		auraName: 'Sakura Fields',
		auraDescription: 'Cherry blossom pink mesh with warm peach nodes',
		tokens: {
		  "bg": "#FDF7F8",
		  "bg-surface": "#F9ECF0",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#F3DEE4",
		  "bg-footer": "#EBCFD7",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#22151B",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#FDF7F8",
		  "border": "#E4BCC8",
		  "border-subtle": "#F0D5DD",
		  "text-primary": "#331622",
		  "text-secondary": "#6B4354",
		  "text-muted": "#A3798C",
		  "state-hover": "#EED0DA",
		  "state-hover-subtle": "#F7E4EB",
		  "state-selected": "#E2BCC9",
		  "theme-color": "#D02370",
		  "theme-color-alt": "#BE185D",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#E11D48",
		  "syntax-heading": "#BE185D",
		  "syntax-link": "#D02370",
		  "syntax-code": "#D81C45",
		  "syntax-quote": "#6B4354",
		  "syntax-marker": "#D02370",
		  "syntax-meta": "#9333EA",
		  "syntax-comment": "#A3798C",
		  "canvas-postit-bg": "#FCE7F3",
		  "canvas-postit-text": "#831843",
		  "scrollbar-thumb": "#E4BCC8",
		  "md-h1": "#331622",
		  "md-h2": "#D02370",
		  "md-h3": "#9333EA",
		  "md-bold": "#BE185D",
		  "md-code": "#D02370",
		  "md-code-back": "#F9ECF0",
		  "md-bullet": "#D02370",
		  "md-bullet-in": "#BE185D",
		  "md-blockquote": "#6B4354",
		  "border-md-table": "#E4BCC8"
		}
	},
	{
		id: 'theme-nordic-frost-light',
		name: 'Nordic Frost Light',
		mode: 'light',
		accentColor: '#0273AE',
		bgColor: '#F4FAFC',
		textColor: '#0C232F',
		description: 'Glacier ice & deep fjord blue',
		auraId: 'arctic-frost',
		auraName: 'Arctic Frost',
		auraDescription: 'Ice crystal refracting into periwinkle',
		tokens: {
		  "bg": "#F4FAFC",
		  "bg-surface": "#E5F3F7",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#D5EAF0",
		  "bg-footer": "#C4DEE7",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#0B1922",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#F4FAFC",
		  "border": "#B2D3DF",
		  "border-subtle": "#CCE3EC",
		  "text-primary": "#0C232F",
		  "text-secondary": "#2C5366",
		  "text-muted": "#5F869A",
		  "state-hover": "#C5E1EC",
		  "state-hover-subtle": "#DCEDF4",
		  "state-selected": "#AED2E0",
		  "theme-color": "#0273AE",
		  "theme-color-alt": "#0369A1",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#E11D48",
		  "syntax-heading": "#0369A1",
		  "syntax-link": "#077995",
		  "syntax-code": "#D81C45",
		  "syntax-quote": "#2C5366",
		  "syntax-marker": "#0273AE",
		  "syntax-meta": "#4F46E5",
		  "syntax-comment": "#5F869A",
		  "canvas-postit-bg": "#E0F2FE",
		  "canvas-postit-text": "#075985",
		  "scrollbar-thumb": "#B2D3DF",
		  "md-h1": "#0C232F",
		  "md-h2": "#0273AE",
		  "md-h3": "#077995",
		  "md-bold": "#0369A1",
		  "md-code": "#0273AE",
		  "md-code-back": "#E5F3F7",
		  "md-bullet": "#0273AE",
		  "md-bullet-in": "#077995",
		  "md-blockquote": "#2C5366",
		  "border-md-table": "#B2D3DF"
		}
	},
	{
		id: 'theme-desert-dune-light',
		name: 'Desert Dune Light',
		mode: 'light',
		accentColor: '#A75C05',
		bgColor: '#FDF9F0',
		textColor: '#291F14',
		description: 'Sahara golden sand & warm ochre',
		auraId: 'grain-desert-sand',
		auraName: 'Desert Sand',
		auraDescription: 'Warm beige with gritty film texture',
		tokens: {
		  "bg": "#FDF9F0",
		  "bg-surface": "#F6EEDC",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#EDE0C7",
		  "bg-footer": "#E2D1B2",
		  "bg-popover": "#FFFDF8",
		  "bg-dialog": "#FFFDF8",
		  "bg-terminal": "#251D14",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#FDF9F0",
		  "border": "#D8C4A0",
		  "border-subtle": "#E8DAC2",
		  "text-primary": "#291F14",
		  "text-secondary": "#634F38",
		  "text-muted": "#968065",
		  "state-hover": "#E4D2B2",
		  "state-hover-subtle": "#F3E6CE",
		  "state-selected": "#D5BD96",
		  "theme-color": "#A75C05",
		  "theme-color-alt": "#B45309",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#DC2626",
		  "syntax-heading": "#B45309",
		  "syntax-link": "#A75C05",
		  "syntax-code": "#DC2626",
		  "syntax-quote": "#634F38",
		  "syntax-marker": "#A75C05",
		  "syntax-meta": "#C2410C",
		  "syntax-comment": "#968065",
		  "canvas-postit-bg": "#FEF3C7",
		  "canvas-postit-text": "#78350F",
		  "scrollbar-thumb": "#D8C4A0",
		  "md-h1": "#291F14",
		  "md-h2": "#A75C05",
		  "md-h3": "#C2410C",
		  "md-bold": "#B45309",
		  "md-code": "#A75C05",
		  "md-code-back": "#F6EEDC",
		  "md-bullet": "#A75C05",
		  "md-bullet-in": "#B45309",
		  "md-blockquote": "#634F38",
		  "border-md-table": "#D8C4A0"
		}
	},
	{
		id: 'theme-lavender-mist-light',
		name: 'Lavender Mist Light',
		mode: 'light',
		accentColor: '#7C3AED',
		bgColor: '#FAF8FD',
		textColor: '#221633',
		description: 'Lilac garden & royal amethyst',
		auraId: 'mesh-lavender-haze',
		auraName: 'Lavender Haze',
		auraDescription: 'Soft purple mesh with lilac and mauve nodes',
		tokens: {
		  "bg": "#FAF8FD",
		  "bg-surface": "#F0EAF8",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#E5DBF2",
		  "bg-footer": "#D9CBEC",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#1B1226",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#FAF8FD",
		  "border": "#CDB9E4",
		  "border-subtle": "#E0D3F0",
		  "text-primary": "#221633",
		  "text-secondary": "#574173",
		  "text-muted": "#8E76AC",
		  "state-hover": "#DAC9EE",
		  "state-hover-subtle": "#EDE3F6",
		  "state-selected": "#CAB3E5",
		  "theme-color": "#7C3AED",
		  "theme-color-alt": "#6D28D9",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#E11D48",
		  "syntax-heading": "#6D28D9",
		  "syntax-link": "#7C3AED",
		  "syntax-code": "#D81C45",
		  "syntax-quote": "#574173",
		  "syntax-marker": "#7C3AED",
		  "syntax-meta": "#B824CA",
		  "syntax-comment": "#8E76AC",
		  "canvas-postit-bg": "#F3E8FF",
		  "canvas-postit-text": "#581C87",
		  "scrollbar-thumb": "#CDB9E4",
		  "md-h1": "#221633",
		  "md-h2": "#7C3AED",
		  "md-h3": "#B824CA",
		  "md-bold": "#6D28D9",
		  "md-code": "#7C3AED",
		  "md-code-back": "#F0EAF8",
		  "md-bullet": "#7C3AED",
		  "md-bullet-in": "#9333EA",
		  "md-blockquote": "#574173",
		  "border-md-table": "#CDB9E4"
		}
	},
	{
		id: 'theme-botanical-light',
		name: 'Botanical Light',
		mode: 'light',
		accentColor: '#117F3A',
		bgColor: '#F7FAF6',
		textColor: '#182819',
		description: 'Lush fern herbarium & forest sage',
		auraId: 'nebula-mint-cloud',
		auraName: 'Mint Cloud',
		auraDescription: 'Ethereal teal and emerald floating spheres',
		tokens: {
		  "bg": "#F7FAF6",
		  "bg-surface": "#EBF2E8",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#DEE9D9",
		  "bg-footer": "#D0DEC9",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#152216",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#F7FAF6",
		  "border": "#BED1B7",
		  "border-subtle": "#D8E5D3",
		  "text-primary": "#182819",
		  "text-secondary": "#425B44",
		  "text-muted": "#738E75",
		  "state-hover": "#D1E2CA",
		  "state-hover-subtle": "#E6EFE2",
		  "state-selected": "#BACFB1",
		  "theme-color": "#117F3A",
		  "theme-color-alt": "#15803D",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#DC2626",
		  "syntax-heading": "#15803D",
		  "syntax-link": "#117F3A",
		  "syntax-code": "#DC2626",
		  "syntax-quote": "#425B44",
		  "syntax-marker": "#117F3A",
		  "syntax-meta": "#936403",
		  "syntax-comment": "#738E75",
		  "canvas-postit-bg": "#DCFCE7",
		  "canvas-postit-text": "#14532D",
		  "scrollbar-thumb": "#BED1B7",
		  "md-h1": "#182819",
		  "md-h2": "#117F3A",
		  "md-h3": "#425B44",
		  "md-bold": "#15803D",
		  "md-code": "#117F3A",
		  "md-code-back": "#EBF2E8",
		  "md-bullet": "#117F3A",
		  "md-bullet-in": "#167F3D",
		  "md-blockquote": "#425B44",
		  "border-md-table": "#BED1B7"
		}
	},
	{
		id: 'theme-clay-studio-light',
		name: 'Clay Studio Light',
		mode: 'light',
		accentColor: '#B45309',
		bgColor: '#FAF5F0',
		textColor: '#2C1A12',
		description: 'Terracotta pottery & warm bisque',
		auraId: 'mesh-saffron-silk',
		auraName: 'Saffron Silk',
		auraDescription: 'Spice market warmth woven through golden fabric folds',
		tokens: {
		  "bg": "#FAF5F0",
		  "bg-surface": "#F2E7DC",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#E8D7C8",
		  "bg-footer": "#DEC5B2",
		  "bg-popover": "#FFFBF8",
		  "bg-dialog": "#FFFBF8",
		  "bg-terminal": "#281A14",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#FAF5F0",
		  "border": "#D3B9A4",
		  "border-subtle": "#E5D3C3",
		  "text-primary": "#2C1A12",
		  "text-secondary": "#6B4B3D",
		  "text-muted": "#9E7D6F",
		  "state-hover": "#DFC8B6",
		  "state-hover-subtle": "#EFE0D4",
		  "state-selected": "#D0B29C",
		  "theme-color": "#B45309",
		  "theme-color-alt": "#92400E",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#B91C1C",
		  "syntax-heading": "#92400E",
		  "syntax-link": "#B45309",
		  "syntax-code": "#B91C1C",
		  "syntax-quote": "#6B4B3D",
		  "syntax-marker": "#B45309",
		  "syntax-meta": "#C2410C",
		  "syntax-comment": "#9E7D6F",
		  "canvas-postit-bg": "#FEF3C7",
		  "canvas-postit-text": "#78350F",
		  "scrollbar-thumb": "#D3B9A4",
		  "md-h1": "#2C1A12",
		  "md-h2": "#B45309",
		  "md-h3": "#C2410C",
		  "md-bold": "#92400E",
		  "md-code": "#B45309",
		  "md-code-back": "#F2E7DC",
		  "md-bullet": "#B45309",
		  "md-bullet-in": "#92400E",
		  "md-blockquote": "#6B4B3D",
		  "border-md-table": "#D3B9A4"
		}
	},
	{
		id: 'theme-solaris-light',
		name: 'Solaris Light',
		mode: 'light',
		accentColor: '#AC5F05',
		bgColor: '#FFFCF2',
		textColor: '#291E04',
		description: 'Golden sunbeam & marigold',
		auraId: 'mesh-citrine',
		auraName: 'Citrine Mesh',
		auraDescription: 'Sunlit yellow-gold mesh with amber nodes',
		tokens: {
		  "bg": "#FFFCF2",
		  "bg-surface": "#FFF5D6",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#FFEBB8",
		  "bg-footer": "#FEDF94",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#241C0A",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#FFFCF2",
		  "border": "#F3CF76",
		  "border-subtle": "#FBE5A5",
		  "text-primary": "#291E04",
		  "text-secondary": "#6B5216",
		  "text-muted": "#A3853E",
		  "state-hover": "#F8DC8E",
		  "state-hover-subtle": "#FDF0C3",
		  "state-selected": "#ECC768",
		  "theme-color": "#AC5F05",
		  "theme-color-alt": "#B45309",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#DC2626",
		  "syntax-heading": "#B45309",
		  "syntax-link": "#AC5F05",
		  "syntax-code": "#DC2626",
		  "syntax-quote": "#6B5216",
		  "syntax-marker": "#AC5F05",
		  "syntax-meta": "#C3490A",
		  "syntax-comment": "#A3853E",
		  "canvas-postit-bg": "#FEF9C3",
		  "canvas-postit-text": "#713F12",
		  "scrollbar-thumb": "#F3CF76",
		  "md-h1": "#291E04",
		  "md-h2": "#AC5F05",
		  "md-h3": "#C3490A",
		  "md-bold": "#B45309",
		  "md-code": "#AC5F05",
		  "md-code-back": "#FFF5D6",
		  "md-bullet": "#AC5F05",
		  "md-bullet-in": "#B45309",
		  "md-blockquote": "#6B5216",
		  "border-md-table": "#F3CF76"
		}
	},
	{
		id: 'theme-cyberpunk-day-light',
		name: 'Cyberpunk Day Light',
		mode: 'light',
		accentColor: '#E11D48',
		bgColor: '#FDFEFA',
		textColor: '#15102A',
		description: 'Neo-Shinjuku daylight & neon fuchsia',
		auraId: 'sunrise-drift',
		auraName: 'Sunrise Drift',
		auraDescription: 'Blue into orange, high key',
		tokens: {
		  "bg": "#FDFEFA",
		  "bg-surface": "#F6F8E8",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#EBF0CD",
		  "bg-footer": "#DFE7AC",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#12101F",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#FDFEFA",
		  "border": "#CCD88D",
		  "border-subtle": "#E2ECAD",
		  "text-primary": "#15102A",
		  "text-secondary": "#483C6E",
		  "text-muted": "#8275A8",
		  "state-hover": "#DEEB9F",
		  "state-hover-subtle": "#F1F6D2",
		  "state-selected": "#C9D97E",
		  "theme-color": "#E11D48",
		  "theme-color-alt": "#077D9A",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#E11D48",
		  "syntax-heading": "#E11D48",
		  "syntax-link": "#077D9A",
		  "syntax-code": "#E11D48",
		  "syntax-quote": "#483C6E",
		  "syntax-marker": "#7C3AED",
		  "syntax-meta": "#AC5F05",
		  "syntax-comment": "#8275A8",
		  "canvas-postit-bg": "#FEF08A",
		  "canvas-postit-text": "#1E1B4B",
		  "scrollbar-thumb": "#CCD88D",
		  "md-h1": "#15102A",
		  "md-h2": "#E11D48",
		  "md-h3": "#077D9A",
		  "md-bold": "#7C3AED",
		  "md-code": "#E11D48",
		  "md-code-back": "#F6F8E8",
		  "md-bullet": "#E11D48",
		  "md-bullet-in": "#077D9A",
		  "md-blockquote": "#483C6E",
		  "border-md-table": "#CCD88D"
		}
	},
	{
		id: 'theme-copper-patina-light',
		name: 'Copper Patina Light',
		mode: 'light',
		accentColor: '#0B7D72',
		bgColor: '#F3FAF8',
		textColor: '#0F2824',
		description: 'Oxidized verdigris & Aegean teal',
		auraId: 'ocean-pearl',
		auraName: 'Ocean Pearl',
		auraDescription: 'Seafoam drifting into abyssal blue',
		tokens: {
		  "bg": "#F3FAF8",
		  "bg-surface": "#E3F2EE",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#D1E8E2",
		  "bg-footer": "#BFDCD5",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#112220",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#F3FAF8",
		  "border": "#A9CEC5",
		  "border-subtle": "#C6E3DC",
		  "text-primary": "#0F2824",
		  "text-secondary": "#305B54",
		  "text-muted": "#608C85",
		  "state-hover": "#BFDFD7",
		  "state-hover-subtle": "#DBEFEA",
		  "state-selected": "#A3CCC2",
		  "theme-color": "#0B7D72",
		  "theme-color-alt": "#0F766E",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#DC2626",
		  "syntax-heading": "#0F766E",
		  "syntax-link": "#0B7D72",
		  "syntax-code": "#DC2626",
		  "syntax-quote": "#305B54",
		  "syntax-marker": "#0B7D72",
		  "syntax-meta": "#B45309",
		  "syntax-comment": "#608C85",
		  "canvas-postit-bg": "#CCFBF1",
		  "canvas-postit-text": "#115E59",
		  "scrollbar-thumb": "#A9CEC5",
		  "md-h1": "#0F2824",
		  "md-h2": "#0B7D72",
		  "md-h3": "#B45309",
		  "md-bold": "#0F766E",
		  "md-code": "#0B7D72",
		  "md-code-back": "#E3F2EE",
		  "md-bullet": "#0B7D72",
		  "md-bullet-in": "#0F766E",
		  "md-blockquote": "#305B54",
		  "border-md-table": "#A9CEC5"
		}
	},
	{
		id: 'theme-dracula-light',
		name: 'Dracula Light',
		mode: 'light',
		accentColor: '#7C3AED',
		bgColor: '#F8F7FA',
		textColor: '#282A36',
		description: 'Alucard gothic cream & crimson coral',
		auraId: 'orchid-bloom',
		auraName: 'Orchid Bloom',
		auraDescription: 'Magenta into blue',
		tokens: {
		  "bg": "#F8F7FA",
		  "bg-surface": "#EDEAF3",
		  "bg-raised": "#FFFFFF",
		  "bg-panel": "#E0DAEA",
		  "bg-footer": "#D2C8DF",
		  "bg-popover": "#FFFFFF",
		  "bg-dialog": "#FFFFFF",
		  "bg-terminal": "#282A36",
		  "bg-input": "#FFFFFF",
		  "bg-canvas": "#F8F7FA",
		  "border": "#C4B5D7",
		  "border-subtle": "#DCD2EB",
		  "text-primary": "#282A36",
		  "text-secondary": "#585474",
		  "text-muted": "#8E89AC",
		  "state-hover": "#D7CBEC",
		  "state-hover-subtle": "#ECE4F6",
		  "state-selected": "#C6B4E3",
		  "theme-color": "#7C3AED",
		  "theme-color-alt": "#D02370",
		  "text-inverse": "#FFFFFF",
		  "feedback-error": "#E11D48",
		  "syntax-heading": "#7C3AED",
		  "syntax-link": "#D02370",
		  "syntax-code": "#D81C45",
		  "syntax-quote": "#585474",
		  "syntax-marker": "#047D58",
		  "syntax-meta": "#A75C05",
		  "syntax-comment": "#8E89AC",
		  "canvas-postit-bg": "#F5F3FF",
		  "canvas-postit-text": "#4C1D95",
		  "scrollbar-thumb": "#C4B5D7",
		  "md-h1": "#282A36",
		  "md-h2": "#7C3AED",
		  "md-h3": "#D02370",
		  "md-bold": "#7C3AED",
		  "md-code": "#D02370",
		  "md-code-back": "#EDEAF3",
		  "md-bullet": "#7C3AED",
		  "md-bullet-in": "#D02370",
		  "md-blockquote": "#585474",
		  "border-md-table": "#C4B5D7"
		}
	},
	{
		id: 'theme-lagoona-dark',
		name: 'Lagoona Dark',
		mode: 'dark',
		accentColor: '#38BDF8',
		bgColor: '#0E1118',
		textColor: '#EDF2F7',
		description: 'Deep abyss neon cyan & electric aqua',
		auraId: 'deep-lagoon',
		auraName: 'Deep Lagoon',
		auraDescription: 'Teal into violet',
		tokens: {
		  "bg": "#0E1118",
		  "bg-surface": "#141824",
		  "bg-raised": "#1C2232",
		  "bg-panel": "#101420",
		  "bg-footer": "#0B0D14",
		  "bg-popover": "#20273A",
		  "bg-dialog": "#20273A",
		  "bg-terminal": "#080A0F",
		  "bg-input": "#121622",
		  "bg-canvas": "#0E1118",
		  "border": "#28324A",
		  "border-subtle": "#1E2538",
		  "text-primary": "#EDF2F7",
		  "text-secondary": "#9BB0C7",
		  "text-muted": "#5D7087",
		  "state-hover": "#263047",
		  "state-hover-subtle": "#1B2233",
		  "state-selected": "#32405E",
		  "theme-color": "#38BDF8",
		  "theme-color-alt": "#0EA5E9",
		  "text-inverse": "#0E1118",
		  "feedback-error": "#F87171",
		  "syntax-heading": "#38BDF8",
		  "syntax-link": "#60A5FA",
		  "syntax-code": "#F87171",
		  "syntax-quote": "#9BB0C7",
		  "syntax-marker": "#34D399",
		  "syntax-meta": "#A78BFA",
		  "syntax-comment": "#5D7087",
		  "canvas-postit-bg": "#2C2616",
		  "canvas-postit-text": "#FDE68A",
		  "scrollbar-thumb": "#28324A",
		  "md-h1": "#EDF2F7",
		  "md-h2": "#38BDF8",
		  "md-h3": "#34D399",
		  "md-bold": "#F472B6",
		  "md-code": "#F87171",
		  "md-code-back": "#141824",
		  "md-bullet": "#38BDF8",
		  "md-bullet-in": "#60A5FA",
		  "md-blockquote": "#9BB0C7",
		  "border-md-table": "#28324A"
		}
	},
	{
		id: 'theme-frozen-dark',
		name: 'Frozen Dark',
		mode: 'dark',
		accentColor: '#A3BE8C',
		bgColor: '#15171C',
		textColor: '#ECEFF4',
		description: 'Nordic polar sage & frost carbon',
		auraId: 'arctic-dawn',
		auraName: 'Arctic Dawn',
		auraDescription: 'Frozen cyan horizon melting into pale rose',
		tokens: {
		  "bg": "#15171C",
		  "bg-surface": "#1D2128",
		  "bg-raised": "#262C36",
		  "bg-panel": "#191C22",
		  "bg-footer": "#111317",
		  "bg-popover": "#2A313D",
		  "bg-dialog": "#2A313D",
		  "bg-terminal": "#0E1013",
		  "bg-input": "#181B22",
		  "bg-canvas": "#15171C",
		  "border": "#343D4C",
		  "border-subtle": "#262C37",
		  "text-primary": "#ECEFF4",
		  "text-secondary": "#B4BECE",
		  "text-muted": "#68768A",
		  "state-hover": "#313947",
		  "state-hover-subtle": "#232933",
		  "state-selected": "#414C5E",
		  "theme-color": "#A3BE8C",
		  "theme-color-alt": "#8FBCBB",
		  "text-inverse": "#15171C",
		  "feedback-error": "#BF616A",
		  "syntax-heading": "#88C0D0",
		  "syntax-link": "#81A1C1",
		  "syntax-code": "#C26871",
		  "syntax-quote": "#B4BECE",
		  "syntax-marker": "#A3BE8C",
		  "syntax-meta": "#B48EAD",
		  "syntax-comment": "#68768A",
		  "canvas-postit-bg": "#2B2A24",
		  "canvas-postit-text": "#EBCB8B",
		  "scrollbar-thumb": "#343D4C",
		  "md-h1": "#ECEFF4",
		  "md-h2": "#8FBCBB",
		  "md-h3": "#88C0D0",
		  "md-bold": "#B48EAD",
		  "md-code": "#C26871",
		  "md-code-back": "#1D2128",
		  "md-bullet": "#81A1C1",
		  "md-bullet-in": "#A3BE8C",
		  "md-blockquote": "#B4BECE",
		  "border-md-table": "#343D4C"
		}
	},
	{
		id: 'theme-night-dark',
		name: 'Night Dark',
		mode: 'dark',
		accentColor: '#9ECE6A',
		bgColor: '#13141F',
		textColor: '#C0CAF5',
		description: 'Tokyo night indigo & cyber lime',
		auraId: 'midnight-horizon',
		auraName: 'Midnight Horizon',
		auraDescription: 'A vibrant transition from deep space blue to an electric sunrise horizon',
		tokens: {
		  "bg": "#13141F",
		  "bg-surface": "#1A1B2A",
		  "bg-raised": "#222438",
		  "bg-panel": "#161724",
		  "bg-footer": "#0F1018",
		  "bg-popover": "#282A42",
		  "bg-dialog": "#282A42",
		  "bg-terminal": "#0D0E15",
		  "bg-input": "#171826",
		  "bg-canvas": "#13141F",
		  "border": "#303352",
		  "border-subtle": "#22243A",
		  "text-primary": "#C0CAF5",
		  "text-secondary": "#9099C4",
		  "text-muted": "#5B6284",
		  "state-hover": "#2F3250",
		  "state-hover-subtle": "#202237",
		  "state-selected": "#3E426B",
		  "theme-color": "#9ECE6A",
		  "theme-color-alt": "#7AA2F7",
		  "text-inverse": "#13141F",
		  "feedback-error": "#F7768E",
		  "syntax-heading": "#7AA2F7",
		  "syntax-link": "#BB9AF7",
		  "syntax-code": "#F7768E",
		  "syntax-quote": "#9099C4",
		  "syntax-marker": "#9ECE6A",
		  "syntax-meta": "#E0AF68",
		  "syntax-comment": "#5B6284",
		  "canvas-postit-bg": "#292524",
		  "canvas-postit-text": "#E0AF68",
		  "scrollbar-thumb": "#303352",
		  "md-h1": "#C0CAF5",
		  "md-h2": "#7AA2F7",
		  "md-h3": "#BB9AF7",
		  "md-bold": "#FF007F",
		  "md-code": "#F7768E",
		  "md-code-back": "#1A1B2A",
		  "md-bullet": "#7AA2F7",
		  "md-bullet-in": "#9ECE6A",
		  "md-blockquote": "#9099C4",
		  "border-md-table": "#303352"
		}
	},
	{
		id: 'theme-inkworm-dark',
		name: 'Inkworm Dark',
		mode: 'dark',
		accentColor: '#E58A1F',
		bgColor: '#171513',
		textColor: '#E8E2D8',
		description: 'Vintage espresso & warm amber',
		auraId: 'mesh-bourbon-smoke',
		auraName: 'Bourbon Smoke',
		auraDescription: 'Amber liquid light refracting through oak-aged haze',
		tokens: {
		  "bg": "#171513",
		  "bg-surface": "#211E1B",
		  "bg-raised": "#2C2824",
		  "bg-panel": "#1A1815",
		  "bg-footer": "#12100E",
		  "bg-popover": "#35302B",
		  "bg-dialog": "#35302B",
		  "bg-terminal": "#0F0E0C",
		  "bg-input": "#1E1B18",
		  "bg-canvas": "#171513",
		  "border": "#423C36",
		  "border-subtle": "#2F2B26",
		  "text-primary": "#E8E2D8",
		  "text-secondary": "#ADA394",
		  "text-muted": "#6E6659",
		  "state-hover": "#3A342E",
		  "state-hover-subtle": "#282420",
		  "state-selected": "#4E463E",
		  "theme-color": "#E58A1F",
		  "theme-color-alt": "#F97316",
		  "text-inverse": "#171513",
		  "feedback-error": "#EF4444",
		  "syntax-heading": "#E58A1F",
		  "syntax-link": "#F97316",
		  "syntax-code": "#EF4444",
		  "syntax-quote": "#ADA394",
		  "syntax-marker": "#10B981",
		  "syntax-meta": "#FBBF24",
		  "syntax-comment": "#6E6659",
		  "canvas-postit-bg": "#302619",
		  "canvas-postit-text": "#FBBF24",
		  "scrollbar-thumb": "#423C36",
		  "md-h1": "#E8E2D8",
		  "md-h2": "#E58A1F",
		  "md-h3": "#F97316",
		  "md-bold": "#F59E0B",
		  "md-code": "#EF4444",
		  "md-code-back": "#211E1B",
		  "md-bullet": "#E58A1F",
		  "md-bullet-in": "#F97316",
		  "md-blockquote": "#ADA394",
		  "border-md-table": "#423C36"
		}
	},
	{
		id: 'theme-monochrono-dark',
		name: 'Monochrono Dark',
		mode: 'dark',
		accentColor: '#FFFFFF',
		bgColor: '#050505',
		textColor: '#FFFFFF',
		description: 'Pitch black high contrast titanium',
		auraId: 'mesh-graphite',
		auraName: 'Graphite Mesh',
		auraDescription: 'Monochrome graphite mesh with cool steel nodes',
		tokens: {
		  "bg": "#050505",
		  "bg-surface": "#101012",
		  "bg-raised": "#1A1A1E",
		  "bg-panel": "#0A0A0C",
		  "bg-footer": "#020202",
		  "bg-popover": "#222228",
		  "bg-dialog": "#222228",
		  "bg-terminal": "#000000",
		  "bg-input": "#0E0E10",
		  "bg-canvas": "#050505",
		  "border": "#2E2E36",
		  "border-subtle": "#1E1E24",
		  "text-primary": "#FFFFFF",
		  "text-secondary": "#B0B0BC",
		  "text-muted": "#666675",
		  "state-hover": "#2A2A33",
		  "state-hover-subtle": "#17171C",
		  "state-selected": "#383845",
		  "theme-color": "#FFFFFF",
		  "theme-color-alt": "#D4D4DE",
		  "text-inverse": "#050505",
		  "feedback-error": "#DC2626",
		  "syntax-heading": "#FFFFFF",
		  "syntax-link": "#E5E5EB",
		  "syntax-code": "#E03C3C",
		  "syntax-quote": "#B0B0BC",
		  "syntax-marker": "#FFFFFF",
		  "syntax-meta": "#9E9EB0",
		  "syntax-comment": "#666675",
		  "canvas-postit-bg": "#1E1B4B",
		  "canvas-postit-text": "#E0E7FF",
		  "scrollbar-thumb": "#2E2E36",
		  "md-h1": "#FFFFFF",
		  "md-h2": "#E5E5EB",
		  "md-h3": "#B0B0BC",
		  "md-bold": "#FFFFFF",
		  "md-code": "#FFFFFF",
		  "md-code-back": "#101012",
		  "md-bullet": "#FFFFFF",
		  "md-bullet-in": "#D4D4DE",
		  "md-blockquote": "#B0B0BC",
		  "border-md-table": "#2E2E36"
		}
	},
	{
		id: 'theme-fouram-dark',
		name: '4 AM Dark',
		mode: 'dark',
		accentColor: '#F43F8E',
		bgColor: '#080B14',
		textColor: '#F3F6FC',
		description: 'Midnight neon magenta & electric mint',
		auraId: 'neon-skyline',
		auraName: 'Neon Skyline',
		auraDescription: 'Electric cyan horizon bleeding into neon magenta',
		tokens: {
		  "bg": "#080B14",
		  "bg-surface": "#0F1424",
		  "bg-raised": "#182038",
		  "bg-panel": "#0B0E1B",
		  "bg-footer": "#05070E",
		  "bg-popover": "#1E2847",
		  "bg-dialog": "#1E2847",
		  "bg-terminal": "#04060A",
		  "bg-input": "#0E1220",
		  "bg-canvas": "#080B14",
		  "border": "#27345C",
		  "border-subtle": "#19223D",
		  "text-primary": "#F3F6FC",
		  "text-secondary": "#A2B2D8",
		  "text-muted": "#5C6B94",
		  "state-hover": "#243054",
		  "state-hover-subtle": "#151D34",
		  "state-selected": "#314273",
		  "theme-color": "#F43F8E",
		  "theme-color-alt": "#10B981",
		  "text-inverse": "#080B14",
		  "feedback-error": "#EF4444",
		  "syntax-heading": "#F43F8E",
		  "syntax-link": "#38BDF8",
		  "syntax-code": "#F43F5E",
		  "syntax-quote": "#A2B2D8",
		  "syntax-marker": "#10B981",
		  "syntax-meta": "#A855F7",
		  "syntax-comment": "#5C6B94",
		  "canvas-postit-bg": "#2E1B2C",
		  "canvas-postit-text": "#FBCFE8",
		  "scrollbar-thumb": "#27345C",
		  "md-h1": "#F3F6FC",
		  "md-h2": "#F43F8E",
		  "md-h3": "#A855F7",
		  "md-bold": "#10B981",
		  "md-code": "#F43F5E",
		  "md-code-back": "#0F1424",
		  "md-bullet": "#38BDF8",
		  "md-bullet-in": "#F43F8E",
		  "md-blockquote": "#A2B2D8",
		  "border-md-table": "#27345C"
		}
	},
	{
		id: 'theme-wintercame-dark',
		name: 'Winter Came Dark',
		mode: 'dark',
		accentColor: '#FF6600',
		bgColor: '#0D0D0E',
		textColor: '#F8F8FA',
		description: 'Obsidian charcoal & molten ember',
		auraId: 'eclipse-flare',
		auraName: 'Eclipse Flare',
		auraDescription: 'Dark void curving into blue, magenta, and ember',
		tokens: {
		  "bg": "#0D0D0E",
		  "bg-surface": "#161619",
		  "bg-raised": "#212126",
		  "bg-panel": "#111114",
		  "bg-footer": "#080809",
		  "bg-popover": "#2B2B33",
		  "bg-dialog": "#2B2B33",
		  "bg-terminal": "#060607",
		  "bg-input": "#141417",
		  "bg-canvas": "#0D0D0E",
		  "border": "#383842",
		  "border-subtle": "#24242B",
		  "text-primary": "#F8F8FA",
		  "text-secondary": "#ABABBC",
		  "text-muted": "#686877",
		  "state-hover": "#2F2F3B",
		  "state-hover-subtle": "#1D1D24",
		  "state-selected": "#404050",
		  "theme-color": "#FF6600",
		  "theme-color-alt": "#FFAB00",
		  "text-inverse": "#0D0D0E",
		  "feedback-error": "#FF3333",
		  "syntax-heading": "#FF6600",
		  "syntax-link": "#FFAB00",
		  "syntax-code": "#FF3333",
		  "syntax-quote": "#ABABBC",
		  "syntax-marker": "#00E5FF",
		  "syntax-meta": "#D4D4E0",
		  "syntax-comment": "#686877",
		  "canvas-postit-bg": "#2A1F10",
		  "canvas-postit-text": "#FFE6C7",
		  "scrollbar-thumb": "#383842",
		  "md-h1": "#F8F8FA",
		  "md-h2": "#FF6600",
		  "md-h3": "#FFAB00",
		  "md-bold": "#00E5FF",
		  "md-code": "#FF3333",
		  "md-code-back": "#161619",
		  "md-bullet": "#FFAB00",
		  "md-bullet-in": "#FF6600",
		  "md-blockquote": "#ABABBC",
		  "border-md-table": "#383842"
		}
	},
	{
		id: 'theme-sun-dark',
		name: 'Sun Dark',
		mode: 'dark',
		accentColor: '#00E5FF',
		bgColor: '#0B0D11',
		textColor: '#EEF4FC',
		description: 'Graphite carbon & cyber aqua',
		auraId: 'glass-liquid-cyan',
		auraName: 'Liquid Cyan',
		auraDescription: 'Translucent cyan glass flowing like liquid crystal',
		tokens: {
		  "bg": "#0B0D11",
		  "bg-surface": "#12161E",
		  "bg-raised": "#1A202B",
		  "bg-panel": "#0E1218",
		  "bg-footer": "#07080B",
		  "bg-popover": "#222A38",
		  "bg-dialog": "#222A38",
		  "bg-terminal": "#050608",
		  "bg-input": "#11141C",
		  "bg-canvas": "#0B0D11",
		  "border": "#293447",
		  "border-subtle": "#1C2432",
		  "text-primary": "#EEF4FC",
		  "text-secondary": "#9EB2CF",
		  "text-muted": "#5C6D87",
		  "state-hover": "#243042",
		  "state-hover-subtle": "#161D29",
		  "state-selected": "#32425C",
		  "theme-color": "#00E5FF",
		  "theme-color-alt": "#00B8D9",
		  "text-inverse": "#0B0D11",
		  "feedback-error": "#FF4A5A",
		  "syntax-heading": "#00E5FF",
		  "syntax-link": "#38BDF8",
		  "syntax-code": "#FF4A5A",
		  "syntax-quote": "#9EB2CF",
		  "syntax-marker": "#00E5FF",
		  "syntax-meta": "#A855F7",
		  "syntax-comment": "#5C6D87",
		  "canvas-postit-bg": "#271E1C",
		  "canvas-postit-text": "#FED7AA",
		  "scrollbar-thumb": "#293447",
		  "md-h1": "#EEF4FC",
		  "md-h2": "#00E5FF",
		  "md-h3": "#38BDF8",
		  "md-bold": "#00E5FF",
		  "md-code": "#FF4A5A",
		  "md-code-back": "#12161E",
		  "md-bullet": "#38BDF8",
		  "md-bullet-in": "#00E5FF",
		  "md-blockquote": "#9EB2CF",
		  "border-md-table": "#293447"
		}
	},
	{
		id: 'theme-console-dark',
		name: 'Console Dark',
		mode: 'dark',
		accentColor: '#10B981',
		bgColor: '#0D110E',
		textColor: '#DCF5E3',
		description: 'CRT Matrix phosphor green & soot',
		auraId: 'greenflare',
		auraName: 'Greenflare',
		auraDescription: 'A concentrated emerald flare dissolving into black',
		tokens: {
		  "bg": "#0D110E",
		  "bg-surface": "#141A15",
		  "bg-raised": "#1B241D",
		  "bg-panel": "#101511",
		  "bg-footer": "#080B09",
		  "bg-popover": "#232E26",
		  "bg-dialog": "#232E26",
		  "bg-terminal": "#060806",
		  "bg-input": "#121713",
		  "bg-canvas": "#0D110E",
		  "border": "#2A3A2F",
		  "border-subtle": "#1C271F",
		  "text-primary": "#DCF5E3",
		  "text-secondary": "#8DBA96",
		  "text-muted": "#4E7355",
		  "state-hover": "#26362A",
		  "state-hover-subtle": "#17211A",
		  "state-selected": "#344A3A",
		  "theme-color": "#10B981",
		  "theme-color-alt": "#34D399",
		  "text-inverse": "#0D110E",
		  "feedback-error": "#EF4444",
		  "syntax-heading": "#10B981",
		  "syntax-link": "#34D399",
		  "syntax-code": "#EF4444",
		  "syntax-quote": "#8DBA96",
		  "syntax-marker": "#10B981",
		  "syntax-meta": "#A78BFA",
		  "syntax-comment": "#4E7355",
		  "canvas-postit-bg": "#2B241A",
		  "canvas-postit-text": "#FDE68A",
		  "scrollbar-thumb": "#2A3A2F",
		  "md-h1": "#DCF5E3",
		  "md-h2": "#10B981",
		  "md-h3": "#34D399",
		  "md-bold": "#10B981",
		  "md-code": "#EF4444",
		  "md-code-back": "#141A15",
		  "md-bullet": "#34D399",
		  "md-bullet-in": "#10B981",
		  "md-blockquote": "#8DBA96",
		  "border-md-table": "#2A3A2F"
		}
	},
	{
		id: 'theme-dracula-dark',
		name: 'Dracula Dark',
		mode: 'dark',
		accentColor: '#BD93F9',
		bgColor: '#282A36',
		textColor: '#F8F8F2',
		description: 'Classic gothic vampire orchid & pink',
		auraId: 'violet-horizon',
		auraName: 'Violet Horizon',
		auraDescription: 'Indigo horizon opening into lavender and rose',
		tokens: {
		  "bg": "#282A36",
		  "bg-surface": "#343746",
		  "bg-raised": "#44475A",
		  "bg-panel": "#21222C",
		  "bg-footer": "#191A21",
		  "bg-popover": "#44475A",
		  "bg-dialog": "#44475A",
		  "bg-terminal": "#191A21",
		  "bg-input": "#21222C",
		  "bg-canvas": "#282A36",
		  "border": "#6272A4",
		  "border-subtle": "#44475A",
		  "text-primary": "#F8F8F2",
		  "text-secondary": "#BD93F9",
		  "text-muted": "#6272A4",
		  "state-hover": "#44475A",
		  "state-hover-subtle": "#343746",
		  "state-selected": "#555870",
		  "theme-color": "#BD93F9",
		  "theme-color-alt": "#FF79C6",
		  "text-inverse": "#282A36",
		  "feedback-error": "#FF5555",
		  "syntax-heading": "#BD93F9",
		  "syntax-link": "#8BE9FD",
		  "syntax-code": "#FF5555",
		  "syntax-quote": "#8995BA",
		  "syntax-marker": "#50FA7B",
		  "syntax-meta": "#FFB86C",
		  "syntax-comment": "#6272A4",
		  "canvas-postit-bg": "#44475A",
		  "canvas-postit-text": "#F1FA8C",
		  "scrollbar-thumb": "#6272A4",
		  "md-h1": "#F8F8F2",
		  "md-h2": "#BD93F9",
		  "md-h3": "#8BE9FD",
		  "md-bold": "#FF79C6",
		  "md-code": "#FF5555",
		  "md-code-back": "#343746",
		  "md-bullet": "#50FA7B",
		  "md-bullet-in": "#BD93F9",
		  "md-blockquote": "#8995BA",
		  "border-md-table": "#6272A4"
		}
	},
	{
		id: 'theme-catppuccin-mocha',
		name: 'Catppuccin Mocha',
		mode: 'dark',
		accentColor: '#CBA6F7',
		bgColor: '#1E1E2E',
		textColor: '#CDD6F4',
		description: 'Cozy pastel velvet & mauve',
		auraId: 'solstice-veil',
		auraName: 'Solstice Veil',
		auraDescription: 'Amber horizon dissolving into rose-violet dusk',
		tokens: {
		  "bg": "#1E1E2E",
		  "bg-surface": "#252538",
		  "bg-raised": "#313244",
		  "bg-panel": "#181825",
		  "bg-footer": "#11111B",
		  "bg-popover": "#313244",
		  "bg-dialog": "#313244",
		  "bg-terminal": "#11111B",
		  "bg-input": "#181825",
		  "bg-canvas": "#1E1E2E",
		  "border": "#45475A",
		  "border-subtle": "#313244",
		  "text-primary": "#CDD6F4",
		  "text-secondary": "#A6ADC8",
		  "text-muted": "#6C7086",
		  "state-hover": "#3b3d54",
		  "state-hover-subtle": "#2a2b3d",
		  "state-selected": "#4E516B",
		  "theme-color": "#CBA6F7",
		  "theme-color-alt": "#89B4FA",
		  "text-inverse": "#1E1E2E",
		  "feedback-error": "#F38BA8",
		  "syntax-heading": "#89B4FA",
		  "syntax-link": "#CBA6F7",
		  "syntax-code": "#F38BA8",
		  "syntax-quote": "#A6ADC8",
		  "syntax-marker": "#A6E3A1",
		  "syntax-meta": "#FAB387",
		  "syntax-comment": "#6C7086",
		  "canvas-postit-bg": "#313244",
		  "canvas-postit-text": "#F9E2AF",
		  "scrollbar-thumb": "#45475A",
		  "md-h1": "#CDD6F4",
		  "md-h2": "#CBA6F7",
		  "md-h3": "#89B4FA",
		  "md-bold": "#F38BA8",
		  "md-code": "#F38BA8",
		  "md-code-back": "#252538",
		  "md-bullet": "#A6E3A1",
		  "md-bullet-in": "#89B4FA",
		  "md-blockquote": "#A6ADC8",
		  "border-md-table": "#45475A"
		}
	},
	{
		id: 'theme-nord-dark',
		name: 'Nord Dark',
		mode: 'dark',
		accentColor: '#88C0D0',
		bgColor: '#2E3440',
		textColor: '#ECEFF4',
		description: 'Arctic polar night & frost aurora',
		auraId: 'aurora-beams',
		auraName: 'Aurora Beams',
		auraDescription: 'Diagonal repeating light beams heavily blurred with a teal base glow',
		tokens: {
		  "bg": "#2E3440",
		  "bg-surface": "#3B4252",
		  "bg-raised": "#434C5E",
		  "bg-panel": "#272C37",
		  "bg-footer": "#1E222A",
		  "bg-popover": "#434C5E",
		  "bg-dialog": "#434C5E",
		  "bg-terminal": "#1E222A",
		  "bg-input": "#272C37",
		  "bg-canvas": "#2E3440",
		  "border": "#4C566A",
		  "border-subtle": "#3B4252",
		  "text-primary": "#ECEFF4",
		  "text-secondary": "#D8DEE9",
		  "text-muted": "#7E8EAA",
		  "state-hover": "#4C566A",
		  "state-hover-subtle": "#3B4252",
		  "state-selected": "#5A667E",
		  "theme-color": "#88C0D0",
		  "theme-color-alt": "#81A1C1",
		  "text-inverse": "#2E3440",
		  "feedback-error": "#BF616A",
		  "syntax-heading": "#88C0D0",
		  "syntax-link": "#81A1C1",
		  "syntax-code": "#D18D93",
		  "syntax-quote": "#D8DEE9",
		  "syntax-marker": "#A3BE8C",
		  "syntax-meta": "#B894B1",
		  "syntax-comment": "#7E8EAA",
		  "canvas-postit-bg": "#3B4252",
		  "canvas-postit-text": "#EBCB8B",
		  "scrollbar-thumb": "#4C566A",
		  "md-h1": "#ECEFF4",
		  "md-h2": "#88C0D0",
		  "md-h3": "#81A1C1",
		  "md-bold": "#B894B1",
		  "md-code": "#D18D93",
		  "md-code-back": "#3B4252",
		  "md-bullet": "#A3BE8C",
		  "md-bullet-in": "#88C0D0",
		  "md-blockquote": "#D8DEE9",
		  "border-md-table": "#4C566A"
		}
	},
	{
		id: 'theme-gruvbox-dark',
		name: 'Gruvbox Dark',
		mode: 'dark',
		accentColor: '#FE8019',
		bgColor: '#282828',
		textColor: '#EBDBB2',
		description: 'Retro warm groove & saffron gold',
		auraId: 'copper-shadow',
		auraName: 'Copper Shadow',
		auraDescription: 'Muted copper light slipping beneath a black veil',
		tokens: {
		  "bg": "#282828",
		  "bg-surface": "#32302F",
		  "bg-raised": "#3C3836",
		  "bg-panel": "#1D2021",
		  "bg-footer": "#141617",
		  "bg-popover": "#3C3836",
		  "bg-dialog": "#3C3836",
		  "bg-terminal": "#1D2021",
		  "bg-input": "#1D2021",
		  "bg-canvas": "#282828",
		  "border": "#504945",
		  "border-subtle": "#3C3836",
		  "text-primary": "#EBDBB2",
		  "text-secondary": "#D5C4A1",
		  "text-muted": "#928374",
		  "state-hover": "#4A4440",
		  "state-hover-subtle": "#32302F",
		  "state-selected": "#5A524C",
		  "theme-color": "#FE8019",
		  "theme-color-alt": "#FABD2F",
		  "text-inverse": "#282828",
		  "feedback-error": "#FB4934",
		  "syntax-heading": "#FABD2F",
		  "syntax-link": "#FE8019",
		  "syntax-code": "#FB5B48",
		  "syntax-quote": "#D5C4A1",
		  "syntax-marker": "#B8BB26",
		  "syntax-meta": "#83A598",
		  "syntax-comment": "#928374",
		  "canvas-postit-bg": "#3C3836",
		  "canvas-postit-text": "#FABD2F",
		  "scrollbar-thumb": "#504945",
		  "md-h1": "#EBDBB2",
		  "md-h2": "#FE8019",
		  "md-h3": "#FABD2F",
		  "md-bold": "#B8BB26",
		  "md-code": "#FB5B48",
		  "md-code-back": "#32302F",
		  "md-bullet": "#FABD2F",
		  "md-bullet-in": "#FE8019",
		  "md-blockquote": "#D5C4A1",
		  "border-md-table": "#504945"
		}
	},
	{
		id: 'theme-onedark-pro',
		name: 'One Dark Pro',
		mode: 'dark',
		accentColor: '#61AFEF',
		bgColor: '#21252B',
		textColor: '#ABB2BF',
		description: 'Atom slate blue & coral mint',
		auraId: 'deep-cosmos',
		auraName: 'Deep Cosmos',
		auraDescription: 'Deep purple abyss with stellar glows and distant twinkling stars',
		tokens: {
		  "bg": "#21252B",
		  "bg-surface": "#282C34",
		  "bg-raised": "#2F3440",
		  "bg-panel": "#1B1D23",
		  "bg-footer": "#15171C",
		  "bg-popover": "#2F3440",
		  "bg-dialog": "#2F3440",
		  "bg-terminal": "#1B1D23",
		  "bg-input": "#1B1D23",
		  "bg-canvas": "#21252B",
		  "border": "#3E4451",
		  "border-subtle": "#2C313C",
		  "text-primary": "#ABB2BF",
		  "text-secondary": "#888E9C",
		  "text-muted": "#6A7281",
		  "state-hover": "#383E4C",
		  "state-hover-subtle": "#282C34",
		  "state-selected": "#464E5F",
		  "theme-color": "#61AFEF",
		  "theme-color-alt": "#98C379",
		  "text-inverse": "#21252B",
		  "feedback-error": "#E06C75",
		  "syntax-heading": "#61AFEF",
		  "syntax-link": "#C678DD",
		  "syntax-code": "#E06C75",
		  "syntax-quote": "#888E9C",
		  "syntax-marker": "#98C379",
		  "syntax-meta": "#E5C07B",
		  "syntax-comment": "#6A7281",
		  "canvas-postit-bg": "#282C34",
		  "canvas-postit-text": "#E5C07B",
		  "scrollbar-thumb": "#3E4451",
		  "md-h1": "#ABB2BF",
		  "md-h2": "#61AFEF",
		  "md-h3": "#C678DD",
		  "md-bold": "#98C379",
		  "md-code": "#E06C75",
		  "md-code-back": "#282C34",
		  "md-bullet": "#61AFEF",
		  "md-bullet-in": "#98C379",
		  "md-blockquote": "#888E9C",
		  "border-md-table": "#3E4451"
		}
	},
	{
		id: 'theme-rose-pine-dark',
		name: 'Rosé Pine Dark',
		mode: 'dark',
		accentColor: '#EB6F92',
		bgColor: '#191724',
		textColor: '#E0DEF4',
		description: 'SoHo midnight rose & pine',
		auraId: 'nebula-midnight-rose',
		auraName: 'Midnight Rose',
		auraDescription: 'Deep burgundy petals unfurling in eternal darkness',
		tokens: {
		  "bg": "#191724",
		  "bg-surface": "#1F1D2E",
		  "bg-raised": "#26233A",
		  "bg-panel": "#151320",
		  "bg-footer": "#0D0B14",
		  "bg-popover": "#26233A",
		  "bg-dialog": "#26233A",
		  "bg-terminal": "#151320",
		  "bg-input": "#151320",
		  "bg-canvas": "#191724",
		  "border": "#403D52",
		  "border-subtle": "#26233A",
		  "text-primary": "#E0DEF4",
		  "text-secondary": "#908CAA",
		  "text-muted": "#6E6A86",
		  "state-hover": "#312E46",
		  "state-hover-subtle": "#1F1D2E",
		  "state-selected": "#3E3B56",
		  "theme-color": "#EB6F92",
		  "theme-color-alt": "#3B8DAD",
		  "text-inverse": "#191724",
		  "feedback-error": "#EB6F92",
		  "syntax-heading": "#EB6F92",
		  "syntax-link": "#9CCFD8",
		  "syntax-code": "#EB6F92",
		  "syntax-quote": "#908CAA",
		  "syntax-marker": "#3B8DAD",
		  "syntax-meta": "#F6C177",
		  "syntax-comment": "#6E6A86",
		  "canvas-postit-bg": "#26233A",
		  "canvas-postit-text": "#F6C177",
		  "scrollbar-thumb": "#403D52",
		  "md-h1": "#E0DEF4",
		  "md-h2": "#EB6F92",
		  "md-h3": "#9CCFD8",
		  "md-bold": "#3B8DAD",
		  "md-code": "#EB6F92",
		  "md-code-back": "#1F1D2E",
		  "md-bullet": "#EB6F92",
		  "md-bullet-in": "#9CCFD8",
		  "md-blockquote": "#908CAA",
		  "border-md-table": "#403D52"
		}
	},
	{
		id: 'theme-midnight-emerald-dark',
		name: 'Midnight Emerald Dark',
		mode: 'dark',
		accentColor: '#10B981',
		bgColor: '#0A140F',
		textColor: '#E2F8EE',
		description: 'Deep malachite forest & glowing jade',
		auraId: 'glass-emerald-lens',
		auraName: 'Emerald Lens',
		auraDescription: 'Green frosted glass with teal light beams',
		tokens: {
		  "bg": "#0A140F",
		  "bg-surface": "#102018",
		  "bg-raised": "#182E23",
		  "bg-panel": "#0D1B14",
		  "bg-footer": "#060D0A",
		  "bg-popover": "#182E23",
		  "bg-dialog": "#182E23",
		  "bg-terminal": "#060D0A",
		  "bg-input": "#0D1B14",
		  "bg-canvas": "#0A140F",
		  "border": "#234534",
		  "border-subtle": "#14281E",
		  "text-primary": "#E2F8EE",
		  "text-secondary": "#8BC4AA",
		  "text-muted": "#4F8069",
		  "state-hover": "#1E3A2C",
		  "state-hover-subtle": "#102018",
		  "state-selected": "#294D3B",
		  "theme-color": "#10B981",
		  "theme-color-alt": "#34D399",
		  "text-inverse": "#0A140F",
		  "feedback-error": "#F87171",
		  "syntax-heading": "#34D399",
		  "syntax-link": "#10B981",
		  "syntax-code": "#F87171",
		  "syntax-quote": "#8BC4AA",
		  "syntax-marker": "#34D399",
		  "syntax-meta": "#A7F3D0",
		  "syntax-comment": "#4F8069",
		  "canvas-postit-bg": "#182E23",
		  "canvas-postit-text": "#A7F3D0",
		  "scrollbar-thumb": "#234534",
		  "md-h1": "#E2F8EE",
		  "md-h2": "#34D399",
		  "md-h3": "#10B981",
		  "md-bold": "#34D399",
		  "md-code": "#F87171",
		  "md-code-back": "#102018",
		  "md-bullet": "#34D399",
		  "md-bullet-in": "#10B981",
		  "md-blockquote": "#8BC4AA",
		  "border-md-table": "#234534"
		}
	},
	{
		id: 'theme-obsidian-crimson-dark',
		name: 'Obsidian Crimson Dark',
		mode: 'dark',
		accentColor: '#E5375D',
		bgColor: '#120B0D',
		textColor: '#FDE8ED',
		description: 'Gothic bloodstone & velvet ruby',
		auraId: 'blood-aurora',
		auraName: 'Blood Aurora',
		auraDescription: 'Crimson and gold aurora curtains burning across an absolute night sky',
		tokens: {
		  "bg": "#120B0D",
		  "bg-surface": "#1C1215",
		  "bg-raised": "#281A1F",
		  "bg-panel": "#160D10",
		  "bg-footer": "#0A0507",
		  "bg-popover": "#281A1F",
		  "bg-dialog": "#281A1F",
		  "bg-terminal": "#0A0507",
		  "bg-input": "#160D10",
		  "bg-canvas": "#120B0D",
		  "border": "#42252F",
		  "border-subtle": "#2A171D",
		  "text-primary": "#FDE8ED",
		  "text-secondary": "#D490A2",
		  "text-muted": "#8F5464",
		  "state-hover": "#331F27",
		  "state-hover-subtle": "#1C1215",
		  "state-selected": "#472B36",
		  "theme-color": "#E5375D",
		  "theme-color-alt": "#FB7185",
		  "text-inverse": "#120B0D",
		  "feedback-error": "#FF4D6D",
		  "syntax-heading": "#FB7185",
		  "syntax-link": "#E5375D",
		  "syntax-code": "#FF4D6D",
		  "syntax-quote": "#D490A2",
		  "syntax-marker": "#E5375D",
		  "syntax-meta": "#FDA4AF",
		  "syntax-comment": "#8F5464",
		  "canvas-postit-bg": "#281A1F",
		  "canvas-postit-text": "#FECDD3",
		  "scrollbar-thumb": "#42252F",
		  "md-h1": "#FDE8ED",
		  "md-h2": "#E5375D",
		  "md-h3": "#FB7185",
		  "md-bold": "#FB7185",
		  "md-code": "#FF4D6D",
		  "md-code-back": "#1C1215",
		  "md-bullet": "#E5375D",
		  "md-bullet-in": "#FB7185",
		  "md-blockquote": "#D490A2",
		  "border-md-table": "#42252F"
		}
	},
	{
		id: 'theme-synthwave-dark',
		name: 'Synthwave 84 Dark',
		mode: 'dark',
		accentColor: '#FF2A85',
		bgColor: '#160D26',
		textColor: '#FDF4FF',
		description: 'Retro 80s neon violet & laser cyan',
		auraId: 'mesh-neon-tokyo',
		auraName: 'Neon Tokyo',
		auraDescription: 'Cyberpunk city lights bleeding through rain-slicked streets',
		tokens: {
		  "bg": "#160D26",
		  "bg-surface": "#201338",
		  "bg-raised": "#2C1A4C",
		  "bg-panel": "#1A0F2E",
		  "bg-footer": "#0E071A",
		  "bg-popover": "#2C1A4C",
		  "bg-dialog": "#2C1A4C",
		  "bg-terminal": "#0E071A",
		  "bg-input": "#1A0F2E",
		  "bg-canvas": "#160D26",
		  "border": "#482878",
		  "border-subtle": "#2C1A4C",
		  "text-primary": "#FDF4FF",
		  "text-secondary": "#D4A9F7",
		  "text-muted": "#8762B3",
		  "state-hover": "#382161",
		  "state-hover-subtle": "#201338",
		  "state-selected": "#4D2D85",
		  "theme-color": "#FF2A85",
		  "theme-color-alt": "#00F0FF",
		  "text-inverse": "#160D26",
		  "feedback-error": "#FF2A85",
		  "syntax-heading": "#00F0FF",
		  "syntax-link": "#FF2A85",
		  "syntax-code": "#FFE600",
		  "syntax-quote": "#D4A9F7",
		  "syntax-marker": "#00F0FF",
		  "syntax-meta": "#FFB800",
		  "syntax-comment": "#8762B3",
		  "canvas-postit-bg": "#2C1A4C",
		  "canvas-postit-text": "#FFE600",
		  "scrollbar-thumb": "#482878",
		  "md-h1": "#FDF4FF",
		  "md-h2": "#FF2A85",
		  "md-h3": "#00F0FF",
		  "md-bold": "#FFE600",
		  "md-code": "#FF2A85",
		  "md-code-back": "#201338",
		  "md-bullet": "#00F0FF",
		  "md-bullet-in": "#FF2A85",
		  "md-blockquote": "#D4A9F7",
		  "border-md-table": "#482878"
		}
	},
	{
		id: 'theme-deep-ocean-dark',
		name: 'Deep Ocean Dark',
		mode: 'dark',
		accentColor: '#00E5FF',
		bgColor: '#07111A',
		textColor: '#E0F5FE',
		description: 'Bioluminescent abyss & aquamarine',
		auraId: 'deep-current',
		auraName: 'Deep Current',
		auraDescription: 'A submerged current moving horizontally through darkness',
		tokens: {
		  "bg": "#07111A",
		  "bg-surface": "#0C1A27",
		  "bg-raised": "#13273B",
		  "bg-panel": "#0A1622",
		  "bg-footer": "#04090E",
		  "bg-popover": "#13273B",
		  "bg-dialog": "#13273B",
		  "bg-terminal": "#04090E",
		  "bg-input": "#0A1622",
		  "bg-canvas": "#07111A",
		  "border": "#1E3E5C",
		  "border-subtle": "#11263A",
		  "text-primary": "#E0F5FE",
		  "text-secondary": "#8BC9E8",
		  "text-muted": "#4B7D99",
		  "state-hover": "#19344E",
		  "state-hover-subtle": "#0C1A27",
		  "state-selected": "#22476B",
		  "theme-color": "#00E5FF",
		  "theme-color-alt": "#38BDF8",
		  "text-inverse": "#07111A",
		  "feedback-error": "#F87171",
		  "syntax-heading": "#00E5FF",
		  "syntax-link": "#38BDF8",
		  "syntax-code": "#F87171",
		  "syntax-quote": "#8BC9E8",
		  "syntax-marker": "#2DD4BF",
		  "syntax-meta": "#A5F3FC",
		  "syntax-comment": "#4B7D99",
		  "canvas-postit-bg": "#13273B",
		  "canvas-postit-text": "#A5F3FC",
		  "scrollbar-thumb": "#1E3E5C",
		  "md-h1": "#E0F5FE",
		  "md-h2": "#00E5FF",
		  "md-h3": "#2DD4BF",
		  "md-bold": "#38BDF8",
		  "md-code": "#F87171",
		  "md-code-back": "#0C1A27",
		  "md-bullet": "#00E5FF",
		  "md-bullet-in": "#2DD4BF",
		  "md-blockquote": "#8BC9E8",
		  "border-md-table": "#1E3E5C"
		}
	},
	{
		id: 'theme-amethyst-void-dark',
		name: 'Amethyst Void Dark',
		mode: 'dark',
		accentColor: '#A855F7',
		bgColor: '#0F091A',
		textColor: '#F7EEFE',
		description: 'Cosmic deep violet & starlight pink',
		auraId: 'starlit-abyss',
		auraName: 'Starlit Abyss',
		auraDescription: 'Indigo void with a distant glow and scattered stars',
		tokens: {
		  "bg": "#0F091A",
		  "bg-surface": "#180F29",
		  "bg-raised": "#24173D",
		  "bg-panel": "#130B21",
		  "bg-footer": "#08040E",
		  "bg-popover": "#24173D",
		  "bg-dialog": "#24173D",
		  "bg-terminal": "#08040E",
		  "bg-input": "#130B21",
		  "bg-canvas": "#0F091A",
		  "border": "#3B2463",
		  "border-subtle": "#24173D",
		  "text-primary": "#F7EEFE",
		  "text-secondary": "#CEACF3",
		  "text-muted": "#8062A3",
		  "state-hover": "#2F1D50",
		  "state-hover-subtle": "#180F29",
		  "state-selected": "#432A70",
		  "theme-color": "#A855F7",
		  "theme-color-alt": "#EC4899",
		  "text-inverse": "#0F091A",
		  "feedback-error": "#F43F5E",
		  "syntax-heading": "#C084FC",
		  "syntax-link": "#EC4899",
		  "syntax-code": "#F43F5E",
		  "syntax-quote": "#CEACF3",
		  "syntax-marker": "#A855F7",
		  "syntax-meta": "#F472B6",
		  "syntax-comment": "#8062A3",
		  "canvas-postit-bg": "#24173D",
		  "canvas-postit-text": "#F5D0FE",
		  "scrollbar-thumb": "#3B2463",
		  "md-h1": "#F7EEFE",
		  "md-h2": "#C084FC",
		  "md-h3": "#EC4899",
		  "md-bold": "#A855F7",
		  "md-code": "#F43F5E",
		  "md-code-back": "#180F29",
		  "md-bullet": "#A855F7",
		  "md-bullet-in": "#EC4899",
		  "md-blockquote": "#CEACF3",
		  "border-md-table": "#3B2463"
		}
	},
];

export const AURA_PRESETS: AuraPreset[] = [
	{
		id: 'sunrise-drift',
		name: 'Sunrise Drift',
		category: 'aura',
		mood: 'vivid',
		dark: false,
		baseColor: '#0a0a0a',
		textColor: '#24406e',
		description: 'Blue into orange, high key',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(0,138,255,0.1) 30%, rgb(255,255,255) 20%, rgb(247,164,66) 70%, rgb(233,66,247) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(0,138,255,0.2) 35%, rgb(255,255,255) 70%, rgb(247,164,66) 80%, rgb(233,66,247) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'ember-glow',
		name: 'Ember Glow',
		category: 'aura',
		mood: 'warm',
		dark: false,
		baseColor: '#faf8f2',
		textColor: '#7a1f2e',
		description: 'Coral into deep rose',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,106,61,0.12) 28%, rgb(255,255,255) 18%, rgb(255,201,77) 68%, rgb(255,61,119) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,106,61,0.22) 34%, rgb(255,255,255) 66%, rgb(255,201,77) 82%, rgb(255,61,119) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glacier-mist',
		name: 'Glacier Mist',
		category: 'aura',
		mood: 'cool',
		dark: false,
		baseColor: '#faf8f2',
		textColor: '#1f3b6e',
		description: 'Cyan into indigo',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(77,210,255,0.12) 28%, rgb(255,255,255) 18%, rgb(53,230,192) 68%, rgb(91,110,245) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(77,210,255,0.22) 34%, rgb(255,255,255) 66%, rgb(53,230,192) 82%, rgb(91,110,245) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'orchid-bloom',
		name: 'Orchid Bloom',
		category: 'aura',
		mood: 'vivid',
		dark: false,
		baseColor: '#faf8f2',
		textColor: '#5b1f6e',
		description: 'Magenta into blue',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(242,61,224,0.12) 28%, rgb(255,255,255) 18%, rgb(139,92,246) 68%, rgb(61,139,255) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(242,61,224,0.22) 34%, rgb(255,255,255) 66%, rgb(139,92,246) 82%, rgb(61,139,255) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'deep-lagoon',
		name: 'Deep Lagoon',
		category: 'aura',
		mood: 'cool',
		dark: true,
		baseColor: '#0c0a08',
		textColor: '#d9f4ec',
		description: 'Teal into violet',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(47,209,166,0.12) 28%, rgb(255,255,255) 18%, rgb(61,124,255) 68%, rgb(122,92,255) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(47,209,166,0.22) 34%, rgb(255,255,255) 66%, rgb(61,124,255) 82%, rgb(122,92,255) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'eclipse-flare',
		name: 'Eclipse Flare',
		category: 'aura',
		mood: 'vivid',
		dark: true,
		baseColor: '#0c0a08',
		textColor: '#ffe4f0',
		description: 'Dark void curving into blue, magenta, and ember',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 89% 99% at 50% -38%, rgba(0,0,0,0) 0%, rgb(30,32,35) 38%, rgb(45,70,115) 70%, rgb(142,123,227) 90%, rgb(248,104,196) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 0.5
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 95% 105% at 50% -34%, rgba(0,0,0,0.15) 0%, rgb(30,32,35) 42%, rgb(55,82,135) 74%, rgb(150,126,228) 92%, rgb(246,108,198) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'warm-ash',
		name: 'Warm Ash',
		category: 'aura',
		mood: 'warm',
		dark: false,
		baseColor: '#f7f5f0',
		textColor: '#4a4238',
		description: 'Warm greige tones, understated and airy',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(214,204,190,0.12) 28%, rgb(255,255,255) 18%, rgb(196,181,160) 68%, rgb(168,148,122) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(214,204,190,0.22) 34%, rgb(255,255,255) 66%, rgb(196,181,160) 82%, rgb(168,148,122) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'golden-hour',
		name: 'Golden Hour',
		category: 'aura',
		mood: 'warm',
		dark: false,
		baseColor: '#faf8f2',
		textColor: '#5c2e0a',
		description: 'Amber melting into burnt sienna',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,183,77,0.12) 28%, rgb(255,255,255) 18%, rgb(255,138,61) 68%, rgb(183,77,0) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,183,77,0.22) 34%, rgb(255,255,255) 66%, rgb(255,138,61) 82%, rgb(183,77,0) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'rose-gold',
		name: 'Rose Gold',
		category: 'aura',
		mood: 'warm',
		dark: false,
		baseColor: '#faf2f2',
		textColor: '#6e2e2a',
		description: 'Blush pink dissolving into antique copper',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,183,178,0.12) 28%, rgb(255,255,255) 18%, rgb(255,145,140) 68%, rgb(200,120,115) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,183,178,0.22) 34%, rgb(255,255,255) 66%, rgb(255,145,140) 82%, rgb(200,120,115) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'sunset-boulevard',
		name: 'Sunset Boulevard',
		category: 'aura',
		mood: 'warm',
		dark: false,
		baseColor: '#faf6f2',
		textColor: '#6e2a1a',
		description: 'Coral haze fading into honeyed amber',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,107,107,0.12) 28%, rgb(255,255,255) 18%, rgb(255,170,100) 68%, rgb(255,200,80) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,107,107,0.22) 34%, rgb(255,255,255) 66%, rgb(255,170,100) 82%, rgb(255,200,80) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'champagne-fizz',
		name: 'Champagne Fizz',
		category: 'aura',
		mood: 'warm',
		dark: false,
		baseColor: '#faf8f2',
		textColor: '#5c3d1a',
		description: 'Pale gold bubbling into peach nectar',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,230,180,0.12) 28%, rgb(255,255,255) 18%, rgb(255,200,140) 68%, rgb(230,170,100) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,230,180,0.22) 34%, rgb(255,255,255) 66%, rgb(255,200,140) 82%, rgb(230,170,100) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'midnight-sapphire',
		name: 'Midnight Sapphire',
		category: 'aura',
		mood: 'cool',
		dark: false,
		baseColor: '#0a0c1a',
		textColor: '#c8d4ff',
		description: 'Deep cobalt bleeding into violet ink',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(61,90,255,0.12) 28%, rgb(255,255,255) 18%, rgb(45,55,135) 68%, rgb(20,25,60) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(61,90,255,0.22) 34%, rgb(255,255,255) 66%, rgb(45,55,135) 82%, rgb(20,25,60) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'ocean-pearl',
		name: 'Ocean Pearl',
		category: 'aura',
		mood: 'cool',
		dark: false,
		baseColor: '#f0f7fa',
		textColor: '#1a3a4a',
		description: 'Seafoam drifting into abyssal blue',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(178,235,242,0.12) 28%, rgb(255,255,255) 18%, rgb(77,182,200) 68%, rgb(45,100,130) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(178,235,242,0.22) 34%, rgb(255,255,255) 66%, rgb(77,182,200) 82%, rgb(45,100,130) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'arctic-frost',
		name: 'Arctic Frost',
		category: 'aura',
		mood: 'cool',
		dark: false,
		baseColor: '#f2f6fa',
		textColor: '#1a2a4a',
		description: 'Ice crystal refracting into periwinkle',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(200,230,255,0.12) 28%, rgb(255,255,255) 18%, rgb(150,200,255) 68%, rgb(100,130,200) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(200,230,255,0.22) 34%, rgb(255,255,255) 66%, rgb(150,200,255) 82%, rgb(100,130,200) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'silver-mist',
		name: 'Silver Mist',
		category: 'aura',
		mood: 'cool',
		dark: false,
		baseColor: '#f5f5f7',
		textColor: '#2a2a3a',
		description: 'Mercury grey dissolving into pale lilac',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(200,200,210,0.12) 28%, rgb(255,255,255) 18%, rgb(160,160,180) 68%, rgb(130,120,160) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(200,200,210,0.22) 34%, rgb(255,255,255) 66%, rgb(160,160,180) 82%, rgb(130,120,160) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'aurora-beams',
		name: 'Aurora Beams',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#0a0a0a',
		textColor: '#ffffff',
		description: 'Diagonal repeating light beams heavily blurred with a teal base glow',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(55.8% 55.49% at 50% 100%, rgb(38, 77, 76) 0%, rgba(25, 48, 47, 0) 100%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "repeating-linear-gradient( 100deg, #262626 0%, #262626 3%, rgba(38, 38, 38, 0.7) 5%, rgba(38, 38, 38, 0.7) 7%, transparent 10%, transparent 12%, rgba(38, 38, 38, 0.7) 14%, #262626 16% ), repeating-linear-gradient( 100deg, #9ca3af 0%, #9ca3af 1.5%, rgba(156, 163, 175, 0.8) 2%, #6b7280 3%, #6b7280 4%, rgba(156, 163, 175, 0.8) 4.5%, #9ca3af 5% )",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse at 100% 100%, #ffffff 20%, #0a0a0a 80%)",
		    "blendMode": "multiply",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'midnight-horizon',
		name: 'Midnight Horizon',
		category: 'aura',
		mood: 'vivid',
		dark: true,
		baseColor: 'hsl(240, 100%, 6%)',
		textColor: '#ffffff',
		description: 'A vibrant transition from deep space blue to an electric sunrise horizon',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 138, 255, 0.9) 40%, rgb(255, 255, 255) 70%, rgb(247, 164, 66) 80%, rgb(233, 66, 247) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 138, 255, 0.9) 40%, rgb(255, 255, 255) 70%, rgb(247, 164, 66) 80%, rgb(233, 66, 247) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 40,
		    "blurDesktop": 58,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(to top, rgb(0, 0, 31) 0%, rgba(0, 0, 31, 0.99) 8.1%, rgba(0, 0, 31, 0.953) 15.5%, rgba(0, 0, 31, 0.894) 22.5%, rgba(0, 0, 31, 0.824) 29%, rgba(0, 0, 31, 0.74) 35.3%, rgba(0, 0, 31, 0.647) 41.2%, rgba(0, 0, 31, 0.55) 47.1%, rgba(0, 0, 31, 0.45) 52.9%, rgba(0, 0, 31, 0.353) 58.8%, rgba(0, 0, 31, 0.26) 64.7%, rgba(0, 0, 31, 0.176) 71%, rgba(0, 0, 31, 0.106) 77.5%, rgba(0, 0, 31, 0.047) 84.5%, rgba(0, 0, 31, 0.01) 91.9%, rgba(0, 0, 31, 0) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 110,
		    "blurDesktop": 158,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'aurora-nova',
		name: 'Aurora Nova',
		category: 'aura',
		mood: 'vivid',
		dark: true,
		baseColor: 'hsl(240, 100%, 6%)',
		textColor: '#ffffff',
		description: 'A vibrant transition from deep cosmic violet to an electric neon sunrise',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 138, 255, 0.9) 40%, rgb(255, 255, 255) 70%, rgb(247, 164, 66) 80%, rgb(233, 66, 247) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 138, 255, 0.9) 40%, rgb(255, 255, 255) 70%, rgb(247, 164, 66) 80%, rgb(233, 66, 247) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(to top, rgb(0, 0, 31) 0%, rgba(0, 0, 31, 0.85) 8.1%, rgba(0, 0, 31, 0.7) 15.5%, rgba(0, 0, 31, 0.55) 22.5%, rgba(0, 0, 31, 0.4) 29%, rgba(0, 0, 31, 0.25) 35.3%, rgba(0, 0, 31, 0.15) 41.2%, rgba(0, 0, 31, 0) 50%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.5
		  }
		]
	},
	{
		id: 'solstice-veil',
		name: 'Solstice Veil',
		category: 'aura',
		mood: 'warm',
		dark: true,
		baseColor: 'hsl(345, 55%, 6%)',
		textColor: '#ffe9df',
		description: 'Amber horizon dissolving into rose-violet dusk',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,94,58,0.9) 40%, rgb(255,255,255) 70%, rgb(255,159,67) 82%, rgb(236,64,122) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(255,94,58,0.9) 40%, rgb(255,255,255) 70%, rgb(255,159,67) 82%, rgb(236,64,122) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(to top, rgb(31,4,10) 0%, rgba(31,4,10,0.9) 15%, rgba(31,4,10,0.6) 35%, rgba(31,4,10,0.25) 60%, rgba(31,4,10,0) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'arctic-dawn',
		name: 'Arctic Dawn',
		category: 'aura',
		mood: 'cool',
		dark: true,
		baseColor: 'hsl(205, 60%, 6%)',
		textColor: '#e8f4ff',
		description: 'Frozen cyan horizon melting into pale rose',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(56,189,248,0.9) 40%, rgb(255,255,255) 70%, rgb(199,210,254) 82%, rgb(249,168,212) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(56,189,248,0.9) 40%, rgb(255,255,255) 70%, rgb(199,210,254) 82%, rgb(249,168,212) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'neon-skyline',
		name: 'Neon Skyline',
		category: 'aura',
		mood: 'vivid',
		dark: true,
		baseColor: 'hsl(265, 75%, 5%)',
		textColor: '#f5e6ff',
		description: 'Electric cyan horizon bleeding into neon magenta',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(34,211,238,0.9) 40%, rgb(255,255,255) 70%, rgb(232,121,249) 82%, rgb(139,92,246) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(34,211,238,0.9) 40%, rgb(255,255,255) 70%, rgb(232,121,249) 82%, rgb(139,92,246) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(to top, rgb(8,4,20) 0%, rgba(8,4,20,0.85) 15%, rgba(8,4,20,0.5) 35%, rgba(8,4,20,0.15) 60%, rgba(8,4,20,0) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.6
		  }
		]
	},
	{
		id: 'crimson-veil',
		name: 'Crimson Veil',
		category: 'aura',
		mood: 'warm',
		dark: true,
		baseColor: 'hsl(10, 65%, 5%)',
		textColor: '#ffe8d6',
		description: 'Deep crimson horizon melting into amber gold',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(220,38,38,0.9) 40%, rgb(255,255,255) 70%, rgb(251,146,60) 82%, rgb(250,204,21) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(220,38,38,0.9) 40%, rgb(255,255,255) 70%, rgb(251,146,60) 82%, rgb(250,204,21) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'violet-horizon',
		name: 'Violet Horizon',
		category: 'aura',
		mood: 'vivid',
		dark: true,
		baseColor: 'hsl(255, 65%, 6%)',
		textColor: '#ece5ff',
		description: 'Indigo horizon opening into lavender and rose',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(99,102,241,0.9) 40%, rgb(255,255,255) 70%, rgb(216,180,254) 82%, rgb(244,114,182) 100%)",
		    "blendMode": "hard-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(0,0,0,0) 0%, rgba(99,102,241,0.9) 40%, rgb(255,255,255) 70%, rgb(216,180,254) 82%, rgb(244,114,182) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(to top, rgb(10,8,26) 0%, rgba(10,8,26,0.9) 15%, rgba(10,8,26,0.55) 35%, rgba(10,8,26,0.2) 60%, rgba(10,8,26,0) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-sakura',
		name: 'Sakura Fields',
		category: 'mesh',
		mood: 'warm',
		dark: false,
		baseColor: '#fdf2f8',
		textColor: '#6e2848',
		description: 'Cherry blossom pink mesh with warm peach nodes',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 20% 30%, rgba(251,113,133,0.7) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 80% 20%, rgba(249,168,212,0.6) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 60% 80%, rgba(253,164,175,0.5) 0%, transparent 55%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 30% 70%, rgba(244,114,182,0.4) 0%, transparent 40%)",
		    "blendMode": "soft-light",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-aurora-borealis',
		name: 'Aurora Borealis',
		category: 'mesh',
		mood: 'cool',
		dark: true,
		baseColor: '#050d0a',
		textColor: '#d7f7ef',
		description: 'Northern lights mesh with emerald and violet nodes',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 15% 50%, rgba(16,185,129,0.8) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 55% 30%, rgba(52,211,153,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 80% 60%, rgba(139,92,246,0.7) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 40% 80%, rgba(6,182,212,0.4) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-golden-coast',
		name: 'Golden Coast',
		category: 'mesh',
		mood: 'warm',
		dark: false,
		baseColor: '#fffbeb',
		textColor: '#5b3a1f',
		description: 'Sunset beach mesh with amber and coral nodes',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 25% 25%, rgba(251,191,36,0.6) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 75% 35%, rgba(251,146,60,0.5) 0%, transparent 40%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 75%, rgba(244,63,94,0.4) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 85% 80%, rgba(245,158,11,0.3) 0%, transparent 35%)",
		    "blendMode": "soft-light",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-deep-ocean',
		name: 'Deep Ocean',
		category: 'mesh',
		mood: 'cool',
		dark: true,
		baseColor: '#020617',
		textColor: '#d0f0fd',
		description: 'Abyssal blue mesh with bioluminescent nodes',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 30% 40%, rgba(14,165,233,0.7) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 70% 25%, rgba(56,189,248,0.5) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 70%, rgba(99,102,241,0.6) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 85% 75%, rgba(6,182,212,0.4) 0%, transparent 30%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 5,
		    "background": "radial-gradient(circle at 15% 80%, rgba(79,70,229,0.3) 0%, transparent 25%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-lavender-haze',
		name: 'Lavender Haze',
		category: 'mesh',
		mood: 'vivid',
		dark: false,
		baseColor: '#faf5ff',
		textColor: '#4c1d95',
		description: 'Soft purple mesh with lilac and mauve nodes',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 20% 40%, rgba(192,132,252,0.6) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 70% 30%, rgba(167,139,250,0.5) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 45% 75%, rgba(216,180,254,0.4) 0%, transparent 40%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 85% 65%, rgba(232,121,249,0.35) 0%, transparent 35%)",
		    "blendMode": "soft-light",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-graphite',
		name: 'Graphite Mesh',
		category: 'mesh',
		mood: 'cool',
		dark: true,
		baseColor: '#0d0e10',
		textColor: '#d4d8dd',
		description: 'Monochrome graphite mesh with cool steel nodes',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 25% 30%, rgba(100,116,139,0.6) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 75% 25%, rgba(148,163,184,0.4) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 75%, rgba(71,85,105,0.5) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 85% 70%, rgba(203,213,225,0.25) 0%, transparent 30%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-citrine',
		name: 'Citrine Mesh',
		category: 'mesh',
		mood: 'warm',
		dark: false,
		baseColor: '#fffef0',
		textColor: '#5a4a10',
		description: 'Sunlit yellow-gold mesh with amber nodes',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 22% 28%, rgba(250,204,21,0.6) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 78% 32%, rgba(253,224,71,0.5) 0%, transparent 40%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 78%, rgba(234,179,8,0.4) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 85% 75%, rgba(202,138,4,0.3) 0%, transparent 35%)",
		    "blendMode": "soft-light",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'celestial-drift',
		name: 'Celestial Drift',
		category: 'mesh',
		mood: 'vivid',
		dark: true,
		baseColor: '#0a0a16',
		textColor: '#eae6ff',
		description: 'Pastel cosmic mesh with lavender and mint nodes under faint stars',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 22% 32%, rgba(167,139,250,0.6) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 72% 22%, rgba(110,231,183,0.45) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 55% 75%, rgba(244,114,182,0.4) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 10% 10%, rgba(255,255,255,0.7) 1px, transparent 3px), radial-gradient(circle at 88% 15%, rgba(255,255,255,0.6) 1px, transparent 3px), radial-gradient(circle at 40% 90%, rgba(255,255,255,0.6) 1px, transparent 3px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'mesh-neon-tokyo',
		name: 'Neon Tokyo',
		category: 'mesh',
		mood: 'vivid',
		dark: true,
		baseColor: '#0a0014',
		textColor: '#ff6b9d',
		description: 'Cyberpunk city lights bleeding through rain-slicked streets',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 15% 20%, rgba(255,0,128,0.7) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 85% 15%, rgba(0,255,255,0.6) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 80%, rgba(255,255,0,0.4) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 70% 50%, rgba(255,0,255,0.3) 0%, transparent 40%)",
		    "blendMode": "overlay",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-volcanic-glass',
		name: 'Volcanic Glass',
		category: 'mesh',
		mood: 'dark',
		dark: true,
		baseColor: '#0a0200',
		textColor: '#ff8c69',
		description: 'Molten obsidian cooling into prismatic fractures',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 30% 30%, rgba(255,69,0,0.6) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 70% 25%, rgba(255,140,0,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 70%, rgba(139,0,0,0.5) 0%, transparent 50%)",
		    "blendMode": "multiply",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 20% 80%, rgba(255,215,0,0.25) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-pearl-diving',
		name: 'Pearl Diving',
		category: 'mesh',
		mood: 'cool',
		dark: true,
		baseColor: '#020a0f',
		textColor: '#e0f7fa',
		description: 'Iridescent mother-of-pearl shimmering in abyssal depths',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 25% 35%, rgba(178,235,242,0.6) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 75% 30%, rgba(224,247,250,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 45% 75%, rgba(128,222,234,0.4) 0%, transparent 50%)",
		    "blendMode": "soft-light",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 30%)",
		    "blendMode": "overlay",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-solar-flare',
		name: 'Solar Flare',
		category: 'mesh',
		mood: 'warm',
		dark: false,
		baseColor: '#fff8e7',
		textColor: '#8b4513',
		description: 'Coronal mass ejection captured in frozen light',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 20% 25%, rgba(255,200,50,0.7) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 80% 20%, rgba(255,140,0,0.6) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 75%, rgba(255,69,0,0.5) 0%, transparent 55%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 30% 70%, rgba(255,255,200,0.4) 0%, transparent 40%)",
		    "blendMode": "overlay",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-witching-hour',
		name: 'Witching Hour',
		category: 'mesh',
		mood: 'dark',
		dark: true,
		baseColor: '#0a0010',
		textColor: '#d8b4fe',
		description: 'Midnight ritual glow with emerald smoke and violet embers',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 30% 25%, rgba(139,92,246,0.6) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 70% 35%, rgba(16,185,129,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 45% 75%, rgba(236,72,153,0.4) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 15% 80%, rgba(250,204,21,0.2) 0%, transparent 30%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-cotton-candy',
		name: 'Cotton Candy',
		category: 'mesh',
		mood: 'vivid',
		dark: false,
		baseColor: '#fff0f5',
		textColor: '#be185d',
		description: 'Sugar-spun clouds dissolving in pastel twilight',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 20% 30%, rgba(244,114,182,0.6) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 75% 25%, rgba(167,139,250,0.5) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 80%, rgba(253,186,116,0.4) 0%, transparent 55%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 85% 70%, rgba(192,132,252,0.3) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-arctic-aurora',
		name: 'Arctic Aurora',
		category: 'mesh',
		mood: 'cool',
		dark: true,
		baseColor: '#020617',
		textColor: '#a5f3fc',
		description: 'Polar light curtains dancing across frozen tundra',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 15% 40%, rgba(34,211,238,0.7) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 60% 25%, rgba(52,211,153,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 80% 65%, rgba(139,92,246,0.6) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 35% 80%, rgba(6,182,212,0.35) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-bourbon-smoke',
		name: 'Bourbon Smoke',
		category: 'mesh',
		mood: 'warm',
		dark: true,
		baseColor: '#0f0800',
		textColor: '#fbbf24',
		description: 'Amber liquid light refracting through oak-aged haze',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 25% 30%, rgba(180,83,9,0.6) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 75% 25%, rgba(217,119,6,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 75%, rgba(120,53,15,0.5) 0%, transparent 50%)",
		    "blendMode": "multiply",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 20% 80%, rgba(251,191,36,0.25) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-digital-rain',
		name: 'Digital Rain',
		category: 'mesh',
		mood: 'cool',
		dark: true,
		baseColor: '#000a00',
		textColor: '#4ade80',
		description: 'Matrix code dissolving into phosphor green pools',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 30% 20%, rgba(34,197,94,0.7) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 70% 35%, rgba(16,185,129,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 45% 70%, rgba(6,182,212,0.4) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 80% 80%, rgba(132,204,22,0.2) 0%, transparent 30%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-rose-quartz',
		name: 'Rose Quartz',
		category: 'mesh',
		mood: 'warm',
		dark: false,
		baseColor: '#fdf2f8',
		textColor: '#9d174d',
		description: 'Crystalline pink formations catching dawn light',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 22% 28%, rgba(251,113,133,0.6) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 78% 32%, rgba(244,114,182,0.5) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 78%, rgba(253,164,175,0.4) 0%, transparent 55%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 30% 70%, rgba(255,228,230,0.5) 0%, transparent 40%)",
		    "blendMode": "overlay",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-abyssal-void',
		name: 'Abyssal Void',
		category: 'mesh',
		mood: 'dark',
		dark: true,
		baseColor: '#000508',
		textColor: '#67e8f9',
		description: 'Crushing darkness pierced by bioluminescent anglerfish glow',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 50% 40%, rgba(6,182,212,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 20% 70%, rgba(14,165,233,0.3) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 80% 60%, rgba(99,102,241,0.25) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 60% 85%, rgba(6,182,212,0.15) 0%, transparent 30%)",
		    "blendMode": "overlay",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-saffron-silk',
		name: 'Saffron Silk',
		category: 'mesh',
		mood: 'warm',
		dark: false,
		baseColor: '#fffbeb',
		textColor: '#78350f',
		description: 'Spice market warmth woven through golden fabric folds',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 20% 25%, rgba(234,179,8,0.6) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 80% 30%, rgba(217,119,6,0.5) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 80%, rgba(180,83,9,0.4) 0%, transparent 55%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 30% 70%, rgba(251,191,36,0.3) 0%, transparent 40%)",
		    "blendMode": "overlay",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-nebula-core',
		name: 'Nebula Core',
		category: 'mesh',
		mood: 'vivid',
		dark: true,
		baseColor: '#050510',
		textColor: '#e0e7ff',
		description: 'Stellar nursery birthing new stars in chromatic gas clouds',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 25% 30%, rgba(139,92,246,0.6) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 75% 25%, rgba(236,72,153,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 75%, rgba(59,130,246,0.5) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 20% 80%, rgba(250,204,21,0.2) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 5,
		    "background": "radial-gradient(circle at 85% 70%, rgba(255,255,255,0.1) 0%, transparent 25%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-frosted-jade',
		name: 'Frosted Jade',
		category: 'mesh',
		mood: 'cool',
		dark: false,
		baseColor: '#f0fdf4',
		textColor: '#065f46',
		description: 'Ancient jade carved from glacier ice and mountain mist',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 25% 30%, rgba(52,211,153,0.5) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 75% 25%, rgba(16,185,129,0.4) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 80%, rgba(6,182,212,0.35) 0%, transparent 55%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 30% 70%, rgba(209,250,229,0.5) 0%, transparent 40%)",
		    "blendMode": "overlay",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-ember-dusk',
		name: 'Ember Dusk',
		category: 'mesh',
		mood: 'warm',
		dark: true,
		baseColor: '#0f0500',
		textColor: '#fdba74',
		description: 'Last embers of sunset smoldering behind charcoal hills',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 30% 35%, rgba(234,88,12,0.6) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 70% 30%, rgba(251,146,60,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 75%, rgba(153,27,27,0.4) 0%, transparent 50%)",
		    "blendMode": "multiply",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 20% 80%, rgba(251,191,36,0.2) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-lunar-surface',
		name: 'Lunar Surface',
		category: 'mesh',
		mood: 'cool',
		dark: true,
		baseColor: '#0a0a0f',
		textColor: '#e2e8f0',
		description: 'Moon dust catching earthshine in silent craters',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 20% 30%, rgba(148,163,184,0.5) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 80% 25%, rgba(203,213,225,0.4) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 75%, rgba(100,116,139,0.35) 0%, transparent 50%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.15) 0%, transparent 30%)",
		    "blendMode": "overlay",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-tropical-punch',
		name: 'Tropical Punch',
		category: 'mesh',
		mood: 'vivid',
		dark: false,
		baseColor: '#fff1f2',
		textColor: '#be123c',
		description: 'Mango and dragon fruit colliding in a blender of light',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 22% 28%, rgba(251,146,60,0.6) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 78% 32%, rgba(244,63,94,0.5) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 78%, rgba(250,204,21,0.4) 0%, transparent 55%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 85% 70%, rgba(236,72,153,0.3) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-obsidian-prism',
		name: 'Obsidian Prism',
		category: 'mesh',
		mood: 'dark',
		dark: true,
		baseColor: '#050505',
		textColor: '#c4b5fd',
		description: 'Black volcanic glass fracturing light into hidden spectra',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 30% 25%, rgba(139,92,246,0.4) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 70% 35%, rgba(6,182,212,0.3) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 75%, rgba(236,72,153,0.25) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 20% 80%, rgba(250,204,21,0.15) 0%, transparent 30%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-alpine-meadow',
		name: 'Alpine Meadow',
		category: 'mesh',
		mood: 'cool',
		dark: false,
		baseColor: '#f0fdf4',
		textColor: '#14532d',
		description: 'Wildflower blooms scattered across high altitude pastures',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 20% 30%, rgba(132,204,22,0.5) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 75% 25%, rgba(52,211,153,0.4) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 80%, rgba(250,204,21,0.35) 0%, transparent 55%)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 30% 70%, rgba(167,139,250,0.25) 0%, transparent 40%)",
		    "blendMode": "overlay",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-copper-patina',
		name: 'Copper Patina',
		category: 'mesh',
		mood: 'warm',
		dark: true,
		baseColor: '#0f0a00',
		textColor: '#fde68a',
		description: 'Oxidized bronze catching verdigris and rust in equal measure',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 25% 30%, rgba(180,83,9,0.5) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 75% 25%, rgba(21,128,61,0.4) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 75%, rgba(120,53,15,0.4) 0%, transparent 50%)",
		    "blendMode": "multiply",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 20% 80%, rgba(234,179,8,0.2) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'mesh-starlight-canvas',
		name: 'Starlight Canvas',
		category: 'mesh',
		mood: 'vivid',
		dark: true,
		baseColor: '#020205',
		textColor: '#e0e7ff',
		description: 'Painter\'s palette dipped in galaxy dust and constellation ink',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 25% 30%, rgba(99,102,241,0.5) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 75% 25%, rgba(236,72,153,0.4) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 75%, rgba(14,165,233,0.4) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 20% 80%, rgba(250,204,21,0.2) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 5,
		    "background": "radial-gradient(circle at 10% 10%, rgba(255,255,255,0.8) 1px, transparent 3px), radial-gradient(circle at 88% 15%, rgba(255,255,255,0.6) 1px, transparent 3px), radial-gradient(circle at 40% 90%, rgba(255,255,255,0.6) 1px, transparent 3px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'nebula-cosmic-dust',
		name: 'Cosmic Dust',
		category: 'nebula',
		mood: 'vivid',
		dark: true,
		baseColor: '#09090b',
		textColor: '#e0d4ff',
		description: 'Floating violet and cyan orbs in deep space',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 40% 50% at 25% 35%, rgba(139,92,246,0.9) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 45% at 70% 60%, rgba(6,182,212,0.8) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 25% 30% at 50% 20%, rgba(244,114,182,0.5) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 25% at 80% 30%, rgba(232,121,249,0.4) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-supernova',
		name: 'Supernova',
		category: 'nebula',
		mood: 'warm',
		dark: false,
		baseColor: '#0a0502',
		textColor: '#ffecd2',
		description: 'Explosive amber and crimson orbs',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 45% 55% at 40% 45%, rgba(245,158,11,0.9) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 30% 40% at 70% 35%, rgba(239,68,68,0.7) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 35% 35% at 25% 70%, rgba(251,146,60,0.6) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 20% at 60% 75%, rgba(220,38,38,0.4) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-mint-cloud',
		name: 'Mint Cloud',
		category: 'nebula',
		mood: 'cool',
		dark: false,
		baseColor: '#ecfdf5',
		textColor: '#064e3b',
		description: 'Ethereal teal and emerald floating spheres',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 40% 45% at 30% 40%, rgba(52,211,153,0.7) 0%, transparent 65%)",
		    "blendMode": "normal",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 40% at 65% 55%, rgba(20,184,166,0.5) 0%, transparent 60%)",
		    "blendMode": "normal",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 25% 30% at 75% 25%, rgba(110,231,183,0.4) 0%, transparent 55%)",
		    "blendMode": "normal",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'blood-aurora',
		name: 'Blood Aurora',
		category: 'nebula',
		mood: 'dark',
		dark: true,
		baseColor: '#050101',
		textColor: '#ffe0d0',
		description: 'Crimson and gold aurora curtains burning across an absolute night sky',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(154deg, transparent 18%, rgba(60,10,10,0.06) 29%, rgba(255,40,0,0.40) 36%, rgb(255,255,255) 42%, rgba(207,60,20,0.32) 48%, rgba(158,20,10,0.22) 55%, rgba(255,90,0,0.30) 62%, rgba(60,15,10,0.08) 68%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 85,
		    "blurDesktop": 122,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(128deg, transparent 28%, rgba(80,10,20,0.06) 38%, rgba(255,80,0,0.35) 43%, rgb(255,255,255) 48%, rgba(200,60,30,0.22) 52%, rgba(255,40,0,0.25) 57%, rgba(90,20,10,0.10) 62%, transparent 76%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 78% 20% at 51% 53%, rgba(200,50,20,0.24) 0%, rgba(100,20,10,0.10) 45%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 70,
		    "blurDesktop": 101,
		    "opacity": 0.9
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 48% 9% at 52% 50%, rgba(255,220,190,0.14) 0%, rgba(200,80,50,0.06) 45%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 5,
		    "background": "linear-gradient(to top, rgba(5,1,1,0.90) 0%, rgba(5,1,1,0.58) 28%, rgba(5,1,1,0.20) 55%, transparent 78%)",
		    "blendMode": "multiply",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 0.9
		  },
		  {
		    "layer": 6,
		    "background": "radial-gradient(ellipse 50% 28% at 72% 18%, rgba(150,90,20,0.10) 0%, rgba(100,60,10,0.04) 45%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 0.7
		  }
		]
	},
	{
		id: 'void-serpent',
		name: 'Void Serpent',
		category: 'nebula',
		mood: 'dark',
		dark: true,
		baseColor: '#020502',
		textColor: '#d8ffe0',
		description: 'Poisonous green and violet curtains coiling through an absolute void',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(154deg, transparent 18%, rgba(10,60,20,0.06) 29%, rgba(140,255,20,0.40) 36%, rgb(255,255,255) 42%, rgba(110,60,200,0.32) 48%, rgba(60,150,40,0.22) 55%, rgba(160,0,255,0.30) 62%, rgba(10,50,20,0.08) 68%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 85,
		    "blurDesktop": 122,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(128deg, transparent 28%, rgba(15,80,30,0.06) 38%, rgba(120,0,255,0.35) 43%, rgb(255,255,255) 48%, rgba(70,200,90,0.22) 52%, rgba(150,255,20,0.25) 57%, rgba(20,90,40,0.10) 62%, transparent 76%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 78% 20% at 51% 53%, rgba(90,200,60,0.24) 0%, rgba(40,100,30,0.10) 45%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 70,
		    "blurDesktop": 101,
		    "opacity": 0.9
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 48% 9% at 52% 50%, rgba(220,255,220,0.14) 0%, rgba(120,80,180,0.06) 45%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 5,
		    "background": "linear-gradient(to top, rgba(2,5,2,0.90) 0%, rgba(2,5,2,0.58) 28%, rgba(2,5,2,0.20) 55%, transparent 78%)",
		    "blendMode": "multiply",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 0.9
		  },
		  {
		    "layer": 6,
		    "background": "radial-gradient(ellipse 50% 28% at 72% 18%, rgba(100,30,180,0.10) 0%, rgba(60,20,120,0.04) 45%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 0.7
		  }
		]
	},
	{
		id: 'nebula-plasma',
		name: 'Plasma Storm',
		category: 'nebula',
		mood: 'vivid',
		dark: true,
		baseColor: '#09090b',
		textColor: '#e8d5ff',
		description: 'Electric purple and blue plasma blobs',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 50% 40% at 35% 50%, rgba(124,58,237,0.9) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 40% 50% at 65% 40%, rgba(59,130,246,0.8) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 50% 75%, rgba(168,85,247,0.6) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 20% at 20% 25%, rgba(96,165,250,0.4) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  },
		  {
		    "layer": 5,
		    "background": "radial-gradient(ellipse 15% 18% at 80% 70%, rgba(147,51,234,0.5) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-rose-quartz',
		name: 'Rose Quartz',
		category: 'nebula',
		mood: 'warm',
		dark: false,
		baseColor: '#fff1f2',
		textColor: '#831843',
		description: 'Delicate pink and blush floating orbs',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 45% 50% at 35% 45%, rgba(251,113,133,0.6) 0%, transparent 60%)",
		    "blendMode": "normal",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 30% 35% at 70% 35%, rgba(244,114,182,0.5) 0%, transparent 55%)",
		    "blendMode": "normal",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 35% 40% at 55% 75%, rgba(253,164,175,0.4) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-ashen',
		name: 'Ashen Nebula',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#0a0a0b',
		textColor: '#c9cdd3',
		description: 'Dim charcoal orbs drifting through a gray void',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 42% 48% at 30% 40%, rgba(148,163,184,0.5) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 40% at 68% 55%, rgba(100,116,139,0.45) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 25% 30% at 50% 80%, rgba(71,85,105,0.4) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-quiet-glow',
		name: 'Quiet Glow',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#050707',
		textColor: '#c8e7e6',
		description: 'A single soft cyan presence floating in darkness',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 42% 48% at 68% 48%, rgba(45,140,137,0.34) 0%, rgba(25,76,75,0.16) 42%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 20% 24% at 66% 48%, rgba(78,166,161,0.12) 0%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 70,
		    "blurDesktop": 101,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'nebula-moonlit',
		name: 'Moonlit',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#05070a',
		textColor: '#d6e1ef',
		description: 'A pale blue glow fading into a midnight void',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 38% 42% at 76% 30%, rgba(105,135,165,0.26) 0%, rgba(57,79,103,0.12) 45%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 25,
		    "blurDesktop": 36,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 18% 20% at 76% 30%, rgba(180,198,214,0.10) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 38,
		    "blurDesktop": 54,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'nebula-emberveil',
		name: 'Emberveil',
		category: 'nebula',
		mood: 'warm',
		dark: true,
		baseColor: '#090604',
		textColor: '#ead4c2',
		description: 'A muted ember drifting behind a dark veil',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 45% 50% at 28% 62%, rgba(143,77,39,0.28) 0%, rgba(79,45,27,0.13) 45%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 18% 22% at 31% 60%, rgba(211,119,58,0.13) 0%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 0.75
		  }
		]
	},
	{
		id: 'nebula-dew',
		name: 'Dew',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#040707',
		textColor: '#c8ebe8',
		description: 'Tiny turquoise atmosphere suspended in deep black',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 28% 32% at 32% 34%, rgba(36,125,119,0.30) 0%, rgba(22,66,64,0.13) 45%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 16% 18% at 32% 34%, rgba(82,169,160,0.14) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 55,
		    "blurDesktop": 79,
		    "opacity": 0.8
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 24% 28% at 78% 72%, rgba(25,91,89,0.16) 0%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 0.7
		  }
		]
	},
	{
		id: 'nebula-boreal',
		name: 'Boreal',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#040706',
		textColor: '#d0ebe0',
		description: 'A restrained northern green haze in a black void',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 46% 52% at 62% 42%, rgba(35,112,78,0.27) 0%, rgba(22,65,49,0.13) 45%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 25,
		    "blurDesktop": 36,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(125deg, transparent 35%, rgba(55,137,99,0.10) 52%, transparent 68%)",
		    "blendMode": "soft-light",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'nebula-silk',
		name: 'Silk',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#040707',
		textColor: '#cbe6e4',
		description: 'A thin atmospheric ribbon softly crossing the void',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(154deg, transparent 28%, rgba(31,103,99,0.08) 38%, rgba(48,137,130,0.22) 48%, rgba(25,78,75,0.12) 56%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 70% 18% at 50% 52%, rgba(38,116,111,0.20) 0%, rgba(20,61,59,0.08) 48%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 63,
		    "blurDesktop": 90,
		    "opacity": 0.85
		  }
		]
	},
	{
		id: 'aurora-borealis',
		name: 'Aurora Borealis',
		category: 'nebula',
		mood: 'vivid',
		dark: true,
		baseColor: '#020509',
		textColor: '#e1fff6',
		description: 'Layered emerald and cyan aurora curtains drifting across a midnight sky',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(154deg, transparent 18%, rgba(12,72,61,0.06) 29%, rgba(0,229,255,0.40) 36%, rgb(255,255,255) 42%, rgba(73,207,158,0.32) 48%, rgba(38,158,119,0.22) 55%, rgba(0,183,255,0.30) 62%, rgba(15,76,65,0.08) 68%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 85,
		    "blurDesktop": 122,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(128deg, transparent 28%, rgba(15,82,96,0.06) 38%, rgba(0,183,255,0.35) 43%, rgb(255,255,255) 48%, rgba(68,197,185,0.22) 52%, rgba(0,229,255,0.25) 57%, rgba(25,105,112,0.10) 62%, transparent 76%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 78% 20% at 51% 53%, rgba(65,183,155,0.24) 0%, rgba(30,102,91,0.10) 45%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 70,
		    "blurDesktop": 101,
		    "opacity": 0.9
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 48% 9% at 52% 50%, rgba(190,255,226,0.14) 0%, rgba(91,195,163,0.06) 45%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 5,
		    "background": "linear-gradient(to top, rgba(1,5,13,0.90) 0%, rgba(2,7,16,0.58) 28%, rgba(3,9,20,0.20) 55%, transparent 78%)",
		    "blendMode": "multiply",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 0.9
		  },
		  {
		    "layer": 6,
		    "background": "radial-gradient(ellipse 50% 28% at 72% 18%, rgba(89,62,151,0.10) 0%, rgba(57,44,100,0.04) 45%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 0.7
		  }
		]
	},
	{
		id: 'prism-rainbow-flare',
		name: 'Rainbow Flare',
		category: 'prism',
		mood: 'vivid',
		dark: false,
		baseColor: '#fafafa',
		textColor: '#3b1f6e',
		description: 'Full spectrum conic burst',
		layers: [
		  {
		    "layer": 1,
		    "background": "conic-gradient(from 180deg at 50% 60%, #f43f5e, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #f43f5e)",
		    "blendMode": "soft-light",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 60%)",
		    "blendMode": "overlay",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'prism-dark-spectrum',
		name: 'Dark Spectrum',
		category: 'prism',
		mood: 'vivid',
		dark: true,
		baseColor: '#09090b',
		textColor: '#e8d5ff',
		description: 'Neon prismatic halo on dark void',
		layers: [
		  {
		    "layer": 1,
		    "background": "conic-gradient(from 220deg at 50% 55%, #6366f1, #06b6d4, #10b981, #f59e0b, #ef4444, #ec4899, #8b5cf6, #6366f1)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.6) 0%, transparent 50%)",
		    "blendMode": "multiply",
		    "blurMobile": 50,
		    "blurDesktop": 72,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'prism-crystal-edge',
		name: 'Crystal Edge',
		category: 'prism',
		mood: 'cool',
		dark: false,
		baseColor: '#f5f3ff',
		textColor: '#1e1b4b',
		description: 'Angular prism refraction with blue-violet',
		layers: [
		  {
		    "layer": 1,
		    "background": "conic-gradient(from 135deg at 30% 40%, #818cf8, #c084fc, #f0abfc, #93c5fd, #818cf8)",
		    "blendMode": "soft-light",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "conic-gradient(from 315deg at 70% 60%, #a78bfa, #67e8f9, #86efac, #a78bfa)",
		    "blendMode": "soft-light",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'prism-solar-flare',
		name: 'Solar Flare',
		category: 'prism',
		mood: 'warm',
		dark: false,
		baseColor: '#0c0502',
		textColor: '#fef3c7',
		description: 'Warm conic burst from golden core',
		layers: [
		  {
		    "layer": 1,
		    "background": "conic-gradient(from 90deg at 50% 65%, #f59e0b, #ef4444, #f97316, #fbbf24, #f59e0b)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 60%, rgba(251,191,36,0.4) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'prism-steel-spectrum',
		name: 'Steel Spectrum',
		category: 'prism',
		mood: 'cool',
		dark: true,
		baseColor: '#0b0c0e',
		textColor: '#c3ccd6',
		description: 'Muted steel-blue conic burst, quiet and industrial',
		layers: [
		  {
		    "layer": 1,
		    "background": "conic-gradient(from 200deg at 50% 55%, #334155, #64748b, #94a3b8, #475569, #1e293b, #334155)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.5) 0%, transparent 50%)",
		    "blendMode": "multiply",
		    "blurMobile": 50,
		    "blurDesktop": 72,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'prism-borealis-shard',
		name: 'Borealis Shard',
		category: 'prism',
		mood: 'vivid',
		dark: true,
		baseColor: '#07080f',
		textColor: '#d5f5ff',
		description: 'Conic fragment with aurora tones crossing deep space',
		layers: [
		  {
		    "layer": 1,
		    "background": "conic-gradient(from 210deg at 50% 55%, #14b8a6, #6366f1, #ec4899, #22d3ee, #14b8a6)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.55) 0%, transparent 50%)",
		    "blendMode": "multiply",
		    "blurMobile": 50,
		    "blurDesktop": 72,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'prism-iris-halo',
		name: 'Iris Halo',
		category: 'prism',
		mood: 'vivid',
		dark: true,
		baseColor: '#07070b',
		textColor: '#f5eaff',
		description: 'Soft iridescent ring with a luminous spectral center',
		layers: [
		  {
		    "layer": 1,
		    "background": "conic-gradient(from 45deg at 50% 50%, #06b6d4, #6366f1, #d946ef, #f43f5e, #f59e0b, #22c55e, #06b6d4)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 0.72
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 28%, transparent 58%)",
		    "blendMode": "screen",
		    "blurMobile": 63,
		    "blurDesktop": 90,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 50%, #050507 25%, transparent 27%, transparent 100%)",
		    "blendMode": "multiply",
		    "blurMobile": 30,
		    "blurDesktop": 43,
		    "opacity": 0.9
		  }
		]
	},
	{
		id: 'prism-glasswave',
		name: 'Glasswave',
		category: 'prism',
		mood: 'cool',
		dark: true,
		baseColor: '#05080b',
		textColor: '#d8f8ff',
		description: 'Thin spectral waves refracting through translucent glass',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(118deg, transparent 18%, rgba(34,211,238,0.18) 30%, rgba(129,140,248,0.24) 39%, rgba(236,72,153,0.20) 47%, rgba(251,191,36,0.16) 56%, rgba(34,197,94,0.18) 66%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 0.9
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(62deg, transparent 30%, rgba(255,255,255,0.10) 42%, rgba(103,232,249,0.14) 50%, transparent 64%)",
		    "blendMode": "overlay",
		    "blurMobile": 45,
		    "blurDesktop": 65,
		    "opacity": 0.8
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 65% 18% at 50% 50%, rgba(255,255,255,0.10) 0%, transparent 75%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 0.7
		  }
		]
	},
	{
		id: 'prism-spectral-edge',
		name: 'Spectral Edge',
		category: 'prism',
		mood: 'vivid',
		dark: true,
		baseColor: '#050609',
		textColor: '#f0f9ff',
		description: 'A concentrated rainbow refraction emerging from one edge',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.04) 32%, rgba(6,182,212,0.18) 45%, rgba(34,197,94,0.22) 51%, rgba(250,204,21,0.20) 57%, rgba(244,63,94,0.18) 64%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(102deg, transparent 38%, rgba(255,255,255,0.22) 46%, rgba(125,211,252,0.14) 51%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 40,
		    "blurDesktop": 58,
		    "opacity": 0.85
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 25% 65% at 92% 50%, rgba(139,92,246,0.16) 0%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'prism-refract',
		name: 'Refract',
		category: 'prism',
		mood: 'vivid',
		dark: true,
		baseColor: '#050608',
		textColor: '#e0f2fe',
		description: 'Diagonal spectral refraction split across a dark surface',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, transparent 25%, #22d3ee 34%, #3b82f6 40%, #8b5cf6 46%, #ec4899 52%, #f59e0b 58%, #22c55e 64%, transparent 74%)",
		    "blendMode": "screen",
		    "blurMobile": 105,
		    "blurDesktop": 151,
		    "opacity": 0.68
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(135deg, transparent 34%, rgba(255,255,255,0.26) 47%, rgba(255,255,255,0.05) 53%, transparent 67%)",
		    "blendMode": "screen",
		    "blurMobile": 35,
		    "blurDesktop": 50,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.10) 50%, transparent 70%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'prism-polaris',
		name: 'Polaris',
		category: 'prism',
		mood: 'cool',
		dark: true,
		baseColor: '#04070b',
		textColor: '#dffaff',
		description: 'Cold cyan and violet spectrum orbiting a dark center',
		layers: [
		  {
		    "layer": 1,
		    "background": "conic-gradient(from 160deg at 50% 50%, #06b6d4, #2563eb, #7c3aed, #a855f7, #22d3ee, #06b6d4)",
		    "blendMode": "screen",
		    "blurMobile": 155,
		    "blurDesktop": 223,
		    "opacity": 0.68
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, rgba(207,250,254,0.18) 0%, rgba(103,232,249,0.08) 22%, transparent 54%)",
		    "blendMode": "screen",
		    "blurMobile": 63,
		    "blurDesktop": 90,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.42) 38%, transparent 62%)",
		    "blendMode": "multiply",
		    "blurMobile": 45,
		    "blurDesktop": 65,
		    "opacity": 0.9
		  }
		]
	},
	{
		id: 'prism-splitlight',
		name: 'Splitlight',
		category: 'prism',
		mood: 'vivid',
		dark: true,
		baseColor: '#040507',
		textColor: '#f8fbff',
		description: 'A clean beam splitting into spectral colors',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.06) 35%, rgba(34,211,238,0.20) 42%, rgba(59,130,246,0.22) 47%, rgba(139,92,246,0.22) 52%, rgba(236,72,153,0.20) 57%, rgba(245,158,11,0.16) 63%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(102deg, transparent 38%, rgba(255,255,255,0.30) 48%, rgba(255,255,255,0.08) 52%, transparent 64%)",
		    "blendMode": "screen",
		    "blurMobile": 30,
		    "blurDesktop": 43,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 55% at 28% 50%, rgba(59,130,246,0.12) 0%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'prism-neon-ring',
		name: 'Neon Ring',
		category: 'prism',
		mood: 'vivid',
		dark: true,
		baseColor: '#050509',
		textColor: '#f0f9ff',
		description: 'Thin spectral ring glowing around a deep central void',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 50% 50%, transparent 34%, rgba(34,211,238,0.22) 38%, rgba(59,130,246,0.22) 42%, rgba(139,92,246,0.20) 46%, rgba(236,72,153,0.18) 50%, rgba(245,158,11,0.14) 54%, transparent 61%)",
		    "blendMode": "screen",
		    "blurMobile": 70,
		    "blurDesktop": 101,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, transparent 42%, rgba(255,255,255,0.16) 46%, transparent 51%)",
		    "blendMode": "screen",
		    "blurMobile": 30,
		    "blurDesktop": 43,
		    "opacity": 0.85
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 50%, #030306 0%, #030306 34%, transparent 35%)",
		    "blendMode": "multiply",
		    "blurMobile": 20,
		    "blurDesktop": 29,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'prism-aether',
		name: 'Aether',
		category: 'prism',
		mood: 'cool',
		dark: true,
		baseColor: '#05070a',
		textColor: '#e4f7ff',
		description: 'Weightless cyan-violet iridescence floating through darkness',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 48% 38% at 34% 48%, rgba(34,211,238,0.24) 0%, rgba(59,130,246,0.14) 45%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 42% 40% at 70% 45%, rgba(167,139,250,0.22) 0%, rgba(217,70,239,0.10) 46%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 145,
		    "blurDesktop": 209,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(145deg, transparent 30%, rgba(255,255,255,0.08) 48%, rgba(103,232,249,0.10) 55%, transparent 72%)",
		    "blendMode": "soft-light",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'prism-diamond',
		name: 'Diamond',
		category: 'prism',
		mood: 'vivid',
		dark: true,
		baseColor: '#06070a',
		textColor: '#f8fafc',
		description: 'Sharp spectral light refracted through an invisible crystal',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(45deg, transparent 24%, rgba(34,211,238,0.20) 35%, rgba(255,255,255,0.22) 40%, rgba(129,140,248,0.24) 46%, rgba(236,72,153,0.18) 52%, rgba(245,158,11,0.14) 59%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 65,
		    "blurDesktop": 94,
		    "opacity": 0.9
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(135deg, transparent 34%, rgba(255,255,255,0.20) 46%, rgba(103,232,249,0.14) 52%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 35,
		    "blurDesktop": 50,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "conic-gradient(from 45deg at 50% 50%, transparent, rgba(99,102,241,0.08), transparent, rgba(34,211,238,0.08), transparent)",
		    "blendMode": "overlay",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'prism-aurora-glass',
		name: 'Aurora Glass',
		category: 'prism',
		mood: 'cool',
		dark: true,
		baseColor: '#040708',
		textColor: '#e2fff8',
		description: 'Boreal cyan, emerald and violet refracted through translucent glass',
		layers: [
		  {
		    "layer": 1,
		    "background": "conic-gradient(from 210deg at 50% 50%, #10b981, #06b6d4, #67e8f9, #8b5cf6, #22c55e, #10b981)",
		    "blendMode": "screen",
		    "blurMobile": 145,
		    "blurDesktop": 209,
		    "opacity": 0.55
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(142deg, transparent 28%, rgba(255,255,255,0.10) 42%, rgba(103,232,249,0.16) 50%, rgba(52,211,153,0.12) 58%, transparent 74%)",
		    "blendMode": "screen",
		    "blurMobile": 60,
		    "blurDesktop": 86,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 50%, rgba(220,255,250,0.12) 0%, transparent 48%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 0.9
		  }
		]
	},
	{
		id: 'deep-cosmos',
		name: 'Deep Cosmos',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#0F0F12',
		textColor: '#ffffff',
		description: 'Deep purple abyss with stellar glows and distant twinkling stars',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(180deg, #0F0F12 0%, rgba(76, 29, 149, 0.5) 50%, rgba(109, 40, 217, 0.7) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse at 50% 115%, rgba(147, 51, 234, 0.55) 0%, rgba(109, 40, 217, 0.2) 60%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 100% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 12% 18%, rgba(255,255,255,0.8) 1px, transparent 3px), radial-gradient(circle at 78% 14%, rgba(250,232,255,0.9) 1.5px, transparent 4px), radial-gradient(circle at 88% 44%, rgba(255,255,255,0.7) 1px, transparent 3px), radial-gradient(circle at 18% 58%, rgba(233,213,255,1) 1.5px, transparent 4px), radial-gradient(circle at 6% 40%, rgba(255,255,255,0.6) 1px, transparent 3px), radial-gradient(circle at 68% 6%, rgba(250,232,255,0.8) 1px, transparent 3px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'starlit-abyss',
		name: 'Starlit Abyss',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#06060c',
		textColor: '#e0e4ff',
		description: 'Indigo void with a distant glow and scattered stars',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(180deg, #06060c 0%, rgba(30,27,75,0.5) 50%, rgba(49,46,129,0.6) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse at 50% 115%, rgba(79,70,229,0.55) 0%, rgba(49,46,129,0.15) 60%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 15% 20%, rgba(56,189,248,0.15) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 10% 15%, rgba(255,255,255,0.8) 1px, transparent 3px), radial-gradient(circle at 82% 10%, rgba(199,210,254,0.9) 1.5px, transparent 4px), radial-gradient(circle at 90% 48%, rgba(255,255,255,0.7) 1px, transparent 3px), radial-gradient(circle at 22% 62%, rgba(224,231,255,1) 1.5px, transparent 4px), radial-gradient(circle at 5% 45%, rgba(255,255,255,0.6) 1px, transparent 3px), radial-gradient(circle at 65% 8%, rgba(199,210,254,0.8) 1px, transparent 3px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'stardust-halo',
		name: 'Stardust Halo',
		category: 'nebula',
		mood: 'vivid',
		dark: true,
		baseColor: '#0a0612',
		textColor: '#ffe4f5',
		description: 'Magenta halo glowing through a field of distant stars',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(180deg, #0a0612 0%, rgba(76,29,90,0.5) 50%, rgba(157,23,138,0.5) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse at 50% 110%, rgba(232,121,249,0.55) 0%, rgba(157,23,138,0.15) 60%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 80% 20%, rgba(244,114,182,0.2) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 1px, transparent 3px), radial-gradient(circle at 70% 12%, rgba(250,232,255,0.9) 1.5px, transparent 4px), radial-gradient(circle at 88% 55%, rgba(255,255,255,0.7) 1px, transparent 3px), radial-gradient(circle at 12% 60%, rgba(233,213,255,1) 1.5px, transparent 4px), radial-gradient(circle at 40% 8%, rgba(255,255,255,0.6) 1px, transparent 3px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'galactic-bloom',
		name: 'Galactic Bloom',
		category: 'nebula',
		mood: 'vivid',
		dark: true,
		baseColor: '#050810',
		textColor: '#d4fff2',
		description: 'Teal and magenta nebula clouds drifting through stellar dust',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 50% 45% at 30% 40%, rgba(20,184,166,0.7) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 50% at 68% 55%, rgba(232,121,249,0.6) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 50% 20%, rgba(99,102,241,0.4) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 14% 22%, rgba(255,255,255,0.8) 1px, transparent 3px), radial-gradient(circle at 76% 30%, rgba(209,250,229,0.9) 1.5px, transparent 4px), radial-gradient(circle at 85% 75%, rgba(255,255,255,0.7) 1px, transparent 3px), radial-gradient(circle at 25% 78%, rgba(250,232,255,1) 1.5px, transparent 4px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'orion-drift',
		name: 'Orion Drift',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#04070f',
		textColor: '#dbeeff',
		description: 'Cold blue-white glow beneath a dense star field',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 50% at 40% 45%, rgba(56,189,248,0.6) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 40% 45% at 65% 60%, rgba(255,255,255,0.35) 0%, transparent 60%)",
		    "blendMode": "soft-light",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 8% 12%, rgba(255,255,255,0.9) 1px, transparent 3px), radial-gradient(circle at 30% 8%, rgba(255,255,255,0.7) 1px, transparent 3px), radial-gradient(circle at 60% 15%, rgba(199,210,254,0.9) 1.5px, transparent 4px), radial-gradient(circle at 85% 22%, rgba(255,255,255,0.7) 1px, transparent 3px), radial-gradient(circle at 92% 60%, rgba(255,255,255,0.8) 1.5px, transparent 4px), radial-gradient(circle at 45% 75%, rgba(199,210,254,1) 1.5px, transparent 4px), radial-gradient(circle at 15% 68%, rgba(255,255,255,0.6) 1px, transparent 3px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-golden-dawn',
		name: 'Golden Dawn',
		category: 'nebula',
		mood: 'warm',
		dark: true,
		baseColor: '#0f0800',
		textColor: '#fff3cd',
		description: 'Solar flares condensing into molten gold spheres',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 45% 50% at 30% 40%, rgba(251,191,36,0.85) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 40% at 70% 35%, rgba(234,179,8,0.7) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 50% 75%, rgba(217,119,6,0.5) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 25% at 80% 70%, rgba(180,83,9,0.35) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-arctic-ice',
		name: 'Arctic Ice',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#020a0f',
		textColor: '#cffafe',
		description: 'Frozen nitrogen crystals orbiting a distant white dwarf',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 40% 45% at 25% 35%, rgba(34,211,238,0.8) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 40% at 65% 55%, rgba(6,182,212,0.6) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 25% 30% at 75% 25%, rgba(165,243,252,0.4) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 22% at 45% 80%, rgba(103,232,249,0.3) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-witch-brew',
		name: 'Witch\'s Brew',
		category: 'nebula',
		mood: 'vivid',
		dark: true,
		baseColor: '#050a00',
		textColor: '#bef264',
		description: 'Toxic green bubbles rising from a cauldron of stars',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 42% 48% at 35% 40%, rgba(132,204,22,0.85) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 38% 42% at 70% 50%, rgba(101,163,13,0.7) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 28% 32% at 55% 75%, rgba(163,230,53,0.5) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 18% 20% at 20% 25%, rgba(190,242,100,0.35) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-blood-moon',
		name: 'Blood Moon',
		category: 'nebula',
		mood: 'dark',
		dark: true,
		baseColor: '#0a0000',
		textColor: '#fecaca',
		description: 'Crimson lunar eclipses casting long shadows through dust',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 48% 52% at 40% 45%, rgba(220,38,38,0.9) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 40% at 70% 35%, rgba(153,27,27,0.7) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 25% 70%, rgba(239,68,68,0.5) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 22% 25% at 60% 80%, rgba(185,28,28,0.4) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-peach-velvet',
		name: 'Peach Velvet',
		category: 'nebula',
		mood: 'warm',
		dark: false,
		baseColor: '#fff7ed',
		textColor: '#9a3412',
		description: 'Soft peach fuzz orbs floating in cream',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 45% 50% at 30% 40%, rgba(251,146,60,0.6) 0%, transparent 60%)",
		    "blendMode": "normal",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 40% at 70% 35%, rgba(253,186,116,0.5) 0%, transparent 55%)",
		    "blendMode": "normal",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 50% 75%, rgba(249,115,22,0.35) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 22% at 80% 65%, rgba(255,237,213,0.5) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-cobalt-dream',
		name: 'Cobalt Dream',
		category: 'nebula',
		mood: 'cool',
		dark: true,
		baseColor: '#020617',
		textColor: '#bfdbfe',
		description: 'Deep blue orbs suspended in midnight ink',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 42% 48% at 30% 40%, rgba(37,99,235,0.85) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 38% 42% at 70% 50%, rgba(29,78,216,0.7) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 28% 32% at 55% 75%, rgba(59,130,246,0.5) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 18% 20% at 20% 25%, rgba(96,165,250,0.3) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-sunset-orchid',
		name: 'Sunset Orchid',
		category: 'nebula',
		mood: 'vivid',
		dark: true,
		baseColor: '#0a0210',
		textColor: '#fce7f3',
		description: 'Purple and tangerine orbs colliding at the horizon',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 45% 50% at 35% 40%, rgba(168,85,247,0.85) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 40% at 70% 35%, rgba(251,146,60,0.7) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 50% 75%, rgba(192,132,252,0.5) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 25% at 80% 70%, rgba(234,179,8,0.35) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-smoke-signal',
		name: 'Smoke Signal',
		category: 'nebula',
		mood: 'dark',
		dark: true,
		baseColor: '#0a0a0a',
		textColor: '#e5e7eb',
		description: 'Gray smoke rings drifting from an extinguished star',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 45% 50% at 35% 40%, rgba(75,85,99,0.6) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 38% 42% at 70% 50%, rgba(55,65,81,0.5) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 28% 32% at 55% 75%, rgba(107,114,128,0.35) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 63,
		    "blurDesktop": 90,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 22% at 20% 25%, rgba(156,163,175,0.25) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 38,
		    "blurDesktop": 54,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-coral-reef',
		name: 'Coral Reef',
		category: 'nebula',
		mood: 'vivid',
		dark: true,
		baseColor: '#0a0400',
		textColor: '#fed7aa',
		description: 'Living coral polyps glowing in abyssal currents',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 42% 48% at 30% 40%, rgba(249,115,22,0.8) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 36% 40% at 70% 50%, rgba(244,63,94,0.65) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 28% 32% at 50% 75%, rgba(251,146,60,0.45) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 18% 20% at 80% 30%, rgba(255,107,107,0.3) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-lavender-fields',
		name: 'Lavender Fields',
		category: 'nebula',
		mood: 'cool',
		dark: false,
		baseColor: '#faf5ff',
		textColor: '#581c87',
		description: 'Soft violet spheres blooming in twilight',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 45% 50% at 30% 40%, rgba(192,132,252,0.55) 0%, transparent 60%)",
		    "blendMode": "normal",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 40% at 70% 35%, rgba(168,85,247,0.45) 0%, transparent 55%)",
		    "blendMode": "normal",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 50% 75%, rgba(216,180,254,0.35) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 22% at 80% 65%, rgba(233,213,255,0.4) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-thunder-storm',
		name: 'Thunder Storm',
		category: 'nebula',
		mood: 'dark',
		dark: true,
		baseColor: '#050510',
		textColor: '#ddd6fe',
		description: 'Electric violet thunderheads rolling through void',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 48% 52% at 40% 45%, rgba(91,33,182,0.85) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 40% at 70% 35%, rgba(76,29,149,0.7) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 25% 70%, rgba(124,58,237,0.5) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 22% 25% at 60% 80%, rgba(139,92,246,0.35) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-midnight-rose',
		name: 'Midnight Rose',
		category: 'nebula',
		mood: 'dark',
		dark: true,
		baseColor: '#0a0005',
		textColor: '#fbcfe8',
		description: 'Deep burgundy petals unfurling in eternal darkness',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 42% 48% at 35% 40%, rgba(159,18,57,0.85) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 38% 42% at 70% 50%, rgba(190,18,60,0.7) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 28% 32% at 55% 75%, rgba(219,39,119,0.5) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 18% 20% at 20% 25%, rgba(244,114,182,0.3) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-sand-dunes',
		name: 'Sand Dunes',
		category: 'nebula',
		mood: 'warm',
		dark: false,
		baseColor: '#fefce8',
		textColor: '#713f12',
		description: 'Desert mirages of heated air bending starlight',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 45% 50% at 30% 40%, rgba(234,179,8,0.5) 0%, transparent 60%)",
		    "blendMode": "normal",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 40% at 70% 35%, rgba(202,138,4,0.4) 0%, transparent 55%)",
		    "blendMode": "normal",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 50% 75%, rgba(217,119,6,0.3) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 22% at 80% 65%, rgba(251,191,36,0.25) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-neon-sludge',
		name: 'Neon Sludge',
		category: 'nebula',
		mood: 'vivid',
		dark: true,
		baseColor: '#001a00',
		textColor: '#86efac',
		description: 'Toxic waste orbs glowing with unnatural intensity',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 42% 48% at 30% 40%, rgba(34,197,94,0.9) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 36% 40% at 70% 50%, rgba(22,163,74,0.75) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 28% 32% at 50% 75%, rgba(74,222,128,0.55) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 18% 20% at 80% 30%, rgba(134,239,172,0.35) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'nebula-champagne-bubbles',
		name: 'Champagne Bubbles',
		category: 'nebula',
		mood: 'warm',
		dark: false,
		baseColor: '#fffbeb',
		textColor: '#78350f',
		description: 'Effervescent gold spheres rising through crystal',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 40% 45% at 30% 40%, rgba(251,191,36,0.5) 0%, transparent 60%)",
		    "blendMode": "normal",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 38% at 65% 55%, rgba(253,224,71,0.4) 0%, transparent 55%)",
		    "blendMode": "normal",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 25% 28% at 75% 25%, rgba(234,179,8,0.35) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 22% at 45% 80%, rgba(254,240,138,0.4) 0%, transparent 45%)",
		    "blendMode": "normal",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'eclipse-bloom',
		name: 'Eclipse Bloom',
		category: 'aura',
		mood: 'cool',
		dark: true,
		baseColor: '#050707',
		textColor: '#c7e9e7',
		description: 'A dim cyan bloom emerging from behind a dark eclipse',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(34% 34% at 68% 38%, rgba(55,122,119,0.34) 0%, rgba(28,75,74,0.20) 42%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(22% 22% at 68% 38%, rgba(82,153,148,0.18) 0%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 50,
		    "blurDesktop": 72,
		    "opacity": 0.8
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(18% 18% at 52% 48%, #020303 0%, #020303 62%, transparent 64%)",
		    "blendMode": "multiply",
		    "blurMobile": 10,
		    "blurDesktop": 14,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'tideglass',
		name: 'Tideglass',
		category: 'aura',
		mood: 'cool',
		dark: true,
		baseColor: '#040808',
		textColor: '#c8eceb',
		description: 'A translucent cyan tide bending across deep black',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(90% 22% at 50% 56%, rgba(28,103,101,0.34) 0%, rgba(18,65,64,0.18) 38%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 115,
		    "blurDesktop": 166,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(172deg, transparent 35%, rgba(53,142,137,0.20) 46%, rgba(29,89,87,0.28) 53%, transparent 66%)",
		    "blendMode": "screen",
		    "blurMobile": 105,
		    "blurDesktop": 151,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(8deg, transparent 38%, rgba(67,153,147,0.10) 49%, transparent 60%)",
		    "blendMode": "soft-light",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'nightfall',
		name: 'Nightfall',
		category: 'aura',
		mood: 'cool',
		dark: true,
		baseColor: '#05070a',
		textColor: '#c8d9e8',
		description: 'Cold blue atmosphere descending from the upper edge',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(85% 55% at 52% 0%, rgba(35,70,105,0.34) 0%, rgba(24,49,74,0.18) 38%, transparent 76%)",
		    "blendMode": "screen",
		    "blurMobile": 25,
		    "blurDesktop": 36,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(180deg, rgba(54,88,120,0.16) 0%, transparent 45%, rgba(0,0,0,0.18) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 25,
		    "blurDesktop": 36,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(42% 35% at 78% 16%, rgba(96,130,155,0.16) 0%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 25,
		    "blurDesktop": 36,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'deep-current',
		name: 'Deep Current',
		category: 'aura',
		mood: 'cool',
		dark: true,
		baseColor: '#030707',
		textColor: '#c4e7e5',
		description: 'A submerged current moving horizontally through darkness',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(90deg, transparent 0%, rgba(16,58,58,0.12) 24%, rgba(24,105,103,0.34) 52%, rgba(18,74,73,0.18) 72%, transparent 100%)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(70% 28% at 54% 62%, rgba(34,124,120,0.28) 0%, rgba(20,68,67,0.13) 48%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 120,
		    "blurDesktop": 173,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(90deg, transparent 30%, rgba(75,158,153,0.08) 52%, transparent 72%)",
		    "blendMode": "overlay",
		    "blurMobile": 60,
		    "blurDesktop": 86,
		    "opacity": 0.7
		  }
		]
	},
	{
		id: 'smokeveil',
		name: 'Smokeveil',
		category: 'aura',
		mood: 'cool',
		dark: true,
		baseColor: '#050706',
		textColor: '#c8e2df',
		description: 'A translucent veil of blue-green smoke crossing the frame',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(155deg, transparent 8%, rgba(30,75,68,0.12) 28%, rgba(45,112,99,0.25) 43%, rgba(23,65,59,0.18) 59%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(70% 42% at 45% 50%, rgba(40,111,99,0.25) 0%, rgba(20,61,55,0.12) 48%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(25deg, transparent 25%, rgba(90,151,135,0.07) 50%, transparent 75%)",
		    "blendMode": "soft-light",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'copper-shadow',
		name: 'Copper Shadow',
		category: 'aura',
		mood: 'warm',
		dark: true,
		baseColor: '#0a0705',
		textColor: '#ead8c8',
		description: 'Muted copper light slipping beneath a black veil',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(58% 62% at 72% 64%, rgba(127,72,39,0.32) 0%, rgba(74,43,26,0.16) 42%, transparent 80%)",
		    "blendMode": "screen",
		    "blurMobile": 145,
		    "blurDesktop": 209,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(135deg, transparent 35%, rgba(160,91,45,0.20) 52%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 0.8
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(28% 30% at 84% 22%, rgba(194,119,69,0.13) 0%, transparent 78%)",
		    "blendMode": "soft-light",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'greenflare',
		name: 'Greenflare',
		category: 'aura',
		mood: 'vivid',
		dark: true,
		baseColor: '#040704',
		textColor: '#d4edda',
		description: 'A concentrated emerald flare dissolving into black',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(24% 42% at 72% 48%, rgba(48,145,76,0.38) 0%, rgba(28,83,48,0.18) 42%, transparent 82%)",
		    "blendMode": "screen",
		    "blurMobile": 105,
		    "blurDesktop": 151,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(112deg, transparent 38%, rgba(47,132,74,0.18) 50%, transparent 64%)",
		    "blendMode": "screen",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(45% 70% at 20% 52%, rgba(24,70,38,0.14) 0%, transparent 80%)",
		    "blendMode": "soft-light",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 0.8
		  }
		]
	},
	{
		id: 'sage-phantom',
		name: 'Sage Phantom',
		category: 'aura',
		mood: 'dark',
		dark: true,
		baseColor: '#050708',
		textColor: '#a4b5b0',
		description: 'Asymmetrical soft sage glow emerging from the bottom right',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 80% 80% at 85% 85%, rgba(135, 165, 155, 0.35) 0%, rgba(80, 110, 105, 0.15) 40%, rgba(0, 0, 0, 0) 70%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 70% 50% at 65% 75%, rgba(135, 165, 155, 0.12) 0%, rgba(0, 0, 0, 0) 60%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'abyssal-floor',
		name: 'Abyssal Floor',
		category: 'aura',
		mood: 'dark',
		dark: true,
		baseColor: '#000000',
		textColor: '#00e5ff',
		description: 'Deep cyan glow rising exclusively from the absolute black floor',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 120% 70% at 50% 110%, rgba(0, 90, 110, 0.8) 0%, rgba(0, 45, 60, 0.5) 40%, rgba(0, 0, 0, 0) 75%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(to top, rgba(0, 130, 150, 0.25) 0%, rgba(0, 0, 0, 0) 35%)",
		    "blendMode": "screen",
		    "blurMobile": 50,
		    "blurDesktop": 72,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-midnight-film',
		name: 'Midnight Film',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#0f0a1e',
		textColor: '#c7d2fe',
		description: 'Deep indigo with analog film grain',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 60% 40%, rgba(129,140,248,0.3) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-warm-velvet',
		name: 'Warm Velvet',
		category: 'grain',
		mood: 'warm',
		dark: true,
		baseColor: '#1a0505',
		textColor: '#fecdd3',
		description: 'Rich burgundy with soft texture',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, #450a0a 0%, #7f1d1d 35%, #991b1b 60%, #b91c1c 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 40% 50%, rgba(252,165,165,0.2) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-desert-sand',
		name: 'Desert Sand',
		category: 'grain',
		mood: 'warm',
		dark: false,
		baseColor: '#fefce8',
		textColor: '#78350f',
		description: 'Warm beige with gritty film texture',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(155deg, #fef9c3 0%, #fde68a 40%, #fcd34d 70%, #fbbf24 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 40%, rgba(245,158,11,0.2) 0%, transparent 55%)",
		    "blendMode": "soft-light",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-forest-mist',
		name: 'Forest Mist',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#022c22',
		textColor: '#d1fae5',
		description: 'Emerald depth with organic noise',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(140deg, #022c22 0%, #064e3b 35%, #065f46 60%, #047857 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 55% 45%, rgba(52,211,153,0.25) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-concrete',
		name: 'Concrete Grain',
		category: 'grain',
		mood: 'cool',
		dark: false,
		baseColor: '#f4f4f5',
		textColor: '#3f3f46',
		description: 'Cool concrete gray with fine analog texture',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(150deg, #e4e4e7 0%, #d4d4d8 40%, #a1a1aa 70%, #71717a 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 40%, rgba(113,113,122,0.2) 0%, transparent 55%)",
		    "blendMode": "soft-light",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-cosmic-ash',
		name: 'Cosmic Ash',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#0d0b16',
		textColor: '#d6d0f0',
		description: 'Charcoal and indigo grain over a subtle violet undertone',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(140deg, #0d0b16 0%, #1e1b32 40%, #312e4d 70%, #433f68 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 55% 40%, rgba(129,140,248,0.25) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-obsidian',
		name: 'Obsidian',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#050505',
		textColor: '#d4d4d8',
		description: 'Black volcanic depth with subtle graphite texture',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, #030303 0%, #111111 42%, #1c1c1c 72%, #090909 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 55% at 68% 38%, rgba(161,161,170,0.16) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 13,
		    "blurDesktop": 18,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-ocean-depth',
		name: 'Ocean Depth',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#020b12',
		textColor: '#c7f9ff',
		description: 'Deep marine blue with soft underwater illumination',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, #020b12 0%, #073047 38%, #075985 68%, #0e7490 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 55% 40% at 58% 38%, rgba(34,211,238,0.24) 0%, rgba(14,116,144,0.10) 48%, transparent 75%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-moss',
		name: 'Moss',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#11150d',
		textColor: '#d9f2c7',
		description: 'Muted moss green with earthy photographic texture',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(150deg, #11150d 0%, #283618 40%, #3f6212 68%, #4d7c0f 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 48% 42% at 42% 46%, rgba(163,230,53,0.18) 0%, rgba(101,163,13,0.08) 48%, transparent 75%)",
		    "blendMode": "screen",
		    "blurMobile": 120,
		    "blurDesktop": 173,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-smoked-lilac',
		name: 'Smoked Lilac',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#100c16',
		textColor: '#e9d5ff',
		description: 'Dusty violet softened by a smoky analog texture',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(140deg, #100c16 0%, #24162e 38%, #4c1d62 68%, #6b3578 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 50% 45% at 62% 40%, rgba(216,180,254,0.20) 0%, rgba(168,85,247,0.08) 48%, transparent 75%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-arctic-paper',
		name: 'Arctic Paper',
		category: 'grain',
		mood: 'cool',
		dark: false,
		baseColor: '#f8fafc',
		textColor: '#334155',
		description: 'Cold white surface with a delicate icy texture',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, #f8fafc 0%, #e0f2fe 38%, #bae6fd 68%, #dbeafe 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 50% 40% at 35% 42%, rgba(125,211,252,0.22) 0%, transparent 60%)",
		    "blendMode": "soft-light",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-terracotta',
		name: 'Terracotta',
		category: 'grain',
		mood: 'warm',
		dark: false,
		baseColor: '#fff7ed',
		textColor: '#7c2d12',
		description: 'Burnt clay with warm tactile grain',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, #fed7aa 0%, #f97316 38%, #c2410c 68%, #9a3412 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 48% 42% at 40% 45%, rgba(255,237,213,0.22) 0%, transparent 60%)",
		    "blendMode": "soft-light",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-olive-film',
		name: 'Olive Film',
		category: 'grain',
		mood: 'warm',
		dark: true,
		baseColor: '#15160b',
		textColor: '#e7e5b5',
		description: 'Muted olive tones inspired by vintage photography',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, #15160b 0%, #3f4220 40%, #686b2a 70%, #85852f 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 55% 45% at 48% 42%, rgba(217,219,121,0.16) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 120,
		    "blurDesktop": 173,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-carbon-blue',
		name: 'Carbon Blue',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#05070c',
		textColor: '#bfdbfe',
		description: 'Charcoal black transitioning into restrained cobalt blue',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(138deg, #05070c 0%, #0f172a 40%, #172554 70%, #1e3a8a 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 50% at 72% 40%, rgba(96,165,250,0.20) 0%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 105,
		    "blurDesktop": 151,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-champagne',
		name: 'Champagne',
		category: 'grain',
		mood: 'warm',
		dark: false,
		baseColor: '#fffbeb',
		textColor: '#713f12',
		description: 'Soft champagne surface with understated luxury texture',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, #fffbeb 0%, #fef3c7 38%, #fde68a 68%, #fcd34d 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 55% 40% at 55% 38%, rgba(255,255,255,0.42) 0%, transparent 65%)",
		    "blendMode": "soft-light",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-rainforest',
		name: 'Rainforest',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#02100c',
		textColor: '#ccfbf1',
		description: 'Dense tropical green with humid atmospheric texture',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(142deg, #02100c 0%, #064e3b 35%, #047857 62%, #059669 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 50% 55% at 65% 38%, rgba(45,212,191,0.20) 0%, rgba(16,185,129,0.08) 50%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 120,
		    "blurDesktop": 173,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-dusty-rose',
		name: 'Dusty Rose',
		category: 'grain',
		mood: 'warm',
		dark: false,
		baseColor: '#fff1f2',
		textColor: '#881337',
		description: 'Muted rose gradient with soft vintage film character',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, #ffe4e6 0%, #fda4af 38%, #fb7185 68%, #e11d48 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 48% 45% at 40% 42%, rgba(255,255,255,0.25) 0%, transparent 62%)",
		    "blendMode": "soft-light",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-frosted-slate',
		name: 'Frosted Slate',
		category: 'grain',
		mood: 'cool',
		dark: false,
		baseColor: '#f1f5f9',
		textColor: '#334155',
		description: 'Desaturated blue-gray with soft frosted texture',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, #e2e8f0 0%, #cbd5e1 38%, #94a3b8 68%, #64748b 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 50% 42% at 58% 40%, rgba(226,232,240,0.30) 0%, transparent 62%)",
		    "blendMode": "soft-light",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-burnt-paper',
		name: 'Burnt Paper',
		category: 'grain',
		mood: 'warm',
		dark: true,
		baseColor: '#17100b',
		textColor: '#fed7aa',
		description: 'Aged parchment fading into warm charcoal',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(140deg, #29150b 0%, #78350f 38%, #a16207 66%, #d97706 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 50% 45% at 45% 40%, rgba(254,215,170,0.16) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-indigo-haze',
		name: 'Indigo Haze',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#080914',
		textColor: '#c7d2fe',
		description: 'Soft midnight indigo with a hazy luminous center',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, #080914 0%, #171853 38%, #312e81 68%, #4338ca 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 55% 45% at 52% 45%, rgba(165,180,252,0.20) 0%, rgba(99,102,241,0.08) 50%, transparent 76%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-smoke',
		name: 'Smoke',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#080808',
		textColor: '#e4e4e7',
		description: 'Neutral graphite gradient with dense atmospheric grain',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, #050505 0%, #18181b 42%, #27272a 68%, #3f3f46 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 58% 50% at 48% 44%, rgba(228,228,231,0.12) 0%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 130,
		    "blurDesktop": 187,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-copper-patina',
		name: 'Copper Patina',
		category: 'grain',
		mood: 'warm',
		dark: true,
		baseColor: '#0c100e',
		textColor: '#d5f5ef',
		description: 'Aged copper transitioning into muted turquoise patina',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, #431407 0%, #9a3412 32%, #0f766e 68%, #115e59 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 50% 45% at 68% 42%, rgba(94,234,212,0.20) 0%, rgba(20,184,166,0.08) 50%, transparent 76%)",
		    "blendMode": "screen",
		    "blurMobile": 120,
		    "blurDesktop": 173,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'grain-lunar-surface',
		name: 'Lunar Surface',
		category: 'grain',
		mood: 'cool',
		dark: true,
		baseColor: '#0c0d0f',
		textColor: '#e5e7eb',
		description: 'Cold lunar gray with subtle mineral depth',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(150deg, #090a0c 0%, #27272a 40%, #52525b 68%, #71717a 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 50% at 60% 38%, rgba(212,212,216,0.18) 0%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-arctic-frost',
		name: 'Arctic Frost',
		category: 'glass',
		mood: 'cool',
		dark: false,
		baseColor: '#ecfeff',
		textColor: '#164e63',
		description: 'Frosted glass with blue-cyan refraction',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(207,250,254,0.9) 0%, rgba(165,243,252,0.4) 50%, rgba(34,211,238,0.3) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 30% 30%, rgba(6,182,212,0.5) 0%, transparent 40%)",
		    "blendMode": "overlay",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 70% 70%, rgba(14,165,233,0.4) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(45deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.4) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 50,
		    "blurDesktop": 72,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-obsidian',
		name: 'Obsidian Glass',
		category: 'glass',
		mood: 'cool',
		dark: true,
		baseColor: '#0c0a12',
		textColor: '#ddd6fe',
		description: 'Dark frosted glass with violet refractions',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(15,10,25,0.95) 0%, rgba(30,20,50,0.8) 50%, rgba(50,30,80,0.6) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 25% 35%, rgba(139,92,246,0.4) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 75% 65%, rgba(99,102,241,0.3) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(45deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.03) 100%)",
		    "blendMode": "overlay",
		    "blurMobile": 25,
		    "blurDesktop": 36,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-rose-window',
		name: 'Rose Window',
		category: 'glass',
		mood: 'warm',
		dark: false,
		baseColor: '#fff1f2',
		textColor: '#881337',
		description: 'Stained glass with rose and amber refractions',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(255,228,230,0.9) 0%, rgba(254,205,211,0.5) 50%, rgba(252,165,165,0.3) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 35% 40%, rgba(244,63,94,0.4) 0%, transparent 35%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 65% 55%, rgba(251,146,60,0.35) 0%, transparent 30%)",
		    "blendMode": "overlay",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.3) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 38,
		    "blurDesktop": 54,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-emerald-lens',
		name: 'Emerald Lens',
		category: 'glass',
		mood: 'cool',
		dark: true,
		baseColor: '#022c22',
		textColor: '#a7f3d0',
		description: 'Green frosted glass with teal light beams',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(2,44,34,0.95) 0%, rgba(6,78,59,0.7) 50%, rgba(4,120,87,0.5) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 40% 30%, rgba(16,185,129,0.5) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 60% 70%, rgba(52,211,153,0.35) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(45deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.02) 100%)",
		    "blendMode": "overlay",
		    "blurMobile": 25,
		    "blurDesktop": 36,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-smoked',
		name: 'Smoked Glass',
		category: 'glass',
		mood: 'cool',
		dark: true,
		baseColor: '#0c0c0d',
		textColor: '#d4d4d8',
		description: 'Dark smoked glass with graphite refractions',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(15,15,17,0.95) 0%, rgba(39,39,42,0.8) 50%, rgba(63,63,70,0.55) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 30% 35%, rgba(113,113,122,0.35) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 72% 65%, rgba(161,161,170,0.25) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(45deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.03) 100%)",
		    "blendMode": "overlay",
		    "blurMobile": 25,
		    "blurDesktop": 36,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-starlight',
		name: 'Starlight Glass',
		category: 'glass',
		mood: 'cool',
		dark: true,
		baseColor: '#0a0918',
		textColor: '#dcd6ff',
		description: 'Dark frosted blue-violet glass with embedded starlight',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(10,9,24,0.95) 0%, rgba(30,27,75,0.75) 50%, rgba(49,46,129,0.5) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.4) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 70% 70%, rgba(129,140,248,0.3) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 1px, transparent 3px), radial-gradient(circle at 78% 25%, rgba(255,255,255,0.5) 1px, transparent 3px), radial-gradient(circle at 55% 80%, rgba(255,255,255,0.5) 1px, transparent 3px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.7
		  }
		]
	},
	{
		id: 'glass-liquid-cyan',
		name: 'Liquid Cyan',
		category: 'glass',
		mood: 'cool',
		dark: true,
		baseColor: '#02080b',
		textColor: '#cffafe',
		description: 'Translucent cyan glass flowing like liquid crystal',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(8,47,73,0.82) 0%, rgba(14,116,144,0.48) 48%, rgba(34,211,238,0.30) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 55% 42% at 28% 42%, rgba(34,211,238,0.42) 0%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 120,
		    "blurDesktop": 173,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 45% 55% at 72% 58%, rgba(103,232,249,0.30) 0%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 48%, rgba(255,255,255,0.04) 58%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 45,
		    "blurDesktop": 65,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-boreal',
		name: 'Boreal Glass',
		category: 'glass',
		mood: 'cool',
		dark: true,
		baseColor: '#020807',
		textColor: '#dcfff6',
		description: 'Frosted glass infused with emerald and cyan northern light',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, rgba(2,44,34,0.92) 0%, rgba(6,78,59,0.62) 48%, rgba(8,145,178,0.34) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(145deg, transparent 24%, rgba(52,211,153,0.24) 40%, rgba(103,232,249,0.28) 51%, rgba(16,185,129,0.16) 62%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 65% 22% at 50% 52%, rgba(167,243,208,0.18) 0%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(45deg, rgba(255,255,255,0.10) 0%, transparent 42%, rgba(207,250,254,0.08) 65%, transparent 100%)",
		    "blendMode": "overlay",
		    "blurMobile": 35,
		    "blurDesktop": 50,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-prism-window',
		name: 'Prism Window',
		category: 'glass',
		mood: 'vivid',
		dark: true,
		baseColor: '#06070b',
		textColor: '#f5f3ff',
		description: 'Transparent glass scattering subtle rainbow refractions',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(30,41,59,0.85) 0%, rgba(51,65,85,0.55) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(115deg, transparent 24%, rgba(34,211,238,0.18) 34%, rgba(59,130,246,0.18) 42%, rgba(139,92,246,0.20) 50%, rgba(236,72,153,0.15) 58%, rgba(245,158,11,0.12) 66%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(125deg, transparent 40%, rgba(255,255,255,0.22) 49%, transparent 58%)",
		    "blendMode": "screen",
		    "blurMobile": 30,
		    "blurDesktop": 43,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 68% 32%, rgba(255,255,255,0.12) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-ice-sheet',
		name: 'Ice Sheet',
		category: 'glass',
		mood: 'cool',
		dark: false,
		baseColor: '#f0f9ff',
		textColor: '#164e63',
		description: 'Layered translucent ice with frozen cyan fractures',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(224,242,254,0.95) 0%, rgba(186,230,253,0.62) 50%, rgba(125,211,252,0.38) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(115deg, transparent 20%, rgba(6,182,212,0.18) 38%, transparent 42%, rgba(56,189,248,0.22) 62%, transparent 76%)",
		    "blendMode": "overlay",
		    "blurMobile": 45,
		    "blurDesktop": 65,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 45% 55% at 25% 35%, rgba(255,255,255,0.60) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(35deg, rgba(255,255,255,0.55), transparent 35%, rgba(255,255,255,0.25) 65%, transparent)",
		    "blendMode": "soft-light",
		    "blurMobile": 38,
		    "blurDesktop": 54,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-violet-smoke',
		name: 'Violet Smoke',
		category: 'glass',
		mood: 'vivid',
		dark: true,
		baseColor: '#08050f',
		textColor: '#ede9fe',
		description: 'Dark translucent violet glass surrounded by soft atmospheric haze',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(140deg, rgba(15,10,25,0.94) 0%, rgba(49,27,84,0.68) 52%, rgba(91,33,182,0.32) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 52% 48% at 30% 40%, rgba(139,92,246,0.42) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 120,
		    "blurDesktop": 173,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 42% 55% at 70% 62%, rgba(217,70,239,0.28) 0%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(125deg, transparent 25%, rgba(255,255,255,0.08) 48%, transparent 68%)",
		    "blendMode": "overlay",
		    "blurMobile": 40,
		    "blurDesktop": 58,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-amber-crystal',
		name: 'Amber Crystal',
		category: 'glass',
		mood: 'warm',
		dark: true,
		baseColor: '#0b0602',
		textColor: '#fef3c7',
		description: 'Warm translucent crystal with golden internal reflections',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(69,26,3,0.92) 0%, rgba(146,64,14,0.62) 48%, rgba(245,158,11,0.32) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 50% 45% at 30% 42%, rgba(251,191,36,0.38) 0%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 40% 55% at 70% 60%, rgba(249,115,22,0.30) 0%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 130,
		    "blurDesktop": 187,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.16) 48%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 40,
		    "blurDesktop": 58,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-aqua-bubble',
		name: 'Aqua Bubble',
		category: 'glass',
		mood: 'cool',
		dark: false,
		baseColor: '#ecfeff',
		textColor: '#155e75',
		description: 'Soft translucent bubbles suspended in an aquatic glass surface',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle at 25% 40%, rgba(34,211,238,0.34) 0%, rgba(103,232,249,0.12) 32%, transparent 55%), radial-gradient(circle at 72% 58%, rgba(14,165,233,0.28) 0%, rgba(125,211,252,0.10) 34%, transparent 58%)",
		    "blendMode": "normal",
		    "blurMobile": 63,
		    "blurDesktop": 90,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 25% 40%, rgba(255,255,255,0.65) 0%, transparent 12%)",
		    "blendMode": "screen",
		    "blurMobile": 30,
		    "blurDesktop": 43,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 72% 58%, rgba(255,255,255,0.55) 0%, transparent 13%)",
		    "blendMode": "screen",
		    "blurMobile": 35,
		    "blurDesktop": 50,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(135deg, rgba(255,255,255,0.42) 0%, transparent 45%, rgba(6,182,212,0.12) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 50,
		    "blurDesktop": 72,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-carbon',
		name: 'Carbon Glass',
		category: 'glass',
		mood: 'cool',
		dark: true,
		baseColor: '#050506',
		textColor: '#e4e4e7',
		description: 'Nearly black glass with restrained graphite reflections',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, rgba(9,9,11,0.98) 0%, rgba(39,39,42,0.72) 48%, rgba(24,24,27,0.88) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.07) 43%, rgba(161,161,170,0.12) 50%, transparent 67%)",
		    "blendMode": "screen",
		    "blurMobile": 55,
		    "blurDesktop": 79,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 42% 35% at 70% 30%, rgba(212,212,216,0.14) 0%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-deep-sea',
		name: 'Deep Sea Glass',
		category: 'glass',
		mood: 'cool',
		dark: true,
		baseColor: '#02100f',
		textColor: '#ccfbf1',
		description: 'Dense blue-green glass with submerged light refractions',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, rgba(2,44,34,0.96) 0%, rgba(8,47,73,0.74) 48%, rgba(14,116,144,0.42) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 52% 48% at 28% 52%, rgba(20,184,166,0.34) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 120,
		    "blurDesktop": 173,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 45% 55% at 72% 35%, rgba(34,211,238,0.28) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(150deg, transparent 30%, rgba(167,243,208,0.10) 48%, rgba(103,232,249,0.12) 56%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 60,
		    "blurDesktop": 86,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-champagne',
		name: 'Champagne Glass',
		category: 'glass',
		mood: 'warm',
		dark: false,
		baseColor: '#fffbeb',
		textColor: '#713f12',
		description: 'Soft golden translucent glass with luxurious highlights',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(255,251,235,0.95) 0%, rgba(254,243,199,0.62) 50%, rgba(253,230,138,0.34) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 50% 45% at 32% 42%, rgba(251,191,36,0.26) 0%, transparent 68%)",
		    "blendMode": "overlay",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 42% 50% at 72% 60%, rgba(245,158,11,0.20) 0%, transparent 70%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(120deg, rgba(255,255,255,0.65), transparent 42%, rgba(255,255,255,0.30) 72%)",
		    "blendMode": "soft-light",
		    "blurMobile": 45,
		    "blurDesktop": 65,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-neon-refraction',
		name: 'Neon Refraction',
		category: 'glass',
		mood: 'vivid',
		dark: true,
		baseColor: '#05050a',
		textColor: '#f0f9ff',
		description: 'Dark frosted glass splitting cyan, violet and pink neon light',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,27,75,0.72) 50%, rgba(76,29,149,0.36) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(112deg, transparent 20%, rgba(34,211,238,0.20) 34%, rgba(59,130,246,0.18) 43%, rgba(139,92,246,0.24) 52%, rgba(236,72,153,0.18) 62%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 40% 55% at 72% 38%, rgba(217,70,239,0.22) 0%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 130,
		    "blurDesktop": 187,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(45deg, transparent 32%, rgba(255,255,255,0.12) 48%, transparent 62%)",
		    "blendMode": "screen",
		    "blurMobile": 33,
		    "blurDesktop": 47,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-frosted-mint',
		name: 'Frosted Mint',
		category: 'glass',
		mood: 'cool',
		dark: false,
		baseColor: '#f0fdf4',
		textColor: '#065f46',
		description: 'Pale mint glass with a soft frozen atmospheric glow',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(236,253,245,0.96) 0%, rgba(167,243,208,0.58) 50%, rgba(110,231,183,0.30) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 50% 45% at 30% 40%, rgba(52,211,153,0.26) 0%, transparent 68%)",
		    "blendMode": "overlay",
		    "blurMobile": 130,
		    "blurDesktop": 187,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 45% 50% at 72% 60%, rgba(45,212,191,0.20) 0%, transparent 70%)",
		    "blendMode": "overlay",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(120deg, rgba(255,255,255,0.62) 0%, transparent 45%, rgba(255,255,255,0.32) 100%)",
		    "blendMode": "soft-light",
		    "blurMobile": 45,
		    "blurDesktop": 65,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-moonstone',
		name: 'Moonstone',
		category: 'glass',
		mood: 'cool',
		dark: true,
		baseColor: '#070b12',
		textColor: '#dbeafe',
		description: 'Smoky blue glass with a faint lunar iridescence',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(140deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.72) 50%, rgba(51,65,85,0.48) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 48% 42% at 30% 40%, rgba(125,211,252,0.25) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 130,
		    "blurDesktop": 187,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 42% 48% at 70% 62%, rgba(129,140,248,0.20) 0%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 145,
		    "blurDesktop": 209,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(120deg, transparent 28%, rgba(255,255,255,0.10) 48%, transparent 65%)",
		    "blendMode": "overlay",
		    "blurMobile": 38,
		    "blurDesktop": 54,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'glass-rain-window',
		name: 'Rain Window',
		category: 'glass',
		mood: 'cool',
		dark: true,
		baseColor: '#030712',
		textColor: '#dbeafe',
		description: 'Condensed blue glass with soft distorted light behind it',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(135deg, rgba(15,23,42,0.94) 0%, rgba(30,58,95,0.72) 50%, rgba(14,116,144,0.34) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 35% 60% at 25% 45%, rgba(56,189,248,0.30) 0%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 42% 45% at 72% 35%, rgba(129,140,248,0.22) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(80deg, transparent 20%, rgba(255,255,255,0.06) 22%, transparent 24%, transparent 45%, rgba(255,255,255,0.05) 47%, transparent 49%, transparent 72%, rgba(255,255,255,0.06) 74%, transparent 76%)",
		    "blendMode": "overlay",
		    "blurMobile": 25,
		    "blurDesktop": 36,
		    "opacity": 0.7
		  }
		]
	},
	{
		id: 'glass-solar',
		name: 'Solar Glass',
		category: 'glass',
		mood: 'warm',
		dark: true,
		baseColor: '#0c0502',
		textColor: '#fef3c7',
		description: 'Warm transparent glass glowing from an internal amber core',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(145deg, rgba(67,20,7,0.94) 0%, rgba(120,53,15,0.68) 50%, rgba(217,119,6,0.32) 100%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 52%, rgba(251,191,36,0.42) 0%, rgba(245,158,11,0.14) 38%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.18) 48%, rgba(255,255,255,0.04) 57%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 40,
		    "blurDesktop": 58,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-lava-lamp',
		name: 'Lava Lamp',
		category: 'flux',
		mood: 'warm',
		dark: true,
		baseColor: '#0a0202',
		textColor: '#fecaca',
		description: 'Organic red and orange blobs floating in dark space',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 40% at 30% 55%, rgba(239,68,68,0.9) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 40% 55% at 65% 35%, rgba(249,115,22,0.85) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 50% 75%, rgba(234,179,8,0.6) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 25% 20% at 80% 70%, rgba(239,68,68,0.5) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-jellyfish',
		name: 'Jellyfish',
		category: 'flux',
		mood: 'cool',
		dark: true,
		baseColor: '#020617',
		textColor: '#ccfbf1',
		description: 'Translucent cyan and violet organic shapes',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 50% 65% at 35% 45%, rgba(6,182,212,0.8) 0%, rgba(6,182,212,0.1) 50%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 35% at 60% 30%, rgba(139,92,246,0.7) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 35% 50% at 70% 65%, rgba(34,211,238,0.6) 0%, rgba(34,211,238,0.05) 50%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 63,
		    "blurDesktop": 90,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 20% 25% at 25% 70%, rgba(168,85,247,0.5) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 50,
		    "blurDesktop": 72,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-bubblegum',
		name: 'Bubblegum',
		category: 'flux',
		mood: 'vivid',
		dark: false,
		baseColor: '#fdf4ff',
		textColor: '#701a75',
		description: 'Playful pink, purple and mint blob composition',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 50% 45% at 25% 40%, rgba(236,72,153,0.65) 0%, transparent 65%)",
		    "blendMode": "normal",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 40% 50% at 70% 55%, rgba(168,85,247,0.55) 0%, transparent 60%)",
		    "blendMode": "normal",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 35% 40% at 50% 25%, rgba(52,211,153,0.45) 0%, transparent 55%)",
		    "blendMode": "normal",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 30% 30% at 80% 30%, rgba(244,114,182,0.4) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-oil-spill',
		name: 'Oil Spill',
		category: 'flux',
		mood: 'vivid',
		dark: true,
		baseColor: '#030712',
		textColor: '#e0e7ff',
		description: 'Iridescent dark blobs with rainbow reflections',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 60% 50% at 40% 50%, rgba(99,102,241,0.7) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 55% at 65% 40%, rgba(16,185,129,0.6) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 35% 40% at 30% 70%, rgba(236,72,153,0.5) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 25% 30% at 75% 75%, rgba(245,158,11,0.4) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  },
		  {
		    "layer": 5,
		    "background": "radial-gradient(ellipse 20% 25% at 55% 20%, rgba(6,182,212,0.35) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-cloud-nine',
		name: 'Cloud Nine',
		category: 'flux',
		mood: 'warm',
		dark: false,
		baseColor: '#fff7ed',
		textColor: '#9a3412',
		description: 'Soft peach and cream organic cloudscape',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 45% at 30% 50%, rgba(253,186,116,0.6) 0%, transparent 60%)",
		    "blendMode": "normal",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 55% at 65% 40%, rgba(251,146,60,0.45) 0%, transparent 55%)",
		    "blendMode": "normal",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 40% 35% at 50% 70%, rgba(254,215,170,0.5) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-graphite',
		name: 'Graphite Flow',
		category: 'flux',
		mood: 'cool',
		dark: true,
		baseColor: '#0a0a0b',
		textColor: '#d0d4d9',
		description: 'Slow graphite and slate blobs in dark space',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 45% at 35% 50%, rgba(100,116,139,0.6) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 40% 50% at 68% 38%, rgba(148,163,184,0.5) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 35% at 30% 72%, rgba(71,85,105,0.45) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 22% 25% at 78% 75%, rgba(203,213,225,0.3) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-nebula-flow',
		name: 'Nebula Flow',
		category: 'flux',
		mood: 'vivid',
		dark: true,
		baseColor: '#08050f',
		textColor: '#eae0ff',
		description: 'Organic magenta, teal and violet blobs drifting like nebula clouds',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 45% at 35% 45%, rgba(236,72,153,0.75) 0%, transparent 60%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 50% at 68% 40%, rgba(20,184,166,0.65) 0%, transparent 55%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 35% 40% at 50% 75%, rgba(139,92,246,0.55) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 22% 25% at 80% 75%, rgba(232,121,249,0.4) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-liquid-metal',
		name: 'Liquid Metal',
		category: 'flux',
		mood: 'cool',
		dark: true,
		baseColor: '#050608',
		textColor: '#e2e8f0',
		description: 'Molten silver forms flowing through a dark metallic void',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 42% at 30% 52%, rgba(203,213,225,0.62) 0%, rgba(100,116,139,0.28) 42%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 42% 58% at 68% 38%, rgba(148,163,184,0.58) 0%, rgba(71,85,105,0.22) 45%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 115,
		    "blurDesktop": 166,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 28% at 52% 70%, rgba(241,245,249,0.30) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-toxic-mist',
		name: 'Toxic Mist',
		category: 'flux',
		mood: 'vivid',
		dark: true,
		baseColor: '#020806',
		textColor: '#d9f99d',
		description: 'Acid green and electric cyan vapor twisting through darkness',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 50% 58% at 32% 48%, rgba(132,204,22,0.72) 0%, rgba(77,124,15,0.18) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 85,
		    "blurDesktop": 122,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 42% 48% at 68% 40%, rgba(34,211,238,0.62) 0%, rgba(8,145,178,0.14) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 105,
		    "blurDesktop": 151,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 28% 35% at 52% 72%, rgba(163,230,53,0.42) 0%, transparent 62%)",
		    "blendMode": "screen",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-velvet-liquid',
		name: 'Velvet Liquid',
		category: 'flux',
		mood: 'warm',
		dark: true,
		baseColor: '#0b040a',
		textColor: '#f5d0fe',
		description: 'Deep burgundy and plum shapes melting into one another',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 48% at 30% 52%, rgba(190,24,93,0.68) 0%, rgba(136,19,55,0.20) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 105,
		    "blurDesktop": 151,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 55% at 68% 38%, rgba(126,34,206,0.62) 0%, rgba(88,28,135,0.16) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 28% 32% at 52% 72%, rgba(244,114,182,0.38) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 85,
		    "blurDesktop": 122,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-aurora-fluid',
		name: 'Aurora Fluid',
		category: 'flux',
		mood: 'cool',
		dark: true,
		baseColor: '#020706',
		textColor: '#d9fff5',
		description: 'Liquid emerald and cyan forms inspired by northern lights',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 58% 32% at 32% 48%, rgba(16,185,129,0.72) 0%, rgba(5,120,87,0.20) 48%, transparent 74%)",
		    "blendMode": "screen",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 52% 36% at 67% 42%, rgba(34,211,238,0.62) 0%, rgba(8,145,178,0.16) 48%, transparent 74%)",
		    "blendMode": "screen",
		    "blurMobile": 110,
		    "blurDesktop": 158,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(145deg, transparent 30%, rgba(167,243,208,0.14) 46%, rgba(103,232,249,0.18) 53%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 30% 20% at 52% 62%, rgba(236,253,245,0.12) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 60,
		    "blurDesktop": 86,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-ink-bloom',
		name: 'Ink Bloom',
		category: 'flux',
		mood: 'vivid',
		dark: true,
		baseColor: '#030712',
		textColor: '#dbeafe',
		description: 'Pigment-like blue and violet ink blooming through water',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 48% 58% at 30% 42%, rgba(37,99,235,0.70) 0%, rgba(30,64,175,0.16) 50%, transparent 74%)",
		    "blendMode": "screen",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 42% 50% at 65% 55%, rgba(124,58,237,0.68) 0%, rgba(91,33,182,0.14) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 24% 40% at 50% 30%, rgba(96,165,250,0.38) 0%, transparent 68%)",
		    "blendMode": "screen",
		    "blurMobile": 70,
		    "blurDesktop": 101,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-cosmic-jelly',
		name: 'Cosmic Jelly',
		category: 'flux',
		mood: 'vivid',
		dark: true,
		baseColor: '#05020a',
		textColor: '#f5d0fe',
		description: 'Translucent magenta and cyan masses floating like alien jelly',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 48% 58% at 28% 48%, rgba(217,70,239,0.72) 0%, rgba(134,25,143,0.16) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 42% 55% at 68% 38%, rgba(34,211,238,0.68) 0%, rgba(8,145,178,0.15) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 25% 32% at 50% 72%, rgba(244,114,182,0.42) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-volcanic-glass',
		name: 'Volcanic Glass',
		category: 'flux',
		mood: 'warm',
		dark: true,
		baseColor: '#080403',
		textColor: '#fed7aa',
		description: 'Molten amber shapes trapped inside black volcanic glass',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 50% 42% at 32% 55%, rgba(234,88,12,0.72) 0%, rgba(124,45,18,0.18) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 42% 55% at 68% 38%, rgba(245,158,11,0.64) 0%, rgba(180,83,9,0.14) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 120,
		    "blurDesktop": 173,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 24% 28% at 52% 70%, rgba(254,240,138,0.40) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-deep-tide',
		name: 'Deep Tide',
		category: 'flux',
		mood: 'cool',
		dark: true,
		baseColor: '#02070a',
		textColor: '#cffafe',
		description: 'Slow-moving blue and teal masses inspired by deep ocean currents',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 62% 35% at 30% 58%, rgba(14,116,144,0.70) 0%, rgba(8,47,73,0.18) 48%, transparent 75%)",
		    "blendMode": "screen",
		    "blurMobile": 110,
		    "blurDesktop": 158,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 48% 50% at 70% 36%, rgba(20,184,166,0.58) 0%, rgba(15,118,110,0.14) 48%, transparent 74%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(150deg, transparent 32%, rgba(103,232,249,0.12) 48%, rgba(45,212,191,0.16) 55%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-electric-pulp',
		name: 'Electric Pulp',
		category: 'flux',
		mood: 'vivid',
		dark: true,
		baseColor: '#050608',
		textColor: '#ecfccb',
		description: 'High-energy lime, violet and cyan organic masses',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 48% 48% at 30% 45%, rgba(163,230,53,0.72) 0%, rgba(101,163,13,0.15) 50%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 85,
		    "blurDesktop": 122,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 42% 52% at 68% 42%, rgba(168,85,247,0.70) 0%, rgba(109,40,217,0.14) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 105,
		    "blurDesktop": 151,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 28% at 52% 70%, rgba(34,211,238,0.48) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-milk-tea',
		name: 'Milk Tea',
		category: 'flux',
		mood: 'warm',
		dark: false,
		baseColor: '#fffbeb',
		textColor: '#78350f',
		description: 'Creamy caramel and beige organic forms with a soft tactile feel',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 45% at 30% 50%, rgba(217,119,6,0.38) 0%, rgba(245,158,11,0.12) 48%, transparent 72%)",
		    "blendMode": "normal",
		    "blurMobile": 145,
		    "blurDesktop": 209,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 52% at 68% 40%, rgba(180,83,9,0.28) 0%, rgba(217,119,6,0.08) 50%, transparent 74%)",
		    "blendMode": "normal",
		    "blurMobile": 155,
		    "blurDesktop": 223,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 30% 28% at 50% 72%, rgba(255,255,255,0.62) 0%, transparent 68%)",
		    "blendMode": "soft-light",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-neon-plasma',
		name: 'Neon Plasma',
		category: 'flux',
		mood: 'vivid',
		dark: true,
		baseColor: '#05020a',
		textColor: '#f0f9ff',
		description: 'Electric blue and hot pink plasma colliding in organic forms',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 45% at 28% 48%, rgba(37,99,235,0.78) 0%, rgba(30,64,175,0.16) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 80,
		    "blurDesktop": 115,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 48% 55% at 70% 40%, rgba(236,72,153,0.72) 0%, rgba(190,24,93,0.14) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 24% 30% at 52% 65%, rgba(34,211,238,0.55) 0%, transparent 64%)",
		    "blendMode": "screen",
		    "blurMobile": 63,
		    "blurDesktop": 90,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 45,
		    "blurDesktop": 65,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-sage-smoke',
		name: 'Sage Smoke',
		category: 'flux',
		mood: 'cool',
		dark: false,
		baseColor: '#f5f7f0',
		textColor: '#365314',
		description: 'Muted sage and eucalyptus shapes drifting through pale air',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 48% at 30% 48%, rgba(132,204,22,0.34) 0%, rgba(101,163,13,0.08) 48%, transparent 72%)",
		    "blendMode": "normal",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 46% 52% at 68% 42%, rgba(45,212,191,0.28) 0%, rgba(20,184,166,0.06) 50%, transparent 74%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 32% 30% at 52% 70%, rgba(255,255,255,0.50) 0%, transparent 68%)",
		    "blendMode": "soft-light",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-solar-liquid',
		name: 'Solar Liquid',
		category: 'flux',
		mood: 'warm',
		dark: true,
		baseColor: '#0b0502',
		textColor: '#fef3c7',
		description: 'Golden and coral liquid forms glowing like a molten sun',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 52% 48% at 30% 50%, rgba(251,146,60,0.78) 0%, rgba(194,65,12,0.16) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 55% at 68% 38%, rgba(250,204,21,0.72) 0%, rgba(217,119,6,0.14) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 24% 28% at 52% 68%, rgba(255,247,237,0.42) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 65,
		    "blurDesktop": 94,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-boreal-pulse',
		name: 'Boreal Pulse',
		category: 'flux',
		mood: 'cool',
		dark: true,
		baseColor: '#020607',
		textColor: '#e0fff7',
		description: 'Emerald, cyan and violet organic masses with a northern glow',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 52% 45% at 28% 52%, rgba(16,185,129,0.72) 0%, rgba(5,120,87,0.16) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 90,
		    "blurDesktop": 130,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 52% at 68% 38%, rgba(34,211,238,0.68) 0%, rgba(8,145,178,0.14) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 105,
		    "blurDesktop": 151,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 28% 35% at 50% 72%, rgba(139,92,246,0.38) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 85,
		    "blurDesktop": 122,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "linear-gradient(145deg, transparent 30%, rgba(167,243,208,0.10) 46%, rgba(103,232,249,0.14) 53%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-black-cherry',
		name: 'Black Cherry',
		category: 'flux',
		mood: 'warm',
		dark: true,
		baseColor: '#090204',
		textColor: '#fecdd3',
		description: 'Dark cherry and crimson organic masses with a glossy depth',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 48% at 32% 50%, rgba(190,24,93,0.72) 0%, rgba(127,29,29,0.16) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 100,
		    "blurDesktop": 144,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 42% 55% at 68% 38%, rgba(220,38,38,0.62) 0%, rgba(153,27,27,0.14) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 120,
		    "blurDesktop": 173,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 25% 28% at 52% 70%, rgba(251,113,133,0.30) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'flux-frozen-plasma',
		name: 'Frozen Plasma',
		category: 'flux',
		mood: 'cool',
		dark: true,
		baseColor: '#02060b',
		textColor: '#e0f2fe',
		description: 'Icy blue organic masses glowing inside a frozen void',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(ellipse 55% 48% at 30% 50%, rgba(56,189,248,0.68) 0%, rgba(14,116,144,0.16) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 95,
		    "blurDesktop": 137,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 45% 55% at 68% 38%, rgba(129,140,248,0.62) 0%, rgba(67,56,202,0.14) 48%, transparent 72%)",
		    "blendMode": "screen",
		    "blurMobile": 115,
		    "blurDesktop": 166,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 22% 26% at 52% 68%, rgba(186,230,253,0.34) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 70,
		    "blurDesktop": 101,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-neon-grid',
		name: 'Neon Grid',
		category: 'lattice',
		mood: 'vivid',
		dark: true,
		baseColor: '#09090b',
		textColor: '#d8b4fe',
		description: 'Cyberpunk grid with neon purple glow lines',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(139,92,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.15) 1px, transparent 1px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.5) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 25% 75%, rgba(236,72,153,0.3) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'chrome-inferno',
		name: 'Chrome Inferno',
		category: 'lattice',
		mood: 'warm',
		dark: true,
		baseColor: '#0a0000',
		textColor: '#ffffff',
		description: 'Incandescent metallic beams cutting through total darkness',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(55.8% 55.49% at 50% 100%, rgb(120,30,10) 0%, rgba(80,15,5,0) 100%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "repeating-linear-gradient( 100deg, #331100 0%, #331100 3%, rgba(80, 30, 10, 0.7) 5%, rgba(80, 30, 10, 0.7) 7%, transparent 10%, transparent 12%, rgba(80, 30, 10, 0.7) 14%, #331100 16% ), repeating-linear-gradient( 100deg, #ff6b00 0%, #ff6b00 1.5%, rgba(255, 107, 0, 0.8) 2%, #b91c1c 3%, #b91c1c 4%, rgba(255, 107, 0, 0.8) 4.5%, #ff6b00 5% )",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse at 100% 100%, #ffffff 20%, #0a0000 80%)",
		    "blendMode": "multiply",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'diamond-storm',
		name: 'Diamond Storm',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#00030a',
		textColor: '#ffffff',
		description: 'Electric ice beams cutting through a glacial void',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(55.8% 55.49% at 50% 100%, rgb(20,60,120) 0%, rgba(10,30,80,0) 100%)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "repeating-linear-gradient( 100deg, #041022 0%, #041022 3%, rgba(20, 60, 120, 0.7) 5%, rgba(20, 60, 120, 0.7) 7%, transparent 10%, transparent 12%, rgba(20, 60, 120, 0.7) 14%, #041022 16% ), repeating-linear-gradient( 100deg, #b3e5ff 0%, #b3e5ff 1.5%, rgba(179, 229, 255, 0.8) 2%, #2563eb 3%, #2563eb 4%, rgba(179, 229, 255, 0.8) 4.5%, #b3e5ff 5% )",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 108,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse at 100% 100%, #ffffff 20%, #00030a 80%)",
		    "blendMode": "multiply",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-blueprint',
		name: 'Blueprint',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#0c1929',
		textColor: '#a5f3fc',
		description: 'Technical blueprint grid with cyan highlights',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(14,165,233,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.12) 1px, transparent 1px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 60% 40%, rgba(6,182,212,0.35) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-diamond-weave',
		name: 'Diamond Weave',
		category: 'lattice',
		mood: 'warm',
		dark: true,
		baseColor: '#0a0704',
		textColor: '#fef3c7',
		description: 'Diagonal crosshatch with golden glow',
		layers: [
		  {
		    "layer": 1,
		    "background": "repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(245,158,11,0.08) 30px, rgba(245,158,11,0.08) 31px), repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(245,158,11,0.08) 30px, rgba(245,158,11,0.08) 31px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.5) 0%, transparent 45%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 20% 80%, rgba(217,119,6,0.3) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-dot-matrix',
		name: 'Dot Matrix',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#0f0520',
		textColor: '#ddd6fe',
		description: 'Retro dot pattern with violet gradient wash',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle, rgba(139,92,246,0.2) 1px, transparent 1px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 40% 40%, rgba(124,58,237,0.6) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 70% 65%, rgba(168,85,247,0.4) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 138,
		    "blurDesktop": 198,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-light-weave',
		name: 'Light Weave',
		category: 'lattice',
		mood: 'cool',
		dark: false,
		baseColor: '#f0f9ff',
		textColor: '#1e3a5f',
		description: 'Delicate grid on soft blue with subtle glow',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(14,165,233,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.08) 1px, transparent 1px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, rgba(56,189,248,0.25) 0%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 30% 70%, rgba(99,102,241,0.15) 0%, transparent 40%)",
		    "blendMode": "normal",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-mono-grid',
		name: 'Mono Grid',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#0b0b0c',
		textColor: '#c7ccd1',
		description: 'Minimal grayscale grid with soft steel glow',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(148,163,184,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 50%, rgba(148,163,184,0.3) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 25% 75%, rgba(203,213,225,0.2) 0%, transparent 40%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-star-grid',
		name: 'Star Grid',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#05060f',
		textColor: '#dbe4ff',
		description: 'Fine grid over deep marine blue, speckled with bright dots',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 45%, rgba(99,102,241,0.35) 0%, transparent 50%)",
		    "blendMode": "screen",
		    "blurMobile": 200,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.9) 1.5px, transparent 4px), radial-gradient(circle at 78% 15%, rgba(199,210,254,0.9) 1.5px, transparent 4px), radial-gradient(circle at 88% 60%, rgba(255,255,255,0.8) 1.5px, transparent 4px), radial-gradient(circle at 30% 75%, rgba(255,255,255,0.8) 1.5px, transparent 4px), radial-gradient(circle at 55% 85%, rgba(199,210,254,0.9) 1.5px, transparent 4px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-hex-flow',
		name: 'Hex Flow',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#02080b',
		textColor: '#cffafe',
		description: 'Soft hexagonal lattice dissolving into cyan atmospheric light',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(30deg, transparent 48%, rgba(34,211,238,0.10) 49%, rgba(34,211,238,0.10) 51%, transparent 52%), linear-gradient(90deg, transparent 48%, rgba(34,211,238,0.07) 49%, rgba(34,211,238,0.07) 51%, transparent 52%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.8
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(34,211,238,0.32) 0%, rgba(14,116,144,0.10) 48%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 20% 75%, rgba(45,212,191,0.18) 0%, transparent 38%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-topographic',
		name: 'Topographic',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#030908',
		textColor: '#d1fae5',
		description: 'Layered contour lines flowing like a luminous terrain map',
		layers: [
		  {
		    "layer": 1,
		    "background": "repeating-radial-gradient(ellipse at 40% 50%, transparent 0px, transparent 18px, rgba(52,211,153,0.10) 19px, rgba(52,211,153,0.10) 20px, transparent 21px, transparent 38px)",
		    "blendMode": "normal",
		    "blurMobile": 3,
		    "blurDesktop": 4,
		    "opacity": 0.9
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 55% 45% at 40% 48%, rgba(16,185,129,0.28) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 35% 30% at 75% 30%, rgba(34,211,238,0.18) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-circuit',
		name: 'Circuit',
		category: 'lattice',
		mood: 'vivid',
		dark: true,
		baseColor: '#04070d',
		textColor: '#bfdbfe',
		description: 'Minimal electronic traces illuminated by electric blue',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(90deg, transparent 49%, rgba(59,130,246,0.14) 49%, rgba(59,130,246,0.14) 51%, transparent 51%), linear-gradient(0deg, transparent 49%, rgba(59,130,246,0.10) 49%, rgba(59,130,246,0.10) 51%, transparent 51%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.7
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 25% 25%, rgba(96,165,250,0.65) 0%, rgba(59,130,246,0.12) 8%, transparent 22%), radial-gradient(circle at 75% 65%, rgba(34,211,238,0.55) 0%, transparent 22%)",
		    "blendMode": "screen",
		    "blurMobile": 50,
		    "blurDesktop": 72,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "linear-gradient(135deg, transparent 35%, rgba(59,130,246,0.12) 50%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-diamond-field',
		name: 'Diamond Field',
		category: 'lattice',
		mood: 'vivid',
		dark: true,
		baseColor: '#08050f',
		textColor: '#ede9fe',
		description: 'Fine diamond lattice floating over a violet atmospheric field',
		layers: [
		  {
		    "layer": 1,
		    "background": "repeating-linear-gradient(45deg, transparent 0, transparent 24px, rgba(167,139,250,0.10) 25px, transparent 26px), repeating-linear-gradient(-45deg, transparent 0, transparent 24px, rgba(167,139,250,0.10) 25px, transparent 26px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.85
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 55% 55% at 48% 45%, rgba(139,92,246,0.34) 0%, rgba(91,33,182,0.10) 50%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 78% 22%, rgba(236,72,153,0.20) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-radar',
		name: 'Radar',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#020807',
		textColor: '#a7f3d0',
		description: 'Concentric scanning rings with a subtle electromagnetic glow',
		layers: [
		  {
		    "layer": 1,
		    "background": "repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 24px, rgba(52,211,153,0.11) 25px, transparent 26px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.9
		  },
		  {
		    "layer": 2,
		    "background": "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(52,211,153,0.16) 28deg, transparent 48deg, transparent 360deg)",
		    "blendMode": "screen",
		    "blurMobile": 30,
		    "blurDesktop": 43,
		    "opacity": 0.8
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 50%, rgba(52,211,153,0.28) 0%, transparent 48%)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-microdots',
		name: 'Microdots',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#05070c',
		textColor: '#dbeafe',
		description: 'Ultra-fine dot matrix fading into a soft blue atmosphere',
		layers: [
		  {
		    "layer": 1,
		    "background": "radial-gradient(circle, rgba(147,197,253,0.16) 1px, transparent 1.5px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 65% 50% at 50% 45%, rgba(59,130,246,0.26) 0%, transparent 75%)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 80% 25%, rgba(125,211,252,0.22) 0%, transparent 30%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-wave-grid',
		name: 'Wave Grid',
		category: 'lattice',
		mood: 'vivid',
		dark: true,
		baseColor: '#030609',
		textColor: '#cffafe',
		description: 'Curved interference lines creating a fluid geometric surface',
		layers: [
		  {
		    "layer": 1,
		    "background": "repeating-linear-gradient(100deg, transparent 0%, transparent 7%, rgba(34,211,238,0.08) 7.5%, transparent 8%, transparent 15%)",
		    "blendMode": "normal",
		    "blurMobile": 8,
		    "blurDesktop": 11,
		    "opacity": 0.9
		  },
		  {
		    "layer": 2,
		    "background": "repeating-linear-gradient(80deg, transparent 0%, transparent 9%, rgba(59,130,246,0.07) 9.5%, transparent 10%, transparent 18%)",
		    "blendMode": "screen",
		    "blurMobile": 13,
		    "blurDesktop": 18,
		    "opacity": 0.8
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 65% 35% at 50% 52%, rgba(6,182,212,0.28) 0%, transparent 75%)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-honeycomb',
		name: 'Honeycomb',
		category: 'lattice',
		mood: 'warm',
		dark: true,
		baseColor: '#0a0703',
		textColor: '#fef3c7',
		description: 'Hexagonal amber structure with a restrained golden glow',
		layers: [
		  {
		    "layer": 1,
		    "background": "repeating-linear-gradient(30deg, transparent 0, transparent 25px, rgba(245,158,11,0.09) 26px, transparent 27px), repeating-linear-gradient(150deg, transparent 0, transparent 25px, rgba(245,158,11,0.09) 26px, transparent 27px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.9
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 55% 48% at 50% 48%, rgba(245,158,11,0.30) 0%, rgba(180,83,9,0.08) 50%, transparent 76%)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 25% 75%, rgba(251,191,36,0.18) 0%, transparent 35%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-constellation',
		name: 'Constellation',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#03050c',
		textColor: '#dbeafe',
		description: 'Sparse geometric network connecting luminous points',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(28deg, transparent 48%, rgba(129,140,248,0.08) 49%, transparent 50%), linear-gradient(142deg, transparent 48%, rgba(96,165,250,0.08) 49%, transparent 50%)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.8
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.85) 1px, transparent 3px), radial-gradient(circle at 65% 22%, rgba(191,219,254,0.8) 1.5px, transparent 4px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.75) 1px, transparent 3px), radial-gradient(circle at 35% 78%, rgba(165,180,252,0.8) 1.5px, transparent 4px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 55% 50% at 50% 50%, rgba(99,102,241,0.22) 0%, transparent 75%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-prism-mesh',
		name: 'Prism Mesh',
		category: 'lattice',
		mood: 'vivid',
		dark: true,
		baseColor: '#07060c',
		textColor: '#f0f9ff',
		description: 'Angular mesh illuminated by cyan, violet and magenta refractions',
		layers: [
		  {
		    "layer": 1,
		    "background": "repeating-linear-gradient(60deg, transparent 0, transparent 38px, rgba(34,211,238,0.08) 39px, transparent 40px), repeating-linear-gradient(120deg, transparent 0, transparent 38px, rgba(167,139,250,0.08) 39px, transparent 40px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.9
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 50% 45% at 35% 45%, rgba(34,211,238,0.28) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 150,
		    "blurDesktop": 216,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 45% 50% at 70% 55%, rgba(217,70,239,0.24) 0%, transparent 70%)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-scanlines',
		name: 'Scanlines',
		category: 'lattice',
		mood: 'vivid',
		dark: true,
		baseColor: '#03070a',
		textColor: '#bae6fd',
		description: 'Fine horizontal scanlines over a subtle cybernetic glow',
		layers: [
		  {
		    "layer": 1,
		    "background": "repeating-linear-gradient(0deg, rgba(56,189,248,0.09) 0px, rgba(56,189,248,0.09) 1px, transparent 1px, transparent 6px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.8
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.14) 45%, rgba(59,130,246,0.18) 55%, transparent 100%)",
		    "blendMode": "screen",
		    "blurMobile": 88,
		    "blurDesktop": 126,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.24) 0%, transparent 52%)",
		    "blendMode": "screen",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-moire',
		name: 'Moiré',
		category: 'lattice',
		mood: 'vivid',
		dark: true,
		baseColor: '#06070c',
		textColor: '#e0e7ff',
		description: 'Overlapping fine waves producing a hypnotic moiré surface',
		layers: [
		  {
		    "layer": 1,
		    "background": "repeating-linear-gradient(15deg, transparent 0, transparent 9px, rgba(129,140,248,0.09) 10px, transparent 11px)",
		    "blendMode": "normal",
		    "blurMobile": 3,
		    "blurDesktop": 4,
		    "opacity": 0.9
		  },
		  {
		    "layer": 2,
		    "background": "repeating-linear-gradient(165deg, transparent 0, transparent 11px, rgba(34,211,238,0.07) 12px, transparent 13px)",
		    "blendMode": "screen",
		    "blurMobile": 3,
		    "blurDesktop": 4,
		    "opacity": 0.8
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(99,102,241,0.22) 0%, transparent 75%)",
		    "blendMode": "screen",
		    "blurMobile": 175,
		    "blurDesktop": 252,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-celestial',
		name: 'Celestial Lattice',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#030510',
		textColor: '#e0e7ff',
		description: 'Fine celestial geometry fading into a deep cosmic blue',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(129,140,248,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.07) 1px, transparent 1px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.8
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(circle at 50% 45%, rgba(79,70,229,0.28) 0%, transparent 65%)",
		    "blendMode": "screen",
		    "blurMobile": 188,
		    "blurDesktop": 260,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.9) 1px, transparent 3px), radial-gradient(circle at 78% 32%, rgba(191,219,254,0.8) 1px, transparent 3px), radial-gradient(circle at 62% 78%, rgba(255,255,255,0.75) 1px, transparent 3px)",
		    "blendMode": "screen",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.9
		  }
		]
	},
	{
		id: 'lattice-soft-mesh',
		name: 'Soft Mesh',
		category: 'lattice',
		mood: 'cool',
		dark: false,
		baseColor: '#f0fdfa',
		textColor: '#164e63',
		description: 'Minimal pale mesh dissolving into an airy cyan atmosphere',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(20,184,166,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.08) 1px, transparent 1px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.8
		  },
		  {
		    "layer": 2,
		    "background": "radial-gradient(ellipse 60% 45% at 48% 45%, rgba(45,212,191,0.22) 0%, transparent 75%)",
		    "blendMode": "normal",
		    "blurMobile": 163,
		    "blurDesktop": 234,
		    "opacity": 1
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(circle at 75% 25%, rgba(125,211,252,0.18) 0%, transparent 35%)",
		    "blendMode": "normal",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
	{
		id: 'lattice-aurora-grid',
		name: 'Aurora Grid',
		category: 'lattice',
		mood: 'cool',
		dark: true,
		baseColor: '#020706',
		textColor: '#dcfff6',
		description: 'Fine geometric grid submerged beneath an emerald and cyan aurora',
		layers: [
		  {
		    "layer": 1,
		    "background": "linear-gradient(rgba(52,211,153,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px)",
		    "blendMode": "normal",
		    "blurMobile": 75,
		    "blurDesktop": 100,
		    "opacity": 0.7
		  },
		  {
		    "layer": 2,
		    "background": "linear-gradient(145deg, transparent 25%, rgba(16,185,129,0.18) 40%, rgba(34,211,238,0.24) 50%, rgba(52,211,153,0.12) 60%, transparent 76%)",
		    "blendMode": "screen",
		    "blurMobile": 105,
		    "blurDesktop": 151,
		    "opacity": 0.9
		  },
		  {
		    "layer": 3,
		    "background": "radial-gradient(ellipse 70% 25% at 50% 52%, rgba(94,234,212,0.22) 0%, transparent 78%)",
		    "blendMode": "screen",
		    "blurMobile": 113,
		    "blurDesktop": 162,
		    "opacity": 1
		  },
		  {
		    "layer": 4,
		    "background": "radial-gradient(ellipse 35% 22% at 72% 25%, rgba(129,140,248,0.10) 0%, transparent 75%)",
		    "blendMode": "screen",
		    "blurMobile": 125,
		    "blurDesktop": 180,
		    "opacity": 1
		  }
		]
	},
];

export const DEFAULT_THEME_ID = 'theme-light-default';

export const LIGHT_THEMES = THEMES.filter((t) => t.mode === 'light');
export const DARK_THEMES = THEMES.filter((t) => t.mode === 'dark');
