/** Mutable language metadata registry with alias/extension normalization. */
import type { ParseOptions } from './core.js'
import {
  getLanguageConfig,
  registerLanguageConfig,
  resetLanguageConfigRegistry,
} from './lang-configs.js'
import { config as typescriptConfig } from './lang/typescript.js'
import { config as plaintextConfig } from './lang/plaintext.js'

export interface Language {
  id: string
  extension: string
  aliases: readonly string[]
}

const languageRegistry = new Map<string, Language>()

function normalizeLanguageName(value: string): string {
  return value.trim().toLowerCase().replace(/^\./, '')
}

function registerName(name: string, language: Language): void {
  const normalized = normalizeLanguageName(name)
  if (!normalized) return
  const existing = languageRegistry.get(normalized)
  if (existing && existing.id !== language.id) {
    throw new Error(`Language name "${normalized}" is shared by "${existing.id}" and "${language.id}"`)
  }
  languageRegistry.set(normalized, language)
}

export function registerLanguage(language: Language, config?: ParseOptions): void {
  const names = new Set([language.id, language.extension, ...language.aliases])
  for (const name of names) {
    registerName(name, language)
  }
  if (config) {
    registerLanguageConfig(language.id, config)
  }
}

export function setDefaults(languages: readonly Language[]): void
export function setDefaults(configs: Record<string, ParseOptions>): void
export function setDefaults(
  input: readonly Language[] | Record<string, ParseOptions>,
): void {
  resetLanguageRegistry()
  resetLanguageConfigRegistry()
  if (Array.isArray(input)) {
    for (const language of input) {
      registerLanguage(language)
    }
  } else {
    for (const [id, config] of Object.entries(input)) {
      const language = allLanguages.find((l) => l.id === id)
      if (language) {
        registerLanguage(language, config)
      } else {
        registerLanguage({ id, extension: id, aliases: [] }, config)
      }
    }
  }
}

const configImporters: Record<string, () => Promise<{ config: ParseOptions }>> = {
  javascript: () => import('./lang/javascript.js'),
  typescript: () => import('./lang/typescript.js'),
  css: () => import('./lang/css.js'),
  scss: () => import('./lang/scss.js'),
  sass: () => import('./lang/sass.js'),
  html: () => import('./lang/html.js'),
  svelte: () => import('./lang/svelte.js'),
  markdown: () => import('./lang/markdown.js'),
  diff: () => import('./lang/diff.js'),
  plaintext: () => import('./lang/plaintext.js'),
  c: () => import('./lang/c.js'),
  cpp: () => import('./lang/cpp.js'),
  csharp: () => import('./lang/csharp.js'),
  dockerfile: () => import('./lang/dockerfile.js'),
  go: () => import('./lang/go.js'),
  graphql: () => import('./lang/graphql.js'),
  hcl: () => import('./lang/hcl.js'),
  java: () => import('./lang/java.js'),
  json: () => import('./lang/json.js'),
  kotlin: () => import('./lang/kotlin.js'),
  lua: () => import('./lang/lua.js'),
  php: () => import('./lang/php.js'),
  powershell: () => import('./lang/powershell.js'),
  python: () => import('./lang/python.js'),
  ruby: () => import('./lang/ruby.js'),
  rust: () => import('./lang/rust.js'),
  shell: () => import('./lang/shell.js'),
  sql: () => import('./lang/sql.js'),
  swift: () => import('./lang/swift.js'),
  toml: () => import('./lang/toml.js'),
  yaml: () => import('./lang/yaml.js'),
  zig: () => import('./lang/zig.js'),
}

export async function importDefaults(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map(async (id) => {
      const importer = configImporters[id]
      if (!importer) return
      const { config } = await importer()
      const language = allLanguages.find((l) => l.id === id)
      if (language) {
        registerLanguage(language, config)
      } else {
        registerLanguage({ id, extension: id, aliases: [] }, config)
      }
    }),
  )
}

/** Find canonical language metadata by name, alias, or extension. */
export function findLanguage(name: string): Language | undefined {
  if (typeof name !== 'string') return undefined
  return languageRegistry.get(normalizeLanguageName(name))
}

/** Resolve a name/alias/extension to its canonical language id. */
export function lang(name: string): string | undefined {
  return findLanguage(name)?.id
}

/** Alias for {@link lang}. */
export const canonicalizeLang = lang

export function getRegisteredLanguages(): readonly Language[] {
  return [...new Set(languageRegistry.values())]
}

export function resetLanguageRegistry(): void {
  languageRegistry.clear()
}

export { getLanguageConfig, resetLanguageConfigRegistry }

export const allLanguages: readonly Language[] = [
  { id: 'javascript', extension: 'js', aliases: ['jsx', 'node'] },
  { id: 'typescript', extension: 'ts', aliases: ['tsx'] },
  { id: 'css', extension: 'css', aliases: [] },
  { id: 'scss', extension: 'scss', aliases: [] },
  { id: 'sass', extension: 'sass', aliases: ['indented-sass'] },
  { id: 'html', extension: 'html', aliases: ['htm', 'xml'] },
  { id: 'svelte', extension: 'svelte', aliases: [] },
  { id: 'markdown', extension: 'md', aliases: ['md', 'mdx', 'svx'] },
  { id: 'diff', extension: 'diff', aliases: ['patch'] },
  { id: 'plaintext', extension: 'txt', aliases: ['text', 'plain'] },
  { id: 'c', extension: 'c', aliases: [] },
  { id: 'cpp', extension: 'cpp', aliases: ['c++', 'cc', 'cxx'] },
  { id: 'csharp', extension: 'cs', aliases: ['c#', 'dotnet'] },
  { id: 'dockerfile', extension: 'dockerfile', aliases: ['docker'] },
  { id: 'go', extension: 'go', aliases: ['golang'] },
  { id: 'graphql', extension: 'graphql', aliases: ['gql'] },
  { id: 'hcl', extension: 'hcl', aliases: ['terraform', 'tf'] },
  { id: 'java', extension: 'java', aliases: [] },
  { id: 'json', extension: 'json', aliases: ['jsonc'] },
  { id: 'kotlin', extension: 'kt', aliases: ['kts'] },
  { id: 'lua', extension: 'lua', aliases: [] },
  { id: 'php', extension: 'php', aliases: [] },
  { id: 'powershell', extension: 'ps1', aliases: ['pwsh'] },
  { id: 'python', extension: 'py', aliases: ['python3'] },
  { id: 'ruby', extension: 'rb', aliases: [] },
  { id: 'rust', extension: 'rs', aliases: [] },
  { id: 'shell', extension: 'sh', aliases: ['bash', 'zsh'] },
  { id: 'sql', extension: 'sql', aliases: [] },
  { id: 'swift', extension: 'swift', aliases: [] },
  { id: 'toml', extension: 'toml', aliases: [] },
  { id: 'yaml', extension: 'yaml', aliases: ['yml'] },
  { id: 'zig', extension: 'zig', aliases: [] },
]

setDefaults({
  typescript: typescriptConfig,
  plaintext: plaintextConfig,
})
