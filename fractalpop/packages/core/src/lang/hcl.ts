/** hcl — keyword-based preset over the shared lexer. Generated from language keyword facts. */
import { keywordLang } from '../presets/bases.js'
import type { ParseOptions } from '../core.js'

export const config: ParseOptions = keywordLang({
  keywords: ["false", "for", "if", "in", "null", "true"],
  comments: {"line":["//","#"],"block":true},
})
