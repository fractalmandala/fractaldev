/** Theme → CSS custom properties (--fp-*), ported for fractalpop.
 * A theme is a single palette, or a { light, dark } pair rendered with light-dark(). */
import type { TokenType } from 'fractalpop'

type ThemeToken = Exclude<TokenType, 'break' | 'space'>

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

const tokenKeys: readonly ThemeToken[] = [
  'identifier', 'keyword', 'string', 'class', 'property', 'entity', 'jsxliterals', 'sign', 'comment',
]

const lightDark = (light: string, dark: string) => `light-dark(${light}, ${dark})`

function paletteVars(p: ThemePalette): Record<string, string> {
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
  return Object.entries(vars).map(([k, val]) => `${k}:${val}`).join(';')
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
