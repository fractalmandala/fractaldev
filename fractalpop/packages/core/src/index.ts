/** fractalpop — public entry. `highlight(code, options)` returns an HTML string. */
import { parse } from './core.js'
import { render, type DisplayOptions } from './shared.js'
import {
  canonicalizeLang,
  getLanguageConfig,
  registerLanguage,
} from './lang-registry.js'

export interface HighlightOptions extends DisplayOptions {
  /** Language id, extension, or alias. Defaults to 'typescript'. */
  lang?: string
  /** Explicit parse config that overrides the registry. */
  config?: import('./core.js').ParseOptions
}

export interface LanguagePair {
  language: import('./lang-registry.js').Language
  config: import('./core.js').ParseOptions
}

/** Register multiple languages with their parse configs. */
export function registerLanguages(languages: readonly LanguagePair[]): void {
  for (const { language, config } of languages) {
    registerLanguage(language, config)
  }
}

/** Highlight `code` to an HTML string. No DOM required. */
export function highlight(code: string, options?: HighlightOptions): string {
  const { lang, config, cx, mark, markLine } = options || {}
  const resolvedConfig =
    config ??
    (lang ? getLanguageConfig(canonicalizeLang(lang) ?? lang) : undefined) ??
    getLanguageConfig('typescript') ??
    {}
  const parsed = parse(code, resolvedConfig)
  return render(parsed, { cx, mark, markLine })
}

export type { DisplayOptions, TokenType, MarkToken, MarkLine } from './shared.js'
export type { HighlightOptions as Options }
export {
  parseHighlightMeta,
  escapeSvelte,
  toHighlightRanges,
  type HighlightRange,
} from './meta.js'
export {
  registerLanguage,
  setDefaults,
  importDefaults,
  canonicalizeLang,
  lang,
  findLanguage,
  getRegisteredLanguages,
  resetLanguageRegistry,
  resetLanguageConfigRegistry,
  getLanguageConfig,
  allLanguages,
} from './lang-registry.js'
