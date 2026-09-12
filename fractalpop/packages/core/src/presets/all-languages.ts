/** Static pairing of every language's metadata with its parse config. */
import type { ParseOptions } from '../core.js'
import type { Language } from '../lang-registry.js'
import { allLanguages } from '../lang-registry.js'
import { configs } from './configs.js'

export interface LanguagePair {
  language: Language
  config: ParseOptions
}

export const languages: LanguagePair[] = allLanguages.map((language) => {
  const config = configs[language.id]
  if (!config) {
    throw new Error(`Missing parse config for language "${language.id}"`)
  }
  return { language, config }
})
