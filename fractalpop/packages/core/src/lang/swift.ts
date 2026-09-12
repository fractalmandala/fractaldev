/** swift — keyword-based preset over the shared lexer. Generated from language keyword facts. */
import { keywordLang } from '../presets/bases.js'
import type { ParseOptions } from '../core.js'

export const config: ParseOptions = keywordLang({
  keywords: ["as", "associatedtype", "break", "case", "catch", "class", "continue", "convenience", "default", "defer", "deinit", "didSet", "do", "dynamic", "else", "enum", "extension", "fallthrough", "false", "fileprivate", "final", "for", "func", "get", "guard", "if", "import", "in", "indirect", "infix", "init", "inout", "internal", "is", "lazy", "let", "mutating", "nil", "nonmutating", "open", "operator", "override", "precedencegroup", "private", "protocol", "public", "repeat", "required", "rethrows", "return", "self", "set", "some", "static", "struct", "subscript", "super", "switch", "throw", "throws", "true", "try", "typealias", "unowned", "var", "weak", "where", "while", "willSet"],
  typeKeywords: ["Any", "Bool", "Character", "Double", "Float", "Int", "Never", "String", "UInt", "Void"],
  comments: {"line":["//"],"block":true},
})
