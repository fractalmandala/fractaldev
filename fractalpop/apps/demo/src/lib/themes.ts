/** Theme palettes adapted from the reference. Each maps to fractalpop's --fp-* token vars. */
export interface Palette {
  background: string
  foreground: string
  class: string
  identifier: string
  sign: string
  property: string
  entity: string
  jsxliterals: string
  string: string
  keyword: string
  comment: string
}
export interface Theme {
  name: string
  light: Palette
  dark: Palette
}

export const themes: Theme[] = [
  {
    name: 'Taffy',
    light: { background: '#f6f6f6', foreground: '#354150', class: '#8d85ff', identifier: '#354150', sign: '#8996a3', property: '#4e8fdf', entity: '#665ac7', jsxliterals: '#bf7db6', string: '#00a99a', keyword: '#f47067', comment: '#a19595' },
    dark: { background: '#25272d', foreground: '#d4d4d4', class: '#7eb5ff', identifier: '#d4d4d4', sign: '#8b949e', property: '#79c0ff', entity: '#b7adff', jsxliterals: '#d2a8ff', string: '#88bbb6', keyword: '#ffada8', comment: '#8b8b8b' },
  },
  {
    name: 'Vercel',
    light: { background: '#ffffff', foreground: '#171717', class: '#107d32', identifier: '#171717', sign: '#171717', property: '#d60020', entity: '#107d32', jsxliterals: '#171717', string: '#107d32', keyword: '#c41562', comment: '#4d4d4d' },
    dark: { background: '#000000', foreground: '#ededed', class: '#00ca52', identifier: '#ededed', sign: '#ededed', property: '#ff5e63', entity: '#00ca52', jsxliterals: '#ededed', string: '#00ca52', keyword: '#ff518d', comment: '#a0a0a0' },
  },
  {
    name: 'VS Code',
    light: { background: '#f6f8fa', foreground: '#24292f', class: '#6f42c1', identifier: '#24292f', sign: '#24292f', property: '#0550ae', entity: '#953800', jsxliterals: '#8250df', string: '#032f62', keyword: '#cf222e', comment: '#6e7781' },
    dark: { background: '#1e1e1e', foreground: '#9cdcfe', class: '#4ec9b0', identifier: '#9cdcfe', sign: '#d4d4d4', property: '#9cdcfe', entity: '#dcdcaa', jsxliterals: '#ff8c42', string: '#ce9178', keyword: '#569cd6', comment: '#6a9955' },
  },
  {
    name: 'One Dark Pro',
    light: { background: '#fafafa', foreground: '#383a42', class: '#a626a4', identifier: '#383a42', sign: '#383a42', property: '#0184bc', entity: '#4078f2', jsxliterals: '#c18401', string: '#50a14f', keyword: '#a626a4', comment: '#a0a1a7' },
    dark: { background: '#282c34', foreground: '#abb2bf', class: '#e06c75', identifier: '#abb2bf', sign: '#abb2bf', property: '#56b6c2', entity: '#61afef', jsxliterals: '#e5c07b', string: '#98c379', keyword: '#c678dd', comment: '#5c6370' },
  },
  {
    name: 'Monokai',
    light: { background: '#f7f7f5', foreground: '#6b8e23', class: '#c72565', identifier: '#6b8e23', sign: '#3a7ca5', property: '#6b8e23', entity: '#cc7b18', jsxliterals: '#7b5fc9', string: '#a68e39', keyword: '#c72565', comment: '#99998e' },
    dark: { background: '#272822', foreground: '#a6e22e', class: '#f92672', identifier: '#a6e22e', sign: '#66d9ef', property: '#a6e22e', entity: '#fd971f', jsxliterals: '#ae81ff', string: '#e6db74', keyword: '#f92672', comment: '#75715e' },
  },
  {
    name: 'Gruvbox',
    light: { background: '#fbf1c7', foreground: '#3c3836', class: '#b57614', identifier: '#3c3836', sign: '#3c3836', property: '#076678', entity: '#427b58', jsxliterals: '#af3a03', string: '#79740e', keyword: '#9d0006', comment: '#928374' },
    dark: { background: '#282828', foreground: '#ebdbb2', class: '#fabd2f', identifier: '#ebdbb2', sign: '#ebdbb2', property: '#83a598', entity: '#8ec07c', jsxliterals: '#fe8019', string: '#b8bb26', keyword: '#fb4934', comment: '#928374' },
  },
  {
    name: 'Tokyo Night',
    light: { background: '#f5f5f7', foreground: '#565a6e', class: '#5a4a78', identifier: '#565a6e', sign: '#565a6e', property: '#166775', entity: '#0f4b6e', jsxliterals: '#8f5e15', string: '#485e30', keyword: '#8c4351', comment: '#848cb5' },
    dark: { background: '#1a1b26', foreground: '#c0caf5', class: '#bb9af7', identifier: '#c0caf5', sign: '#c0caf5', property: '#73daca', entity: '#7dcfff', jsxliterals: '#e0af68', string: '#9ece6a', keyword: '#f7768e', comment: '#565f89' },
  },
  {
    name: 'Minimal',
    light: { background: '#f6f6f6', foreground: '#404040', class: '#404040', identifier: '#404040', sign: '#404040', property: '#404040', entity: '#404040', jsxliterals: '#404040', string: '#808080', keyword: '#606060', comment: '#999999' },
    dark: { background: '#252525', foreground: '#909090', class: '#909090', identifier: '#909090', sign: '#909090', property: '#909090', entity: '#909090', jsxliterals: '#909090', string: '#808080', keyword: '#b0b0b0', comment: '#a0a0a0' },
  },
]

export type Mode = 'light' | 'dark'

/** Emit a copyable CSS block of --fp-* vars for a palette under a selector. */
export function cssFor(selector: string, p: Palette): string {
  const keys: (keyof Palette)[] = ['class', 'identifier', 'sign', 'string', 'keyword', 'comment', 'jsxliterals', 'entity', 'property']
  const lines = keys.map((k) => `  --fp-${k}: ${p[k]};`)
  return `${selector} {\n${lines.join('\n')}\n}`
}

/** Turn a palette into the CSS custom properties fractalpop reads, plus chrome vars. */
export function paletteVars(p: Palette): string {
  return [
    `--fp-identifier:${p.identifier}`,
    `--fp-keyword:${p.keyword}`,
    `--fp-string:${p.string}`,
    `--fp-class:${p.class}`,
    `--fp-property:${p.property}`,
    `--fp-entity:${p.entity}`,
    `--fp-jsxliterals:${p.jsxliterals}`,
    `--fp-sign:${p.sign}`,
    `--fp-comment:${p.comment}`,
    `--fp-break:${p.foreground}`,
    `--fp-space:${p.foreground}`,
    `--panel-bg:${p.background}`,
    `--panel-fg:${p.foreground}`,
  ].join(';')
}

/** The palette a given mode actually renders with. Use this everywhere the UI
 *  needs to show what will land — pickers included. */
export function paletteFor(theme: Theme, mode: Mode): Palette {
  return mode === 'dark' ? theme.dark : theme.light
}
