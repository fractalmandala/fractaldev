/** yaml — keyword-based preset over the shared lexer. Generated from language keyword facts. */
import { keywordLang } from '../presets/bases.js'
import type { ParseOptions } from '../core.js'

export const config: ParseOptions = keywordLang({
  keywords: ["false", "False", "FALSE", "no", "No", "NO", "null", "Null", "NULL", "off", "Off", "OFF", "on", "On", "ON", "true", "True", "TRUE", "yes", "Yes", "YES"],
  comments: {"line":["#"]},
})
