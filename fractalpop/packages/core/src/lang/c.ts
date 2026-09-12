/** c — keyword-based preset over the shared lexer. Generated from language keyword facts. */
import { keywordLang } from '../presets/bases.js'
import type { ParseOptions } from '../core.js'

export const config: ParseOptions = keywordLang({
  keywords: ["auto", "break", "case", "const", "continue", "default", "do", "else", "enum", "extern", "for", "goto", "if", "inline", "register", "restrict", "return", "sizeof", "static", "struct", "switch", "typedef", "union", "volatile", "while", "_Alignas", "_Alignof", "_Atomic", "_Generic", "_Noreturn", "_Static_assert", "_Thread_local"],
  typeKeywords: ["void", "char", "short", "int", "long", "float", "double", "signed", "unsigned", "_Bool", "_Complex", "_Imaginary"],
  comments: {"line":["//"],"block":true},
})
