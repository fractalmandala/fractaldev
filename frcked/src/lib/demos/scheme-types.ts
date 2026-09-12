/**
 * Design-scheme token types — comprehensive multi-archetype design system schema.
 *
 * Supports true depth (shadows), material physics (backdrop-blur, surface gradients, textures),
 * stroke languages (hairlines, brutalist borders, border-beams), interaction dynamics,
 * and typographic nuance beyond flat color tokens.
 */

export type RoleKey =
	| 'primary'
	| 'secondary'
	| 'tertiary'
	| 'accent'
	| 'neutral'
	| 'background'
	| 'surface'
	| 'text-primary'
	| 'text-secondary'
	| 'border';

export type RoleMap = Partial<Record<RoleKey, string>>;

export type ArchetypeKey =
	| 'skeuomorphic-glass'
	| 'obsidian-linear'
	| 'neo-brutalist'
	| 'editorial-luxury'
	| 'enterprise-telemetry'
	| 'default';

export type DensityMode = 'compact' | 'comfortable' | 'spacious';

export type TexturePattern = 'none' | 'dot-grid' | 'line-grid' | 'noise' | 'radial-mesh';

export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'none';

/**
 * Depth & shadow scale: directional key + ambient pairs, inner highlights, and glows.
 */
export interface ShadowScale {
	sm?: string;          // Subtle card rest elevation
	md?: string;          // Floating dropdown / hover elevation
	lg?: string;          // Modal / dialog / top-tier card
	inner?: string;       // Inset specular bevel / highlight (vital for skeuomorphism)
	glow?: string;        // Colored neon halo / ambient bleed
	sunken?: string;      // Pressed state / input trough recession
	[k: string]: string | undefined;
}

/**
 * Border & stroke system: width, style, gradient beam masks, and corner geometry.
 */
export interface BorderSystem {
	width?: string;       // e.g. '1px', '0.5px', '3px'
	style?: BorderStyle;  // 'solid' | 'dashed' | 'dotted'
	color?: string;       // border color or var reference
	gradient?: string;    // top-lit border beam or mask
	radiusCard?: string;  // card corner geometry e.g. '0px', '12px', '24px'
	radiusControl?: string;// button/input radius e.g. '0px', '6px', '9999px'
	radiusPill?: string;  // pill/badge radius
	[k: string]: string | undefined;
}

/**
 * Material physics: backdrop blurs, surface fills, noise/grid textures, and alpha.
 */
export interface MaterialSystem {
	backdropBlur?: string;      // 'none', '12px', '24px'
	surfaceGradient?: string;   // card fill gradient e.g. linear-gradient(180deg, ...)
	backgroundTexture?: TexturePattern; // 'dot-grid', 'line-grid', 'noise'
	surfaceOpacity?: number | string;   // 0.0 - 1.0 for glassmorphic alpha
	[k: string]: string | number | undefined;
}

/**
 * Interactive dynamics: transition easing curves, duration, hover lift, and focus indicators.
 */
export interface InteractionSystem {
	easing?: string;            // cubic-bezier timing curve
	durationFast?: string;      // e.g. '150ms'
	durationNormal?: string;    // e.g. '250ms'
	durationSlow?: string;      // e.g. '400ms'
	hoverLift?: string;         // 'translateY(-2px)', 'translate(2px, 2px)', 'none'
	focusRing?: string;         // focus outline / box-shadow string
	[k: string]: string | undefined;
}

/**
 * Expressive gradients: diffused hero glows, accent beams, and text clips.
 */
export interface GradientSystem {
	heroGlow?: string;          // diffused radial glow behind hero
	accentBeam?: string;        // linear highlight on banners/badges
	textGradient?: string;      // headline gradient clip
	surfaceMesh?: string;       // multi-stop background mesh
	[k: string]: string | undefined;
}

export interface FontSpec {
	fontFamily?: string;
	fontSize?: string;
	fontWeight?: number | string;
	lineHeight?: string;
	letterSpacing?: string;
	textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
	tabularNums?: boolean;
}

export interface TypographyMap {
	'display-lg'?: FontSpec;
	'display-hero'?: FontSpec;
	'heading-card'?: FontSpec;
	'body-md'?: FontSpec;
	'body-sm'?: FontSpec;
	'caption-meta'?: FontSpec;
	'label-md'?: FontSpec;
	'mono-code'?: FontSpec;
	[k: string]: FontSpec | undefined;
}

export interface Scheme {
	id: string;
	name: string;
	description: string;
	version: string;
	archetype?: ArchetypeKey;
	tags: string[];
	roles: RoleMap;
	typography: TypographyMap;
	spacing: Record<string, string>;
	rounded: Record<string, string>;
	shadows?: ShadowScale;
	borders?: BorderSystem;
	materials?: MaterialSystem;
	interactions?: InteractionSystem;
	gradients?: GradientSystem;
	body: string;
}

/** The color roles the palette editor manipulates, in display order. */
export const ROLE_KEYS: RoleKey[] = [
	'primary',
	'secondary',
	'tertiary',
	'accent',
	'neutral',
	'background',
	'surface',
	'text-primary',
	'text-secondary',
	'border'
];

export const ROLE_LABELS: Record<RoleKey, string> = {
	primary: 'Primary',
	secondary: 'Secondary',
	tertiary: 'Tertiary',
	accent: 'Accent',
	neutral: 'Neutral',
	background: 'Background',
	surface: 'Surface',
	'text-primary': 'Text · Primary',
	'text-secondary': 'Text · Secondary',
	border: 'Border'
};
