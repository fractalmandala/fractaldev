import { describe, expect, it } from 'vitest'
import {
  themeStyle,
  themeCss,
  paletteVars,
  sveltekit,
  sveltekitLight,
  sveltekitDark,
  vscode,
  vscodeLight,
  vscodeDark,
  themes,
} from '../src/theme.js'

describe('core theme system', () => {
  it('includes sveltekit and vscode themes by default', () => {
    expect(sveltekit.light).toBe(sveltekitLight)
    expect(sveltekit.dark).toBe(sveltekitDark)
    expect(vscode.light).toBe(vscodeLight)
    expect(vscode.dark).toBe(vscodeDark)
    expect(themes.sveltekit).toBe(sveltekit)
    expect(themes.vscode).toBe(vscode)
  })

  it('generates light-dark() CSS variables for dual themes', () => {
    const sveltekitStyle = themeStyle(sveltekit)
    expect(sveltekitStyle).toContain('background-color:light-dark(#FFFFFF, #212121)')
    expect(sveltekitStyle).toContain('--fp-keyword:light-dark(#FA3701, #FA3701)')
    expect(sveltekitStyle).toContain('--fp-sign:light-dark(#FF4500, #FF4500)')

    const vscodeStyle = themeStyle(vscode)
    expect(vscodeStyle).toContain('background-color:light-dark(#f6f8fa, #1e1e1e)')
    expect(vscodeStyle).toContain('--fp-keyword:light-dark(#cf222e, #569cd6)')
    expect(vscodeStyle).toContain('--fp-string:light-dark(#032f62, #ce9178)')
  })

  it('generates direct CSS declarations for single palettes', () => {
    const light = themeStyle(vscodeLight)
    expect(light).toContain('background-color:#f6f8fa')
    expect(light).toContain('--fp-keyword:#cf222e')

    const dark = themeStyle(vscodeDark)
    expect(dark).toContain('background-color:#1e1e1e')
    expect(dark).toContain('--fp-keyword:#569cd6')
  })

  it('generates copyable CSS blocks via themeCss', () => {
    const css = themeCss(':root', sveltekit)
    expect(css).toContain(':root {')
    expect(css).toContain('--fp-keyword: #FA3701;')
    expect(css).toContain('@media (prefers-color-scheme: dark)')
    expect(css).toContain('[data-theme="dark"]')
  })

  it('handles paletteVars correctly', () => {
    const vars = paletteVars(sveltekitLight)
    expect(vars['--fp-keyword']).toBe('#FA3701')
    expect(vars['background-color']).toBe('#FFFFFF')
    expect(vars['color']).toBe('#313131')
  })
})
