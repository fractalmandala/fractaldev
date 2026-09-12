/** Language registry: resolve a name / extension / alias to a canonical language. */
export {
  type Language,
  allLanguages,
  registerLanguage,
  setDefaults,
  importDefaults,
  findLanguage,
  lang,
  canonicalizeLang,
  getRegisteredLanguages,
  resetLanguageRegistry,
  getLanguageConfig,
} from './lang-registry.js'
