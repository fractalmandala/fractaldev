/** sql — keyword-based preset over the shared lexer. Generated from language keyword facts. */
import { keywordLang } from '../presets/bases.js'
import type { ParseOptions } from '../core.js'

export const config: ParseOptions = keywordLang({
  keywords: ["add", "all", "alter", "and", "as", "asc", "between", "by", "case", "check", "column", "constraint", "create", "cross", "database", "default", "delete", "desc", "distinct", "drop", "else", "end", "exists", "foreign", "from", "full", "group", "having", "in", "index", "inner", "insert", "into", "is", "join", "key", "left", "like", "limit", "not", "null", "offset", "on", "or", "order", "outer", "primary", "references", "right", "select", "set", "table", "then", "union", "unique", "update", "values", "view", "when", "where", "with"],
  typeKeywords: ["bigint", "binary", "bit", "blob", "boolean", "char", "date", "datetime", "decimal", "double", "float", "int", "integer", "interval", "json", "numeric", "real", "smallint", "text", "time", "timestamp", "uuid", "varchar"],
  comments: {"line":["--"],"block":true},
  caseInsensitive: true,
})
