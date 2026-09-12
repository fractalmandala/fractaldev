/** kotlin — keyword-based preset over the shared lexer. Generated from language keyword facts. */
import { keywordLang } from '../presets/bases.js'
import type { ParseOptions } from '../core.js'

export const config: ParseOptions = keywordLang({
  keywords: ["as", "break", "by", "catch", "class", "companion", "const", "constructor", "continue", "data", "do", "else", "enum", "false", "finally", "for", "fun", "get", "if", "import", "in", "infix", "init", "interface", "internal", "is", "lateinit", "noinline", "null", "object", "open", "operator", "out", "override", "package", "private", "protected", "public", "reified", "return", "sealed", "set", "suspend", "tailrec", "this", "throw", "true", "try", "typealias", "val", "var", "vararg", "when", "where", "while"],
  typeKeywords: ["Any", "Boolean", "Byte", "Char", "Double", "Float", "Int", "Long", "Nothing", "Short", "String", "Unit"],
  comments: {"line":["//"],"block":true},
})
