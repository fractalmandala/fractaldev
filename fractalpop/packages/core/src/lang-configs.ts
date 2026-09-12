/** Mutable registry that maps a canonical language id to its parse config. */
import type { ParseOptions } from './core.js'

const configRegistry = new Map<string, ParseOptions>()

export function registerLanguageConfig(id: string, config: ParseOptions): void {
  configRegistry.set(id, config)
}

export function getLanguageConfig(id: string): ParseOptions | undefined {
  return configRegistry.get(id)
}

export function resetLanguageConfigRegistry(): void {
  configRegistry.clear()
}
