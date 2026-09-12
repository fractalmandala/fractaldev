/** graphql — keyword-based preset over the shared lexer. Generated from language keyword facts. */
import { keywordLang } from '../presets/bases.js'
import type { ParseOptions } from '../core.js'

export const config: ParseOptions = keywordLang({
  keywords: ["directive", "enum", "extend", "fragment", "implements", "input", "interface", "mutation", "on", "query", "repeatable", "scalar", "schema", "subscription", "type", "union"],
  typeKeywords: ["Boolean", "Float", "ID", "Int", "String"],
  comments: {"line":["#"]},
})
