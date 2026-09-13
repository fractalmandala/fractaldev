/**
 * fractalpop theme system — token palette mappings and default themes.
 *
 * A theme is either a single ThemePalette, or a composite { light, dark } pair
 * rendered with CSS light-dark().
 */
import type { TokenType } from './shared.js'

export type ThemeToken = Exclude<TokenType, 'break' | 'space'>

export type ThemePalette = Readonly<
  {
    background: string
    foreground: string
    caret?: string
    title?: string
    control?: string
    lineNumber?: string
    lineHighlight?: string
  } & Partial<Record<ThemeToken, string>>
>

export type Theme = ThemePalette | Readonly<{ light: ThemePalette; dark: ThemePalette }>

export const tokenKeys: readonly ThemeToken[] = [
  'identifier',
  'keyword',
  'string',
  'class',
  'property',
  'entity',
  'jsxliterals',
  'sign',
  'comment',
]

const lightDark = (light: string, dark: string) => `light-dark(${light}, ${dark})`

/** Convert a ThemePalette into a dictionary of CSS property declarations. */
export function paletteVars(p: ThemePalette): Record<string, string> {
  const v: Record<string, string> = {
    'background-color': p.background,
    color: p.foreground,
    '--fp-caret-color': p.caret ?? p.foreground,
    '--fp-title-color': p.title ?? p.foreground,
    '--fp-control-color': p.control ?? p.comment ?? p.foreground,
    '--fp-line-number-color': p.lineNumber ?? p.comment ?? p.foreground,
    '--fp-line-highlight-color': p.lineHighlight ?? 'color-mix(in srgb, currentColor 12%, transparent)',
  }
  for (const t of tokenKeys) v[`--fp-${t}`] = p[t] ?? p.foreground
  return v
}

function toCss(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, val]) => `${k}:${val}`)
    .join(';')
}

/** Return an inline `style` string of theme variables, or '' when no theme is given. */
export function themeStyle(theme: Theme | undefined): string {
  if (!theme) return ''
  if (!('light' in theme)) return toCss(paletteVars(theme))
  const light = paletteVars((theme as { light: ThemePalette }).light)
  const dark = paletteVars((theme as { dark: ThemePalette }).dark)
  const merged: Record<string, string> = {}
  for (const key of Object.keys(light)) merged[key] = lightDark(light[key]!, dark[key]!)
  return toCss(merged)
}

/** Emit a copyable CSS block of --fp-* variables for a given selector. */
export function themeCss(selector: string, theme: Theme): string {
  if (!('light' in theme)) {
    const vars = paletteVars(theme)
    const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`)
    return `${selector} {\n${lines.join('\n')}\n}`
  }
  const lightVars = paletteVars((theme as { light: ThemePalette }).light)
  const darkVars = paletteVars((theme as { dark: ThemePalette }).dark)
  const lightLines = Object.entries(lightVars).map(([k, v]) => `  ${k}: ${v};`)
  const darkLines = Object.entries(darkVars).map(([k, v]) => `  ${k}: ${v};`)
  return [
    `${selector} {\n${lightLines.join('\n')}\n}`,
    `@media (prefers-color-scheme: dark) {\n  ${selector} {\n  ${darkLines.join('\n  ')}\n  }\n}`,
    `[data-theme="dark"] ${selector}, ${selector}[data-theme="dark"] {\n${darkLines.join('\n')}\n}`,
  ].join('\n\n')
}

/** SvelteKit theme (Light) */
export const sveltekitLight: ThemePalette = {
  background: '#FFFFFF',
  foreground: '#313131',
  class: '#DE2D00',
  identifier: '#414141',
  sign: '#FF4500',
  property: '#787676',
  entity: '#313131',
  jsxliterals: '#FA3701',
  string: '#FA3701',
  keyword: '#FA3701',
  comment: '#6e6d6d',
  caret: '#FF4500',
}

/** SvelteKit theme (Dark) */
export const sveltekitDark: ThemePalette = {
  background: '#212121',
  foreground: '#c7c6c6',
  class: '#DE2D00',
  identifier: '#7a7878',
  sign: '#FF4500',
  property: '#e1dfdf',
  entity: '#fff8f8',
  jsxliterals: '#FA3701',
  string: '#FA3701',
  keyword: '#FA3701',
  comment: '#6e6d6d',
  caret: '#FF4500',
}

/** SvelteKit theme (adaptive light/dark via CSS light-dark()) */
export const sveltekit: Theme = {
  light: sveltekitLight,
  dark: sveltekitDark,
}

/** VS Code theme (Light) */
export const vscodeLight: ThemePalette = {
  background: '#f6f8fa',
  foreground: '#24292f',
  class: '#6f42c1',
  identifier: '#24292f',
  sign: '#24292f',
  property: '#0550ae',
  entity: '#953800',
  jsxliterals: '#8250df',
  string: '#032f62',
  keyword: '#cf222e',
  comment: '#6e7781',
  caret: '#24292f',
}

/** VS Code theme (Dark) */
export const vscodeDark: ThemePalette = {
  background: '#1e1e1e',
  foreground: '#9cdcfe',
  class: '#4ec9b0',
  identifier: '#9cdcfe',
  sign: '#d4d4d4',
  property: '#9cdcfe',
  entity: '#dcdcaa',
  jsxliterals: '#ff8c42',
  string: '#ce9178',
  keyword: '#569cd6',
  comment: '#6a9955',
  caret: '#aeafad',
}

/** VS Code theme (adaptive light/dark via CSS light-dark()) */
export const vscode: Theme = {
  light: vscodeLight,
  dark: vscodeDark,
}

/** Shipped default themes bundle */
export const themes = {
  sveltekit,
  sveltekitLight,
  sveltekitDark,
  vscode,
  vscodeLight,
  vscodeDark,
} as const
